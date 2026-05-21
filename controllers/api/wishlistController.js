const User = require('../../models/User');
const Product = require('../../models/Product');
const mongoose = require('mongoose');

/**
 * @desc    Toggle product in user's wishlist (add or remove)
 * @route   POST /api/v1/wishlist/toggle
 * @access  Private (User)
 */
exports.toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user.id; // Assuming req.user is populated by auth middleware

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: 'ID sản phẩm không hợp lệ.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
        }

        const productExists = await Product.findById(productId);
        if (!productExists) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm.' });
        }

        const productIndex = user.wishlist.indexOf(productId);

        if (productIndex > -1) {
            // Product is in wishlist, remove it
            user.wishlist.splice(productIndex, 1);
            await user.save();
            return res.status(200).json({ success: true, message: 'Đã xóa sản phẩm khỏi danh sách yêu thích.', isInWishlist: false });
        } else {
            // Product is not in wishlist, add it
            user.wishlist.push(productId);
            await user.save();
            return res.status(200).json({ success: true, message: 'Đã thêm sản phẩm vào danh sách yêu thích.', isInWishlist: true });
        }

    } catch (error) {
        console.error('Lỗi khi thêm/xóa sản phẩm yêu thích:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi xử lý danh sách yêu thích.', error: error.message });
    }
};

/**
 * @desc    Get user's wishlist
 * @route   GET /api/v1/wishlist
 * @access  Private (User)
 */
exports.getWishlist = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming req.user is populated by auth middleware

        const user = await User.findById(userId).populate({
            path: 'wishlist',
            select: 'name slug sku images retailPrice oldPrice flags' // Select relevant product fields
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
        }

        res.status(200).json({ success: true, data: user.wishlist });

    } catch (error) {
        console.error('Lỗi khi lấy danh sách yêu thích:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách yêu thích.', error: error.message });
    }
};

/**
 * @desc    Check if a product is in user's wishlist
 * @route   GET /api/v1/wishlist/check/:productId
 * @access  Private (User)
 */
exports.checkWishlistStatus = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: 'ID sản phẩm không hợp lệ.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
        }

        const isInWishlist = user.wishlist.includes(productId);
        res.status(200).json({ success: true, isInWishlist });

    } catch (error) {
        console.error('Lỗi khi kiểm tra trạng thái yêu thích:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi kiểm tra trạng thái yêu thích.', error: error.message });
    }
};