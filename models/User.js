const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['customer', 'agent', 'sales', 'content', 'admin', 'super_admin'],
        default: 'customer' 
    },
    dob: { type: Date },
    address: {
        street: String,
        province: String
    },
    isActive: { type: Boolean, default: true },
    crm_id: { type: String },
    customerType: { 
        type: String, 
        enum: ['retail', 'wholesale', 'dealer'],
        default: 'retail'
    },
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);