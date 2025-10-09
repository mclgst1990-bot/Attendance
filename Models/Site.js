const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    country: {
        type: String,
        default: 'India'
    },
    timezone: {
        type: String,
        default: 'Asia/Kolkata'
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],  // [longitude, latitude]
            required: true
        }
    },
    geofenceRadius: {
        type: Number,
        default: 100  // meters
    },
    contactEmail: {
        type: String,
        lowercase: true
    },
    contactPhone: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Create 2dsphere index for geospatial queries
siteSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Site', siteSchema);
