const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
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
    basicSalary: {
        type: Number,
        required: true
    },
    allowances: {
        hra: { type: Number, default: 0 },
        conveyance: { type: Number, default: 0 },
        medical: { type: Number, default: 0 }
    },
    totalWorkingDays: {
        type: Number,
        required: true
    },
    presentDays: {
        type: Number,
        required: true
    },
    absentDays: {
        type: Number,
        default: 0
    },
    overtimeHours: {
        type: Number,
        default: 0
    },
    overtimeAmount: {
        type: Number,
        default: 0
    },
    grossSalary: {
        type: Number,
        required: true
    },
    deductions: {
        pf: { type: Number, default: 0 },
        esic: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        advance: { type: Number, default: 0 }
    },
    totalDeductions: {
        type: Number,
        required: true
    },
    netSalary: {
        type: Number,
        required: true
    },
    salesIncentives: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['draft', 'processed', 'paid'],
        default: 'draft'
    },
    paymentDate: {
        type: Date
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Compound unique index
payrollSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);
