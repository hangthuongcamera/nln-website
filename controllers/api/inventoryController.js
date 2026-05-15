const Product = require('../../models/Product');

/**
 * @desc    Lấy danh sách tồn kho với phân trang và bộ lọc
 * @route   GET /api/v1/inventory
 * @access  Private (Admin, Warehouse Staff)
 */
exports.getInventory = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
        const skip = (page - 1) * limit;
        const keyword = req.query.search || req.query.keyword;
        const lowStockThreshold = Number(req.query.lowStockThreshold) || 10;

        // Build filter
        const filter = {};
        
        if (keyword) {
            filter.$or = [
                { name: { $regex: keyword, $options: 'i' } },
                { sku: { $regex: keyword, $options: 'i' } },
                { 'variants.sku': { $regex: keyword, $options: 'i' } }
            ];
        }

        if (req.query.category) {
            filter.category = req.query.category;
        }

        // Stock status filter
        if (req.query.stockStatus === 'out_of_stock') {
            filter.stock = { $lte: 0 };
        } else if (req.query.stockStatus === 'low_stock') {
            filter.stock = { $gt: 0, $lte: lowStockThreshold };
        } else if (req.query.stockStatus === 'in_stock') {
            filter.stock = { $gt: lowStockThreshold };
        } else if (req.query.stockStatus === 'negative') {
            filter.stock = { $lt: 0 };
        }

        // Sort
        let sort = { updatedAt: -1 };
        if (req.query.sort === 'stock_asc') sort = { stock: 1 };
        else if (req.query.sort === 'stock_desc') sort = { stock: -1 };
        else if (req.query.sort === 'name_asc') sort = { name: 1 };
        else if (req.query.sort === 'name_desc') sort = { name: -1 };

        const [total, products] = await Promise.all([
            Product.countDocuments(filter),
            Product.find(filter)
                .select('name sku stock hasVariants variants category isActive')
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
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách tồn kho',
            error: error.message
        });
    }
};

/**
 * @desc    Lấy thống kê tồn kho
 * @route   GET /api/v1/inventory/stats
 * @access  Private (Admin, Warehouse Staff)
 */
exports.getInventoryStats = async (req, res) => {
    try {
        const lowStockThreshold = Number(req.query.lowStockThreshold) || 10;

        const [
            totalProducts,
            outOfStock,
            lowStock,
            inStock,
            negativeStock,
            totalStockValue
        ] = await Promise.all([
            Product.countDocuments({}),
            Product.countDocuments({ stock: { $lte: 0 } }),
            Product.countDocuments({ stock: { $gt: 0, $lte: lowStockThreshold } }),
            Product.countDocuments({ stock: { $gt: lowStockThreshold } }),
            Product.countDocuments({ stock: { $lt: 0 } }),
            Product.aggregate([
                { $match: { stock: { $gt: 0 } } },
                { $group: { _id: null, total: { $sum: { $multiply: ['$stock', '$retailPrice'] } } } }
            ])
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalProducts,
                outOfStock,
                lowStock,
                inStock,
                negativeStock,
                totalStockValue: totalStockValue[0]?.total || 0,
                lowStockThreshold
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thống kê tồn kho',
            error: error.message
        });
    }
};

/**
 * @desc    Cập nhật tồn kho cho một sản phẩm
 * @route   PUT /api/v1/inventory/:id
 * @access  Private (Admin, Warehouse Staff)
 */
exports.updateInventory = async (req, res) => {
    try {
        const { stock, variants } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        // Update main stock
        if (stock !== undefined) {
            product.stock = Number(stock);
        }

        // Update variant stocks
        if (variants && Array.isArray(variants) && product.hasVariants) {
            variants.forEach(variantUpdate => {
                const variant = product.variants.id(variantUpdate._id);
                if (variant && variantUpdate.stock !== undefined) {
                    variant.stock = Number(variantUpdate.stock);
                }
            });
        }

        await product.save();

        res.status(200).json({
            success: true,
            message: 'Cập nhật tồn kho thành công',
            data: product
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Lỗi khi cập nhật tồn kho',
            error: error.message
        });
    }
};

/**
 * @desc    Cập nhật tồn kho hàng loạt
 * @route   PUT /api/v1/inventory/bulk
 * @access  Private (Admin, Warehouse Staff)
 */
exports.bulkUpdateInventory = async (req, res) => {
    try {
        const { updates } = req.body;

        if (!Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp danh sách cập nhật'
            });
        }

        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        for (const update of updates) {
            try {
                const product = await Product.findById(update.productId);
                
                if (!product) {
                    results.failed++;
                    results.errors.push({
                        productId: update.productId,
                        message: 'Không tìm thấy sản phẩm'
                    });
                    continue;
                }

                if (update.stock !== undefined) {
                    product.stock = Number(update.stock);
                }

                if (update.variants && Array.isArray(update.variants) && product.hasVariants) {
                    update.variants.forEach(variantUpdate => {
                        const variant = product.variants.id(variantUpdate._id);
                        if (variant && variantUpdate.stock !== undefined) {
                            variant.stock = Number(variantUpdate.stock);
                        }
                    });
                }

                await product.save();
                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push({
                    productId: update.productId,
                    message: error.message
                });
            }
        }

        res.status(200).json({
            success: true,
            message: `Cập nhật thành công ${results.success}/${updates.length} sản phẩm`,
            data: results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật tồn kho hàng loạt',
            error: error.message
        });
    }
};

/**
 * @desc    Import tồn kho từ CSV
 * @route   POST /api/v1/inventory/import
 * @access  Private (Admin, Warehouse Staff)
 */
exports.importInventory = async (req, res) => {
    try {
        if (!req.file?.buffer) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn file CSV để import'
            });
        }

        const content = req.file.buffer.toString('utf8').replace(/^\uFEFF/, '');
        const lines = content.split(/\r?\n/).filter(line => line.trim());

        if (lines.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'File CSV không hợp lệ hoặc rỗng'
            });
        }

        const parseCsvLine = (line) => {
            const values = [];
            let current = '';
            let inQuotes = false;

            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                const next = line[i + 1];

                if (char === '"' && inQuotes && next === '"') {
                    current += '"';
                    i++;
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

        const headers = parseCsvLine(lines[0]).map(h => h.trim());
        const rows = lines.slice(1).map((line, index) => {
            const values = parseCsvLine(line);
            const row = { __rowNumber: index + 2 };
            headers.forEach((header, i) => {
                row[header] = values[i] !== undefined ? values[i] : '';
            });
            return row;
        });

        const errors = [];
        const results = { success: 0, failed: 0 };

        for (const row of rows) {
            const sku = (row.sku || '').trim();
            const stock = Number(row.stock || row.ton_kho || 0);

            if (!sku) {
                errors.push({
                    row: row.__rowNumber,
                    message: 'Thiếu SKU'
                });
                results.failed++;
                continue;
            }

            if (isNaN(stock) || stock < 0) {
                errors.push({
                    row: row.__rowNumber,
                    sku,
                    message: 'Tồn kho không hợp lệ'
                });
                results.failed++;
                continue;
            }

            try {
                const product = await Product.findOne({ sku });
                
                if (!product) {
                    errors.push({
                        row: row.__rowNumber,
                        sku,
                        message: 'Không tìm thấy sản phẩm'
                    });
                    results.failed++;
                    continue;
                }

                product.stock = stock;
                await product.save();
                results.success++;
            } catch (error) {
                errors.push({
                    row: row.__rowNumber,
                    sku,
                    message: error.message
                });
                results.failed++;
            }
        }

        res.status(200).json({
            success: true,
            message: `Import thành công ${results.success}/${rows.length} dòng`,
            data: {
                totalRows: rows.length,
                successCount: results.success,
                failedCount: results.failed,
                errors: errors.length > 0 ? errors : undefined
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi import tồn kho',
            error: error.message
        });
    }
};

/**
 * @desc    Export tồn kho ra CSV
 * @route   GET /api/v1/inventory/export
 * @access  Private (Admin, Warehouse Staff)
 */
exports.exportInventory = async (req, res) => {
    try {
        const filter = {};
        const keyword = req.query.search || req.query.keyword;

        if (keyword) {
            filter.$or = [
                { name: { $regex: keyword, $options: 'i' } },
                { sku: { $regex: keyword, $options: 'i' } }
            ];
        }

        if (req.query.category) {
            filter.category = req.query.category;
        }

        const products = await Product.find(filter)
            .select('name sku stock hasVariants variants category')
            .populate('category', 'name')
            .sort({ name: 1 })
            .lean();

        const csvEscape = (value) => {
            if (value === undefined || value === null) return '';
            const text = String(value);
            return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
        };

        const headers = ['sku', 'name', 'category', 'stock'];
        const rows = products.map(product => [
            product.sku,
            product.name,
            product.category?.name || '',
            product.stock || 0
        ].map(csvEscape).join(','));

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="inventory-${Date.now()}.csv"`);
        res.status(200).send(`\uFEFF${headers.join(',')}\n${rows.join('\n')}`);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi export tồn kho',
            error: error.message
        });
    }
};

/**
 * @desc    Lấy lịch sử thay đổi tồn kho (placeholder - cần implement inventory history model)
 * @route   GET /api/v1/inventory/history/:id
 * @access  Private (Admin, Warehouse Staff)
 */
exports.getInventoryHistory = async (req, res) => {
    try {
        // TODO: Implement inventory history tracking
        // This would require a separate InventoryHistory model to track changes
        res.status(200).json({
            success: true,
            message: 'Tính năng lịch sử tồn kho đang được phát triển',
            data: []
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy lịch sử tồn kho',
            error: error.message
        });
    }
};