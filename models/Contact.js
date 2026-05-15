const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Vui lòng nhập họ tên'] },
    phone: { type: String, required: [true, 'Vui lòng nhập số điện thoại'] },
    email: { type: String },
    message: { type: String, required: [true, 'Vui lòng nhập nội dung tin nhắn'] },
    status: {
        type: String,
        enum: ['pending', 'resolved'],
        default: 'pending' // Mặc định là chờ xử lý
    },
    notes: { type: String } // Ghi chú nội bộ của admin sau khi đã gọi điện/xử lý
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);