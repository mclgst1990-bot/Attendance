const express = require('express');
const router = express.Router();
const Site = require('../models/Site');

// Get all sites
router.get('/', async (req, res) => {
    try {
        const sites = await Site.find({ isActive: true })
            .select('name code city state location')
            .sort({ name: 1 });

        res.json({
            success: true,
            count: sites.length,
            data: sites
        });
    } catch (error) {
        console.error('Get sites error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single site
router.get('/:id', async (req, res) => {
    try {
        const site = await Site.findById(req.params.id);

        if (!site) {
            return res.status(404).json({
                success: false,
                message: 'Site not found'
            });
        }

        res.json({
            success: true,
            data: site
        });
    } catch (error) {
        console.error('Get site error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create site
router.post('/', async (req, res) => {
    try {
        const site = new Site(req.body);
        await site.save();

        res.status(201).json({
            success: true,
            message: 'Site created successfully',
            data: site
        });
    } catch (error) {
        console.error('Create site error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
