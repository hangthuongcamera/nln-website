const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
    quoteCode: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerEmail: { type: String },
    content: { type: String },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, default: 1 }
    }],
    attachedFile: { type: String }, // Link file báo giá admin phản hồi
    adminNote: { type: String },
    status: { 
        type: String, 
        enum: ['pending', 'replied', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Quote', quoteSchema);