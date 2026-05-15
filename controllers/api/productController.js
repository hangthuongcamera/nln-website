const Product = require('../../models/Product');
const Category = require('../../models/Category');
const slugify = require('slugify');

const toBoolean = (value) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'boolean') return value;
    return ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase());
};

const buildProductFilter = (query = {}) => {
    const filter = {};
    const keyword = query.search || query.keyword;

    if (keyword) {
        filter.$or = [
            { name: { $regex: keyword, $options: 'i' } },
            { sku: { $regex: keyword, $options: 'i' } },
            { 'variants.sku': { $regex: keyword, $options: 'i' } },
            { 'variants.variantName': { $regex: keyword, $options: 'i' } }
        ];
    }

    if (query.category) filter.category = query.category;

    const active = toBoolean(query.isActive || query.status);
    if (active !== undefined) filter.isActive = active;

    if (query.stockStatus === 'in_stock') filter.stock = { $gt: 0 };
    if (query.stockStatus === 'out_of_stock') filter.stock = { $lte: 0 };
    if (query.stockStatus === 'low_stock') filter.stock = { $gt: 0, $lte: Number(query.lowStockThreshold) || 10 };

    if (query.imageStatus === 'missing') filter.$or = [...(filter.$or || []), { images: { $exists: false } }, { images: { $size: 0 } }];
    if (query.imageStatus === 'has_image') filter.images = { $exists: true, $ne: [] };

    if (query.priceStatus === 'missing') filter.$or = [...(filter.$or || []), { retailPrice: { $exists: false } }, { retailPrice: null }, { retailPrice: { $lte: 0 } }];
    if (query.priceStatus === 'has_price') filter.retailPrice = { $gt: 0 };

    if (query.flag === 'hot') filter['flags.isHot'] = true;
    if (query.flag === 'new') filter['flags.isNewProduct'] = true;
    if (query.flag === 'flash_sale') filter['flags.isFlashSale'] = true;

    if (query.hasVariants !== undefined) filter.hasVariants = toBoolean(query.hasVariants);

    return filter;
};

const buildSort = (sort) => {
    switch (sort) {
        case 'name_asc': return { name: 1 };
        case 'name_desc': return { name: -1 };
        case 'price_asc': return { retailPrice: 1 };
        case 'price_desc': return { retailPrice: -1 };
        case 'stock_asc': return { stock: 1 };
        case 'stock_desc': return { stock: -1 };
        case 'oldest': return { createdAt: 1 };
        case 'newest':
        default: return { createdAt: -1 };
    }
};

const csvEscape = (value) => {
    if (value === undefined || value === null) return '';
    const text = String(value);
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const parseCsvLine = (line) => {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
        const char = line[i];
        const next = line[i + 1];

        if (char === '"' && inQuotes && next === '"') {
            current += '"';
            i += 1;
        } else if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    values.push(current.trim());
    return values;
};

const parseCsvBuffer = (buffer) => {
    const content = buffer.toString('utf8').replace(/^\uFEFF/, '');
    const lines = content.split(/\r?\n/).filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = parseCsvLine(lines[0]).map(h => h.trim());
    return lines.slice(1).map((line, index) => {
        const values = parseCsvLine(line);
        const row = { __rowNumber: index + 2 };
        headers.forEach((header, i) => { row[header] = values[i] !== undefined ? values[i] : ''; });
        return row;
    });
};

const findCategoryForImport = async (categoryValue) => {
    if (!categoryValue) return null;
    const conditions = [{ slug: categoryValue }, { name: categoryValue }];
    if (/^[0-9a-fA-F]{24}$/.test(categoryValue)) conditions.unshift({ _id: categoryValue });
    return Category.findOne({ $or: conditions }).select('_id').lean();
};

const buildProductPayloadFromImportRow = async (row, existingProduct = null) => {
    const name = (row.name || row.ten_san_pham || '').trim();
    const sku = (row.sku || '').trim();
    const categoryValue = (row.categoryId || row.category || row.danh_muc || '').trim();
    const category = await findCategoryForImport(categoryValue);

    const payload = {
        name,
        sku,
        slug: slugify((row.slug || name || sku).trim(), { lower: true, strict: true, locale: 'vi' }),
        retailPrice: Number(row.retailPrice || row.gia_ban || 0),
        oldPrice: Number(row.oldPrice || row.gia_cu || 0) || undefined,
        wholesalePrice: Number(row.wholesalePrice || row.gia_si || 0) || undefined,
        stock: Number(row.stock || row.ton_kho || 0),
        brand: row.brand || row.thuong_hieu || undefined,
        shortDescription: row.shortDescription || row.mo_ta_ngan || undefined,
        description: row.description || row.mo_ta || undefined,
        isActive: toBoolean(row.isActive || row.hien_thi) !== false,
        flags: {
            isHot: toBoolean(row.isHot || row.hot) === true,
            isNewProduct: toBoolean(row.isNewProduct || row.moi) === true,
            isFlashSale: toBoolean(row.isFlashSale || row.flash_sale) === true
        }
    };

    const images = row.images || row.hinh_anh;
    if (images) payload.images = images.split('|').map(img => img.trim()).filter(Boolean);
    if (category) payload.category = category._id;
    else if (existingProduct?.category) payload.category = existingProduct.category;

    return payload;
};

exports.getAllProducts = async (req, res) => {
    try {
        const filter = buildProductFilter(req.query);
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const requestedLimit = parseInt(req.query.limit, 10) || 20;
        const limit = Math.min(Math.max(requestedLimit, 1), 100);
        const startIndex = (page - 1) * limit;
        const sort = buildSort(req.query.sort);

        const [total, products] = await Promise.all([
            Product.countDocuments(filter),
            Product.find(filter).skip(startIndex).limit(limit).populate('category', 'name slug').sort(sort).lean()
        ]);

        const totalPages = Math.max(Math.ceil(total / limit), 1);

        res.status(200).json({
            success: true,
            count: products.length,
            total,
            page,
            totalPages,
            limit,
            pagination: { total, page, pages: totalPages, limit, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
            data: products
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách sản phẩm', error: error.message });
    }
};

exports.getProductStats = async (req, res) => {
    try {
        const lowStockThreshold = Number(req.query.lowStockThreshold) || 10;
        const duplicateSkus = await Product.aggregate([
            { $group: { _id: '$sku', count: { $sum: 1 } } },
            { $match: { _id: { $ne: null }, count: { $gt: 1 } } },
            { $count: 'count' }
        ]);

        const [total, active, inactive, outOfStock, lowStock, missingImages, missingPrice, missingDescription, missingCategory, negativeStock, badSlug, hot, newProducts, flashSale, hasVariants] = await Promise.all([
            Product.countDocuments({}),
            Product.countDocuments({ isActive: true }),
            Product.countDocuments({ isActive: false }),
            Product.countDocuments({ stock: { $lte: 0 } }),
            Product.countDocuments({ stock: { $gt: 0, $lte: lowStockThreshold } }),
            Product.countDocuments({ $or: [{ images: { $exists: false } }, { images: { $size: 0 } }] }),
            Product.countDocuments({ $or: [{ retailPrice: { $exists: false } }, { retailPrice: null }, { retailPrice: { $lte: 0 } }] }),
            Product.countDocuments({ $or: [{ description: { $exists: false } }, { description: '' }, { description: null }] }),
            Product.countDocuments({ $or: [{ category: { $exists: false } }, { category: null }] }),
            Product.countDocuments({ stock: { $lt: 0 } }),
            Product.countDocuments({ $or: [{ slug: { $exists: false } }, { slug: '' }, { slug: /[^a-z0-9-]/ }] }),
            Product.countDocuments({ 'flags.isHot': true }),
            Product.countDocuments({ 'flags.isNewProduct': true }),
            Product.countDocuments({ 'flags.isFlashSale': true }),
            Product.countDocuments({ hasVariants: true })
        ]);

        res.status(200).json({
            success: true,
            data: {
                total, active, inactive, outOfStock, lowStock, missingImages, missingPrice, missingDescription,
                missingCategory, negativeStock, badSlug, duplicateSku: duplicateSkus[0]?.count || 0,
                hot, newProducts, flashSale, hasVariants, lowStockThreshold
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy thống kê sản phẩm', error: error.message });
    }
};

exports.bulkUpdateProducts = async (req, res) => {
    try {
        const { ids, action, value } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ success: false, message: 'Vui lòng chọn ít nhất một sản phẩm' });

        const filter = { _id: { $in: ids } };
        let update = {};

        switch (action) {
            case 'activate': update = { $set: { isActive: true } }; break;
            case 'deactivate': update = { $set: { isActive: false } }; break;
            case 'change_category':
                if (!value) return res.status(400).json({ success: false, message: 'Vui lòng chọn danh mục cần đổi' });
                update = { $set: { category: value } };
                break;
            case 'set_hot': update = { $set: { 'flags.isHot': true } }; break;
            case 'unset_hot': update = { $set: { 'flags.isHot': false } }; break;
            case 'set_new': update = { $set: { 'flags.isNewProduct': true } }; break;
            case 'unset_new': update = { $set: { 'flags.isNewProduct': false } }; break;
            case 'set_flash_sale': update = { $set: { 'flags.isFlashSale': true } }; break;
            case 'unset_flash_sale': update = { $set: { 'flags.isFlashSale': false } }; break;
            case 'delete': {
                const result = await Product.deleteMany(filter);
                return res.status(200).json({ success: true, message: `Đã xóa ${result.deletedCount} sản phẩm`, modifiedCount: result.deletedCount });
            }
            default:
                return res.status(400).json({ success: false, message: 'Thao tác hàng loạt không hợp lệ' });
        }

        const result = await Product.updateMany(filter, update, { runValidators: true });
        res.status(200).json({ success: true, message: `Đã cập nhật ${result.modifiedCount} sản phẩm`, modifiedCount: result.modifiedCount });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi thao tác hàng loạt', error: error.message });
    }
};

exports.exportProducts = async (req, res) => {
    try {
        const filter = buildProductFilter(req.query);
        const products = await Product.find(filter).populate('category', 'name slug').sort(buildSort(req.query.sort)).lean();
        const headers = ['sku', 'name', 'slug', 'category', 'categoryId', 'brand', 'retailPrice', 'oldPrice', 'wholesalePrice', 'stock', 'isActive', 'isHot', 'isNewProduct', 'isFlashSale', 'images', 'shortDescription', 'description'];
        const rows = products.map(product => [
            product.sku, product.name, product.slug, product.category?.name || '', product.category?._id || '',
            product.brand || '', product.retailPrice || 0, product.oldPrice || '', product.wholesalePrice || '',
            product.stock || 0, product.isActive !== false, product.flags?.isHot || false, product.flags?.isNewProduct || false,
            product.flags?.isFlashSale || false, (product.images || []).join('|'), product.shortDescription || '', product.description || ''
        ].map(csvEscape).join(','));

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="products-${Date.now()}.csv"`);
        res.status(200).send(`\uFEFF${headers.join(',')}\n${rows.join('\n')}`);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi export sản phẩm', error: error.message });
    }
};

exports.importProducts = async (req, res) => {
    try {
        if (!req.file?.buffer) return res.status(400).json({ success: false, message: 'Vui lòng chọn file CSV để import' });

        const rows = parseCsvBuffer(req.file.buffer);
        const errors = [];
        const operations = [];

        for (const row of rows) {
            const sku = (row.sku || '').trim();
            const name = (row.name || row.ten_san_pham || '').trim();

            if (!sku) { errors.push({ row: row.__rowNumber, message: 'Thiếu SKU' }); continue; }
            if (!name) { errors.push({ row: row.__rowNumber, sku, message: 'Thiếu tên sản phẩm' }); continue; }
            if (Number(row.retailPrice || row.gia_ban || 0) < 0 || Number(row.stock || row.ton_kho || 0) < 0) {
                errors.push({ row: row.__rowNumber, sku, message: 'Giá hoặc tồn kho không hợp lệ' });
                continue;
            }

            const existingProduct = await Product.findOne({ sku }).lean();
            const payload = await buildProductPayloadFromImportRow(row, existingProduct);
            if (!payload.category) { errors.push({ row: row.__rowNumber, sku, message: 'Thiếu hoặc không tìm thấy danh mục' }); continue; }

            operations.push({ updateOne: { filter: { sku }, update: { $set: payload }, upsert: true } });
        }

        if (errors.length) return res.status(400).json({ success: false, message: `File có ${errors.length} lỗi. Vui lòng sửa trước khi import.`, errors, validRows: operations.length });

        const result = operations.length ? await Product.bulkWrite(operations, { ordered: false }) : null;
        res.status(200).json({
            success: true,
            message: `Import thành công ${operations.length} dòng`,
            data: { totalRows: rows.length, processedRows: operations.length, upsertedCount: result?.upsertedCount || 0, modifiedCount: result?.modifiedCount || 0 }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi import sản phẩm', error: error.message });
    }
};

exports.getProductDataQuality = async (req, res) => {
    try {
        const issue = req.query.issue || 'all';
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
        const skip = (page - 1) * limit;

        const duplicateGroups = await Product.aggregate([
            { $group: { _id: '$sku', count: { $sum: 1 }, ids: { $push: '$_id' } } },
            { $match: { _id: { $ne: null }, count: { $gt: 1 } } }
        ]);
        const duplicateSkuIds = duplicateGroups.flatMap(item => item.ids);

        const filters = {
            missing_images: { $or: [{ images: { $exists: false } }, { images: { $size: 0 } }] },
            missing_description: { $or: [{ description: { $exists: false } }, { description: '' }, { description: null }] },
            missing_price: { $or: [{ retailPrice: { $exists: false } }, { retailPrice: null }, { retailPrice: { $lte: 0 } }] },
            missing_category: { $or: [{ category: { $exists: false } }, { category: null }] },
            duplicate_sku: { _id: { $in: duplicateSkuIds } },
            negative_stock: { stock: { $lt: 0 } },
            bad_slug: { $or: [{ slug: { $exists: false } }, { slug: '' }, { slug: /[^a-z0-9-]/ }] }
        };

        const summaryEntries = await Promise.all(Object.entries(filters).map(async ([key, filter]) => [key, await Product.countDocuments(filter)]));
        const summary = Object.fromEntries(summaryEntries);
        const filter = issue === 'all' ? { $or: Object.values(filters) } : (filters[issue] || {});
        const [total, products] = await Promise.all([
            Product.countDocuments(filter),
            Product.find(filter).populate('category', 'name slug').skip(skip).limit(limit).sort({ updatedAt: -1 }).lean()
        ]);

        const data = products.map(product => {
            const dataIssues = [];
            if (!product.images || product.images.length === 0) dataIssues.push('Thiếu ảnh');
            if (!product.description) dataIssues.push('Thiếu mô tả');
            if (!product.retailPrice || product.retailPrice <= 0) dataIssues.push('Thiếu giá');
            if (!product.category) dataIssues.push('Chưa có danh mục');
            if (duplicateSkuIds.some(id => String(id) === String(product._id))) dataIssues.push('Trùng SKU');
            if (product.stock < 0) dataIssues.push('Tồn kho âm');
            if (!product.slug || /[^a-z0-9-]/.test(product.slug)) dataIssues.push('Slug lỗi');
            return { ...product, dataIssues };
        });

        const pages = Math.max(Math.ceil(total / limit), 1);
        res.status(200).json({ success: true, data, summary, pagination: { total, page, pages, limit, hasNextPage: page < pages, hasPrevPage: page > 1 } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi kiểm tra dữ liệu sản phẩm', error: error.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category', 'name slug');
        if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server hoặc ID không hợp lệ', error: error.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, message: 'Thêm sản phẩm thành công', data: product });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Lỗi khi thêm sản phẩm', error: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        res.status(200).json({ success: true, message: 'Cập nhật thành công', data: product });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Lỗi cập nhật', error: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        res.status(200).json({ success: true, message: 'Đã xóa sản phẩm' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi xóa', error: error.message });
    }
};