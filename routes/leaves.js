const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const auth = require('../middleware/auth');

// Apply for leave
router.post('/', auth, async (req, res) => {
    try {
        const { leaveType, startDate, endDate, reason } = req.body;

        const start = new Date(startDate);
        const end = new Date(endDate);
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        const leave = new Leave({
            userId: req.user.id,
            leaveType,
            startDate: start,
            endDate: end,
            totalDays,
            reason,
            status: 'pending'
        });

        await leave.save();

        res.status(201).json({
            success: true,
            message: 'Leave application submitted successfully',
            data: leave
        });
    } catch (error) {
        console.error('Apply leave error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get leaves
router.get('/', auth, async (req, res) => {
    try {
        const { userId, status } = req.query;
        
        let query = { userId: userId || req.user.id };
        
        if (status) {
            query.status = status;
        }

        const leaves = await Leave.find(query)
            .populate('userId', 'firstName lastName employeeCode')
            .populate('approvedBy', 'firstName lastName')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: leaves.length,
            data: leaves
        });
    } catch (error) {
        console.error('Get leaves error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Approve/Reject leave
router.patch('/:id', auth, async (req, res) => {
    try {
        const { status } = req.body;

        const leave = await Leave.findById(req.params.id);
        
        if (!leave) {
            return res.status(404).json({ success: false, message: 'Leave not found' });
        }

        leave.status = status;
        leave.approvedBy = req.user.id;
        leave.approvalDate = new Date();

        await leave.save();

        res.json({
            success: true,
            message: `Leave ${status} successfully`,
            data: leave
        });
    } catch (error) {
        console.error('Update leave error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
