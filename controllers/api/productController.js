const Product = require('../../models/Product');
const Category = require('../../models/Category');
const slugify = require('slugify');
const ExcelJS = require('exceljs');
const mongoose = require('mongoose');

/**
 * @desc    Lấy tất cả sản phẩm với bộ lọc và phân trang
 * @route   GET /api/v1/products
 * @access  Public
 */
exports.getAllProducts = async (req, res, next) => {
    try {
        const { search, category, isActive, stockStatus, imageStatus, priceStatus, flag, sort, page = 1, limit = 20 } = req.query;

        let query = { };

        // Xây dựng query từ các tham số filter
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { name: searchRegex },
                { sku: searchRegex },
                { 'variants.sku': searchRegex }
            ];
        }
        if (category) query.category = category;
        if (isActive !== undefined && isActive !== '') query.isActive = isActive === 'true';

        if (stockStatus) {
            if (stockStatus === 'in_stock') query.stock = { $gt: 10 };
            else if (stockStatus === 'low_stock') query.stock = { $gt: 0, $lte: 10 };
            else if (stockStatus === 'out_of_stock') query.stock = { $lte: 0 };
        }

        if (imageStatus) {
            if (imageStatus === 'missing') query.images = { $size: 0 };
            else if (imageStatus === 'has_image') query.images = { $not: { $size: 0 } };
        }

        if (priceStatus) {
            if (priceStatus === 'missing') query.retailPrice = { $in: [null, 0] };
            else if (priceStatus === 'has_price') query.retailPrice = { $gt: 0 };
        }

        if (flag) {
            if (flag === 'hot') query['flags.isHot'] = true;
            else if (flag === 'new') query['flags.isNewProduct'] = true;
            else if (flag === 'flash_sale') query['flags.isFlashSale'] = true;
        }

        // Sắp xếp
        let sortObj = {};
        switch (sort) {
            case 'oldest': sortObj = { createdAt: 1 }; break;
            case 'name_asc': sortObj = { name: 1 }; break;
            case 'name_desc': sortObj = { name: -1 }; break;
            case 'price_asc': sortObj = { retailPrice: 1 }; break;
            case 'price_desc': sortObj = { retailPrice: -1 }; break;
            case 'stock_asc': sortObj = { stock: 1 }; break;
            case 'stock_desc': sortObj = { stock: -1 }; break;
            default: sortObj = { createdAt: -1 }; break;
        }

        // Phân trang
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        const total = await Product.countDocuments(query);
        const products = await Product.find(query)
            .populate('category', 'name')
            .sort(sortObj)
            .skip(skip)
            .limit(limitNum)
            .lean();

        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum) || 1,
                limit: limitNum
            }
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách sản phẩm:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách sản phẩm', error: error.message });
    }
};

/**
 * @desc    Lấy thống kê sản phẩm
 * @route   GET /api/v1/products/stats
 * @access  Private/Admin
 */
exports.getProductStats = async (req, res, next) => {
    try {
        const [
            totalCount,
            activeCount,
            inactiveCount,
            outOfStockCount,
            missingImagesCount,
            missingPriceCount
        ] = await Promise.all([
            Product.countDocuments(),
            Product.countDocuments({ isActive: true }),
            Product.countDocuments({ isActive: false }),
            Product.countDocuments({ stock: { $lte: 0 } }),
            Product.countDocuments({ $or: [{ images: { $exists: false } }, { images: { $size: 0 } }] }),
            Product.countDocuments({ retailPrice: { $in: [null, 0] } })
        ]);

        res.status(200).json({
            success: true,
            data: {
                total: totalCount,
                active: activeCount,
                inactive: inactiveCount,
                outOfStock: outOfStockCount,
                missingImages: missingImagesCount,
                missingPrice: missingPriceCount
            }
        });
    } catch (error) {
        console.error('Lỗi khi lấy thống kê sản phẩm:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy thống kê', error: error.message });
    }
};

/**
 * @desc    Export danh sách sản phẩm ra file Excel
 * @route   GET /api/v1/products/export
 * @access  Private/Admin
 */
exports.exportProducts = async (req, res, next) => {
    try {
        const { search, category, isActive, stockStatus, imageStatus, priceStatus, flag, sort } = req.query;

    let query = {};

    // Xây dựng query từ các tham số filter
    if (search) {
        const searchRegex = new RegExp(search, 'i');
        query.$or = [
            { name: searchRegex },
            { sku: searchRegex },
            { 'variants.sku': searchRegex }
        ];
    }

    if (category) query.category = category;
    if (isActive) query.isActive = isActive === 'true';

    if (stockStatus) {
        if (stockStatus === 'in_stock') query.stock = { $gt: 10 };
        else if (stockStatus === 'low_stock') query.stock = { $gt: 0, $lte: 10 };
        else if (stockStatus === 'out_of_stock') query.stock = { $lte: 0 };
    }

    if (imageStatus) {
        if (imageStatus === 'missing') query.images = { $size: 0 };
        else if (imageStatus === 'has_image') query.images = { $not: { $size: 0 } };
    }

    if (priceStatus) {
        if (priceStatus === 'missing') query.retailPrice = { $in: [null, 0] };
        else if (priceStatus === 'has_price') query.retailPrice = { $gt: 0 };
    }

    if (flag) {
        if (flag === 'hot') query['flags.isHot'] = true;
        else if (flag === 'new') query['flags.isNewProduct'] = true;
        else if (flag === 'flash_sale') query['flags.isFlashSale'] = true;
    }

    // Lấy tất cả sản phẩm khớp với bộ lọc, không phân trang
    const products = await Product.find(query)
        .populate('category', 'name')
        .sort(sort || '-createdAt')
        .lean(); // .lean() để tăng tốc độ truy vấn cho mục đích chỉ đọc

    // Tạo file Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sản phẩm');

    // Định nghĩa các cột
    worksheet.columns = [
        { header: 'SKU', key: 'sku', width: 25 },
        { header: 'Tên Sản Phẩm', key: 'name', width: 50 },
        { header: 'Danh Mục', key: 'category', width: 30 },
        { header: 'Giá Bán Lẻ', key: 'retailPrice', width: 15, style: { numFmt: '#,##0' } },
        { header: 'Giá Cũ', key: 'oldPrice', width: 15, style: { numFmt: '#,##0' } },
        { header: 'Tồn Kho', key: 'stock', width: 12 },
        { header: 'Trạng Thái', key: 'isActive', width: 15 },
        { header: 'Hình ảnh (cách nhau bởi dấu phẩy)', key: 'images', width: 60 },
        { header: 'Biến Thể (JSON)', key: 'variants', width: 50 },
    ];

    // Thêm style cho header
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF007BFF' } // Màu xanh primary
    };

    // Thêm dữ liệu sản phẩm vào các dòng
    products.forEach(product => {
        worksheet.addRow({
            sku: product.sku,
            name: product.name,
            category: product.category ? product.category.name : 'Chưa phân loại',
            retailPrice: product.retailPrice || 0,
            oldPrice: product.oldPrice || 0,
            stock: product.stock || 0,
            isActive: product.isActive ? 'Hiển thị' : 'Ẩn',
            images: product.images && product.images.length > 0 ? product.images.join(', ') : '',
            variants: product.variants && product.variants.length > 0 ? JSON.stringify(product.variants) : '',
        });
    });

    // Thiết lập header để trình duyệt tải file về
    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    const fileName = `NhatLinhNhi_Products_${new Date().toISOString().slice(0, 10)}.xlsx`;
    res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName}"`
    );

    // Ghi workbook vào response
    await workbook.xlsx.write(res);
    res.end();
    } catch (error) {
        console.error('Lỗi khi xuất sản phẩm ra Excel:', error);
        // Không thể gửi response json ở đây vì header đã được set cho file download.
        // Lỗi sẽ được ghi nhận ở server, và phía client sẽ nhận được file tải về bị lỗi.
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Lỗi server khi xuất file Excel', error: error.message });
        }
    }
};

/**
 * @desc    Nhập sản phẩm từ file
 * @route   POST /api/v1/products/import
 * @access  Private/Admin
 */
exports.importProducts = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Không có file nào được tải lên.' });
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(req.file.buffer);
        const worksheet = workbook.getWorksheet(1);

        if (!worksheet) {
            return res.status(400).json({ success: false, message: 'File Excel không có sheet nào.' });
        }

        const productsToProcess = [];
        const errors = [];
        let successCount = 0;
        const totalRows = worksheet.rowCount > 1 ? worksheet.rowCount - 1 : 0; // Bỏ qua dòng tiêu đề

        // Cache danh mục để tránh truy vấn DB trong vòng lặp, tăng hiệu suất
        const categories = await Category.find({}).lean();
        const categoryMap = categories.reduce((map, cat) => {
            map[cat.name.toLowerCase()] = cat._id;
            return map;
        }, {});

        // Bắt đầu từ dòng 2 để bỏ qua tiêu đề
        for (let i = 2; i <= worksheet.rowCount; i++) {
            const row = worksheet.getRow(i);
            const sku = row.getCell(1).value?.toString().trim();
            const name = row.getCell(2).value?.toString().trim();
            const categoryName = row.getCell(3).value?.toString().trim();
            const imagesString = row.getCell(8).value?.toString().trim();
            const variantsString = row.getCell(9).value?.toString().trim();

            // Kiểm tra dữ liệu cơ bản
            if (!sku) {
                errors.push({ row: i, reason: 'Thiếu SKU' });
                continue;
            }
            if (!name) {
                errors.push({ row: i, reason: 'Thiếu Tên Sản Phẩm' });
                continue;
            }

            const productData = {
                sku,
                name,
                retailPrice: parseFloat(row.getCell(4).value) || 0,
                oldPrice: parseFloat(row.getCell(5).value) || 0,
                stock: parseInt(row.getCell(6).value, 10) || 0,
                isActive: row.getCell(7).value?.toString().toLowerCase() !== 'ẩn', // Mặc định là hiển thị, trừ khi ghi rõ là 'Ẩn'
                slug: slugify(name, { lower: true, strict: true, locale: 'vi' })
            };
            
            if (categoryName) {
                const categoryId = categoryMap[categoryName.toLowerCase()];
                if (categoryId) {
                    productData.category = categoryId;
                } else {
                    errors.push({ row: i, reason: `Danh mục '${categoryName}' không tồn tại` });
                    continue;
                }
            }

            if (imagesString) {
                // Tách chuỗi URL bằng dấu phẩy, sau đó trim khoảng trắng và lọc bỏ các chuỗi rỗng
                const imageUrls = imagesString.split(',').map(url => url.trim()).filter(url => url);
                if (imageUrls.length > 0) {
                    productData.images = imageUrls;
                }
            }

            if (variantsString) {
                try {
                    const variants = JSON.parse(variantsString);
                    if (Array.isArray(variants)) {
                        productData.variants = variants;
                        productData.hasVariants = variants.length > 0;
                    } else {
                        errors.push({ row: i, reason: `Cột 'Biến Thể' phải là một chuỗi JSON chứa một mảng (array).` });
                        continue;
                    }
                } catch (e) {
                    errors.push({ row: i, reason: `Lỗi cú pháp JSON trong cột 'Biến Thể'.` });
                    continue;
                }
            }

            productsToProcess.push({
                updateOne: {
                    filter: { sku: productData.sku },
                    update: { $set: productData },
                    upsert: true // Tạo mới nếu SKU chưa tồn tại
                }
            });
        }

        // Ghi hàng loạt vào DB để tối ưu hiệu suất
        if (productsToProcess.length > 0) {
            try {
                // Use ordered: false to attempt all operations and report errors at the end.
                const result = await Product.bulkWrite(productsToProcess, { ordered: false });
                
                successCount = (result.upsertedCount || 0) + (result.modifiedCount || 0);

                if (result.hasWriteErrors()) {
                    const writeErrors = result.getWriteErrors();
                    writeErrors.forEach(err => {
                        // Example error message: E11000 duplicate key error collection: ... dup key: { slug: "the-slug" }
                        const match = err.errmsg.match(/dup key: { (.+?) }/);
                        const dupKeyInfo = match ? match[1].replace(/"/g, "'") : 'không xác định';
                        
                        const failedOp = err.getOperation();
                        const failedSku = failedOp.updateOne.filter.sku;

                        // Find the row number for the failed SKU for better error reporting.
                        let rowNum = 'N/A';
                        for (let i = 2; i <= worksheet.rowCount; i++) {
                            if (worksheet.getRow(i).getCell(1).value?.toString().trim() === failedSku) {
                                rowNum = i;
                                break;
                            }
                        }

                        errors.push({
                            row: rowNum,
                            reason: `Lỗi trùng lặp dữ liệu. Chi tiết: ${dupKeyInfo}`
                        });
                    });
                }
            } catch (e) {
                console.error('Lỗi nghiêm trọng trong quá trình bulkWrite:', e);
                return res.status(500).json({ success: false, message: 'Lỗi server nghiêm trọng khi ghi dữ liệu hàng loạt.', error: e.message });
            }
        }

        res.status(200).json({
            success: true,
            message: 'Hoàn tất quá trình nhập file.',
            data: {
                totalRows,
                successCount: totalRows - errors.length,
                errorCount: errors.length,
                errors
            }
        });

    } catch (error) {
        console.error('Lỗi khi nhập sản phẩm từ Excel:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi xử lý file Excel', error: error.message });
    }
};

/**
 * @desc    Lấy chi tiết sản phẩm
 * @route   GET /api/v1/products/:id
 * @access  Public
 */
exports.getProductById = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: `ID sản phẩm không hợp lệ: ${req.params.id}` });
        }

        const product = await Product.findById(req.params.id).populate('category', 'name');

        if (!product) {
            return res.status(404).json({ success: false, message: `Không tìm thấy sản phẩm với id ${req.params.id}` });
        }
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        console.error(`Lỗi khi lấy chi tiết sản phẩm ${req.params.id}:`, error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy chi tiết sản phẩm', error: error.message });
    }
};

/**
 * @desc    Lấy nhiều sản phẩm dựa trên danh sách ID
 * @route   POST /api/v1/products/by-ids
 * @access  Public
 */
exports.getProductsByIds = async (req, res, next) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp một danh sách ID sản phẩm.' });
        }

        // Lọc ra các ID hợp lệ để tránh lỗi truy vấn
        const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));

        const products = await Product.find({
            '_id': { $in: validIds }
        }).populate('category', 'name').lean();

        // Sắp xếp lại kết quả trả về theo đúng thứ tự của mảng `ids` ban đầu
        // để đảm bảo tính nhất quán trên giao diện so sánh.
        const productMap = products.reduce((map, product) => {
            map[product._id.toString()] = product;
            return map;
        }, {});

        const sortedProducts = validIds.map(id => productMap[id]).filter(p => p); // Lọc bỏ các id không tìm thấy

        res.status(200).json({ success: true, data: sortedProducts });
    } catch (error) {
        console.error('Lỗi khi lấy sản phẩm theo danh sách ID:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy dữ liệu sản phẩm', error: error.message });
    }
};

/**
 * @desc    Tạo sản phẩm mới
 * @route   POST /api/v1/products
 * @access  Private/Admin
 */
exports.createProduct = async (req, res, next) => {
    try {
        // Kiểm tra SKU trùng lặp trước khi tạo
        if (req.body.sku) {
            const existingProduct = await Product.findOne({ sku: req.body.sku });
            if (existingProduct) {
                return res.status(400).json({ success: false, message: `SKU '${req.body.sku}' đã tồn tại.` });
            }
        }

        const product = await Product.create(req.body);
        res.status(201).json({ success: true, data: product });
    } catch (error) {
        console.error('Lỗi khi tạo sản phẩm:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi tạo sản phẩm', error: error.message });
    }
};

/**
 * @desc    Cập nhật sản phẩm
 * @route   PUT /api/v1/products/:id
 * @access  Private/Admin
 */
exports.updateProduct = async (req, res, next) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: `Không tìm thấy sản phẩm với id ${req.params.id}` });
        }

        // Logic đặc biệt cho Flash Sale khi cập nhật cờ
        if (req.body.flags && req.body.flags.isFlashSale !== undefined) {
            const isCurrentlyFlashSale = product.flags?.isFlashSale;
            const newIsFlashSale = req.body.flags.isFlashSale;

            if (newIsFlashSale === true && !isCurrentlyFlashSale) {
                // Nếu chuyển từ không Flash Sale sang Flash Sale
                // Lưu giá bán lẻ hiện tại vào oldPrice và cập nhật retailPrice thành flashSalePrice
                if (req.body.flashSalePrice !== undefined && req.body.flashSalePrice < product.retailPrice) {
                    req.body.oldPrice = product.retailPrice; // Lưu giá cũ
                    req.body.retailPrice = req.body.flashSalePrice; // Cập nhật giá Flash Sale
                }
            } else if (newIsFlashSale === false && isCurrentlyFlashSale) {
                // Nếu bỏ Flash Sale, khôi phục giá bán lẻ từ oldPrice và xóa oldPrice
                req.body.retailPrice = product.oldPrice || product.retailPrice; // Khôi phục giá
                req.body.oldPrice = 0; // Xóa giá cũ
            }
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: product });
    } catch (error) {
        console.error('Lỗi khi cập nhật sản phẩm:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật sản phẩm', error: error.message });
    }
};

/**
 * @desc    Xóa sản phẩm
 * @route   DELETE /api/v1/products/:id
 * @access  Private/Admin
 */
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: `Không tìm thấy sản phẩm với id ${req.params.id}` });
        }

        await product.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        console.error('Lỗi khi xóa sản phẩm:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi xóa sản phẩm', error: error.message });
    }
};

// Các hàm khác như bulkUpdateProducts, getProductDataQuality...
exports.bulkUpdateProducts = async (req, res, next) => {
    const { action, productIds } = req.body;

    if (!action || !productIds || !Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({ success: false, message: 'Hành động và danh sách ID sản phẩm là bắt buộc.' });
    }

    try {
        let result;
        switch (action) {
            case 'delete':
                result = await Product.deleteMany({ _id: { $in: productIds } });
                if (result.deletedCount === 0) {
                    return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm nào để xóa.' });
                }
                return res.status(200).json({ success: true, message: `Đã xóa thành công ${result.deletedCount} sản phẩm.` });
            
            // Tương lai có thể thêm các case khác ở đây

            default:
                return res.status(400).json({ success: false, message: 'Hành động không được hỗ trợ.' });
        }
    } catch (error) {
        console.error('Lỗi khi thực hiện thao tác hàng loạt:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi thực hiện thao tác hàng loạt.', error: error.message });
    }
};

exports.getProductDataQuality = async (req, res, next) => {
    try {
        res.status(200).json({ success: true, message: 'Chức năng đang được phát triển' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};