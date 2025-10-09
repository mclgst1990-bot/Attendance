const mongoose = require('mongoose');

const salesSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    siteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Site',
        required: true
    },
    customerName: {
        type: String,
        required: true,
        trim: true
    },
    customerContact: {
        type: String,
        required: true
    },
    productDetails: [{
        productName: { type: String, required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        totalPrice: { type: Number, required: true }
    }],
    saleAmount: {
        type: Number,
        required: true
    },
    commissionPercentage: {
        type: Number,
        default: 0
    },
    commissionAmount: {
        type: Number,
        default: 0
    },
    saleDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'partial'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Indexes for reporting and analytics
salesSchema.index({ userId: 1, saleDate: 1 });
salesSchema.index({ siteId: 1, saleDate: 1 });
salesSchema.index({ saleDate: 1 });

module.exports = mongoose.model('Sales', salesSchema);
