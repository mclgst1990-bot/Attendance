const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    action: {
        type: String,
        required: true,
        trim: true
    },
    collectionName: {
        type: String,
        required: true
    },
    recordId: {
        type: mongoose.Schema.Types.ObjectId
    },
    changes: {
        type: mongoose.Schema.Types.Mixed
    },
    ipAddress: {
        type: String
    }
}, {
    timestamps: true
});

// Index for faster queries
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ collectionName: 1, recordId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
