const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
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
    attendanceDate: {
        type: Date,
        required: true
    },
    checkInTime: {
        type: Date
    },
    checkOutTime: {
        type: Date
    },
    checkInLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number]  // [longitude, latitude]
        }
    },
    checkOutLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number]
        }
    },
    checkInMethod: {
        type: String,
        enum: ['biometric', 'mobile_app', 'qr_code', 'manual'],
        default: 'mobile_app'
    },
    checkOutMethod: {
        type: String,
        enum: ['biometric', 'mobile_app', 'qr_code', 'manual'],
        default: 'mobile_app'
    },
    shiftType: {
        type: String,
        enum: ['regular', 'night', 'split'],
        default: 'regular'
    },
    workingHours: {
        type: Number,
        default: 0
    },
    overtimeHours: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'half_day', 'late', 'outdoor_duty'],
        default: 'present'
    },
    remarks: {
        type: String,
        trim: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Compound index for faster queries
attendanceSchema.index({ userId: 1, attendanceDate: 1 }, { unique: true });
attendanceSchema.index({ siteId: 1, attendanceDate: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
