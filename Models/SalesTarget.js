const mongoose = require('mongoose');

const salesTargetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    siteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Site'
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    year: {
        type: Number,
        required: true
    },
    targetAmount: {
        type: Number,
        required: true
    },
    achievedAmount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Compound unique index
salesTargetSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });
salesTargetSchema.index({ siteId: 1, month: 1, year: 1 });

module.exports = mongoose.model('SalesTarget', salesTargetSchema);
