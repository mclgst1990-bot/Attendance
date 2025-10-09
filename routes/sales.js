const express = require('express');
const router = express.Router();
const Sales = require('../models/Sales');
const auth = require('../middleware/auth');

// Create Sale
router.post('/', auth, async (req, res) => {
    try {
        const { customerName, customerContact, productDetails, saleAmount, commissionPercentage } = req.body;

        const commissionAmount = (saleAmount * commissionPercentage) / 100;

        const sale = new Sales({
            userId: req.user.id,
            siteId: req.user.siteId,
            customerName,
            customerContact,
            productDetails,
            saleAmount,
            commissionPercentage: commissionPercentage || 0,
            commissionAmount,
            saleDate: new Date()
        });

        await sale.save();

        res.status(201).json({
            success: true,
            message: 'Sale recorded successfully',
            data: sale
        });
    } catch (error) {
        console.error('Create sale error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get Sales
router.get('/', auth, async (req, res) => {
    try {
        const { userId, month, year } = req.query;
        
        let query = { userId: userId || req.user.id };

        if (month && year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59);
            query.saleDate = { $gte: startDate, $lte: endDate };
        }

        const sales = await Sales.find(query)
            .populate('userId', 'firstName lastName employeeCode')
            .sort({ saleDate: -1 });

        const totalSales = sales.reduce((sum, sale) => sum + sale.saleAmount, 0);
        const totalCommission = sales.reduce((sum, sale) => sum + sale.commissionAmount, 0);

        res.json({
            success: true,
            count: sales.length,
            totalSales,
            totalCommission,
            data: sales
        });
    } catch (error) {
        console.error('Get sales error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
