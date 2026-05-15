const Product = require('../../models/Product');

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

    const headers = parseCsvLine(lines[0]).map(header => header.trim());
    return lines.slice(1).map((line, index) => {
        const values = parseCsvLine(line);
        const row = { __rowNumber: index + 2 };
        headers.forEach((header, i) => {
            row[header] = values[i] !== undefined ? values[i] : '';
        });
        return row;
    });
};

const buildPriceFilter = (query = {}) => {
    const filter = {};
    const keyword = query.search || query.keyword;

    if (keyword) {
        filter.$or = [
            { name: { $regex: keyword, $options: 'i' } },
            { sku: { $regex: keyword, $options: 'i' } },
            { 'variants.sku': { $regex: keyword, $options: 'i' } }
        ];
    }

    if (query.category) filter.category = query.category;

    if (query.priceStatus === 'missing') {
        filter.$or = [
            ...(filter.$or || []),
            { retailPrice: { $exists: false } },
            { retailPrice: null },
            { retailPrice: { $lte: 0 } }
        ];
    }

    if (query.priceStatus === 'has_price') filter.retailPrice = { $gt: 0 };
    if (query.priceStatus === 'wholesale_missing') {
        filter.$or = [
            ...(filter.$or || []),
            { wholesalePrice: { $exists: false } },
            { wholesalePrice: null },
            { wholesalePrice: { $lte: 0 } }
        ];
    }

    return filter;
};

const buildPriceSort = (sort) => {
    switch (sort) {
        case 'price_asc': return { retailPrice: 1 };
        case 'price_desc': return { retailPrice: -1 };
        case 'wholesale_asc': return { wholesalePrice: 1 };
        case 'wholesale_desc': return { wholesalePrice: -1 };
        case 'name_asc': return { name: 1 };
        case 'name_desc': return { name: -1 };
        case 'updated_asc': return { updatedAt: 1 };
        case 'updated_desc':
        default: return { updatedAt: -1 };
    }
};

exports.getPrices = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
        const skip = (page - 1) * limit;
        const filter = buildPriceFilter(req.query);
        const sort = buildPriceSort(req.query.sort);

        const [total, products] = await Promise.all([
            Product.countDocuments(filter),
            Product.find(filter)
                .select('name sku retailPrice oldPrice wholesalePrice hasVariants variants category isActive updatedAt')
                .populate('category', 'name slug')
                .skip(skip)
                .limit(limit)
                .sort(sort)
                .lean()
        ]);

        const totalPages = Math.max(Math.ceil(total / limit), 1);

        res.status(200).json({
            success: true,
            count: products.length,
            total,
            page,
            totalPages,
            limit,
            pagination: {
                total,
                page,
                pages: totalPages,
                limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            },
            data: products
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách giá', error: error.message });
    }
};

exports.getPriceStats = async (req, res) => {
    try {
        const [totalProducts, missingRetailPrice, missingWholesalePrice, hasOldPrice, priceValue] = await Promise.all([
            Product.countDocuments({}),
            Product.countDocuments({ $or: [{ retailPrice: { $exists: false } }, { retailPrice: null }, { retailPrice: { $lte: 0 } }] }),
            Product.countDocuments({ $or: [{ wholesalePrice: { $exists: false } }, { wholesalePrice: null }, { wholesalePrice: { $lte: 0 } }] }),
            Product.countDocuments({ oldPrice: { $gt: 0 } }),
            Product.aggregate([
                { $group: { _id: null, avgRetailPrice: { $avg: '$retailPrice' }, avgWholesalePrice: { $avg: '$wholesalePrice' }, maxRetailPrice: { $max: '$retailPrice' }, minRetailPrice: { $min: '$retailPrice' } } }
            ])
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalProducts,
                missingRetailPrice,
                missingWholesalePrice,
                hasOldPrice,
                avgRetailPrice: Math.round(priceValue[0]?.avgRetailPrice || 0),
                avgWholesalePrice: Math.round(priceValue[0]?.avgWholesalePrice || 0),
                maxRetailPrice: priceValue[0]?.maxRetailPrice || 0,
                minRetailPrice: priceValue[0]?.minRetailPrice || 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy thống kê giá', error: error.message });
    }
};

exports.updatePrice = async (req, res) => {
    try {
        const { retailPrice, oldPrice, wholesalePrice, variants } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });

        if (retailPrice !== undefined) product.retailPrice = Number(retailPrice);
        if (oldPrice !== undefined) product.oldPrice = Number(oldPrice) || undefined;
        if (wholesalePrice !== undefined) product.wholesalePrice = Number(wholesalePrice) || undefined;

        if (variants && Array.isArray(variants) && product.hasVariants) {
            variants.forEach(variantUpdate => {
                const variant = product.variants.id(variantUpdate._id);
                if (!variant) return;
                if (variantUpdate.retailPrice !== undefined) variant.retailPrice = Number(variantUpdate.retailPrice);
                if (variantUpdate.oldPrice !== undefined) variant.oldPrice = Number(variantUpdate.oldPrice) || undefined;
                if (variantUpdate.wholesalePrice !== undefined) variant.wholesalePrice = Number(variantUpdate.wholesalePrice) || undefined;
            });
        }

        await product.save();
        res.status(200).json({ success: true, message: 'Cập nhật giá thành công', data: product });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Lỗi khi cập nhật giá', error: error.message });
    }
};

exports.bulkUpdatePrices = async (req, res) => {
    try {
        const { updates } = req.body;

        if (!Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp danh sách cập nhật giá' });
        }

        const results = { success: 0, failed: 0, errors: [] };

        for (const update of updates) {
            try {
                const payload = {};
                if (update.retailPrice !== undefined) payload.retailPrice = Number(update.retailPrice);
                if (update.oldPrice !== undefined) payload.oldPrice = Number(update.oldPrice) || undefined;
                if (update.wholesalePrice !== undefined) payload.wholesalePrice = Number(update.wholesalePrice) || undefined;

                const product = await Product.findByIdAndUpdate(update.productId, { $set: payload }, { new: true, runValidators: true });
                if (!product) {
                    results.failed += 1;
                    results.errors.push({ productId: update.productId, message: 'Không tìm thấy sản phẩm' });
                    continue;
                }

                results.success += 1;
            } catch (error) {
                results.failed += 1;
                results.errors.push({ productId: update.productId, message: error.message });
            }
        }

        res.status(200).json({ success: true, message: `Cập nhật thành công ${results.success}/${updates.length} sản phẩm`, data: results });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi cập nhật giá hàng loạt', error: error.message });
    }
};

exports.importPrices = async (req, res) => {
    try {
        if (!req.file?.buffer) return res.status(400).json({ success: false, message: 'Vui lòng chọn file CSV để import bảng giá' });

        const rows = parseCsvBuffer(req.file.buffer);
        const errors = [];
        const operations = [];

        for (const row of rows) {
            const sku = (row.sku || '').trim();
            const retailPrice = Number(row.retailPrice || row.gia_ban || 0);
            const oldPrice = Number(row.oldPrice || row.gia_cu || 0);
            const wholesalePrice = Number(row.wholesalePrice || row.gia_si || 0);

            if (!sku) {
                errors.push({ row: row.__rowNumber, message: 'Thiếu SKU' });
                continue;
            }

            if (Number.isNaN(retailPrice) || retailPrice < 0 || Number.isNaN(oldPrice) || oldPrice < 0 || Number.isNaN(wholesalePrice) || wholesalePrice < 0) {
                errors.push({ row: row.__rowNumber, sku, message: 'Giá không hợp lệ' });
                continue;
            }

            const payload = { retailPrice };
            if (oldPrice > 0) payload.oldPrice = oldPrice;
            if (wholesalePrice > 0) payload.wholesalePrice = wholesalePrice;

            operations.push({ updateOne: { filter: { sku }, update: { $set: payload } } });
        }

        if (errors.length) {
            return res.status(400).json({ success: false, message: `File có ${errors.length} lỗi. Vui lòng sửa trước khi import.`, errors, validRows: operations.length });
        }

        const result = operations.length ? await Product.bulkWrite(operations, { ordered: false }) : null;
        res.status(200).json({
            success: true,
            message: `Import bảng giá thành công ${operations.length} dòng`,
            data: { totalRows: rows.length, processedRows: operations.length, matchedCount: result?.matchedCount || 0, modifiedCount: result?.modifiedCount || 0 }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi import bảng giá', error: error.message });
    }
};

exports.exportPrices = async (req, res) => {
    try {
        const products = await Product.find(buildPriceFilter(req.query))
            .select('sku name retailPrice oldPrice wholesalePrice category')
            .populate('category', 'name')
            .sort(buildPriceSort(req.query.sort))
            .lean();

        const headers = ['sku', 'name', 'category', 'retailPrice', 'oldPrice', 'wholesalePrice'];
        const rows = products.map(product => [
            product.sku,
            product.name,
            product.category?.name || '',
            product.retailPrice || 0,
            product.oldPrice || '',
            product.wholesalePrice || ''
        ].map(csvEscape).join(','));

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="prices-${Date.now()}.csv"`);
        res.status(200).send(`\uFEFF${headers.join(',')}\n${rows.join('\n')}`);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi export bảng giá', error: error.message });
    }
};

exports.getPriceHistory = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Tính năng lịch sử thay đổi giá đang được phát triển',
            data: []
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi lấy lịch sử giá', error: error.message });
    }
};