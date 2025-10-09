const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const auth = require('../middleware/auth');

// Check In
router.post('/check-in', auth, async (req, res) => {
    try {
        const { latitude, longitude, method } = req.body;
        
        const today = new Date().setHours(0, 0, 0, 0);
        const existingAttendance = await Attendance.findOne({
            userId: req.user.id,
            attendanceDate: { $gte: today }
        });

        if (existingAttendance && existingAttendance.checkInTime) {
            return res.status(400).json({
                success: false,
                message: 'Already checked in today'
            });
        }

        const attendance = new Attendance({
            userId: req.user.id,
            siteId: req.user.siteId,
            attendanceDate: new Date(),
            checkInTime: new Date(),
            checkInLocation: {
                type: 'Point',
                coordinates: [longitude, latitude]
            },
            checkInMethod: method || 'mobile_app',
            status: 'present'
        });

        await attendance.save();

        res.status(201).json({
            success: true,
            message: 'Check-in successful',
            data: attendance
        });
    } catch (error) {
        console.error('Check-in error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Check Out
router.post('/check-out', auth, async (req, res) => {
    try {
        const { latitude, longitude, method } = req.body;
        
        const today = new Date().setHours(0, 0, 0, 0);
        const attendance = await Attendance.findOne({
            userId: req.user.id,
            attendanceDate: { $gte: today }
        });

        if (!attendance) {
            return res.status(400).json({
                success: false,
                message: 'No check-in found for today'
            });
        }

        if (attendance.checkOutTime) {
            return res.status(400).json({
                success: false,
                message: 'Already checked out'
            });
        }

        const checkOut = new Date();
        const workingHours = (checkOut - attendance.checkInTime) / (1000 * 60 * 60);

        attendance.checkOutTime = checkOut;
        attendance.checkOutLocation = {
            type: 'Point',
            coordinates: [longitude, latitude]
        };
        attendance.checkOutMethod = method || 'mobile_app';
        attendance.workingHours = workingHours.toFixed(2);
        
        if (workingHours > 8) {
            attendance.overtimeHours = (workingHours - 8).toFixed(2);
        }

        await attendance.save();

        res.json({
            success: true,
            message: 'Check-out successful',
            data: attendance
        });
    } catch (error) {
        console.error('Check-out error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get Attendance
router.get('/', auth, async (req, res) => {
    try {
        const { userId, date, month, year } = req.query;
        
        let query = { userId: userId || req.user.id };

        if (date) {
            const targetDate = new Date(date);
            query.attendanceDate = {
                $gte: targetDate.setHours(0, 0, 0, 0),
                $lt: targetDate.setHours(23, 59, 59, 999)
            };
        } else if (month && year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59);
            query.attendanceDate = { $gte: startDate, $lte: endDate };
        }

        const attendance = await Attendance.find(query)
            .populate('userId', 'firstName lastName employeeCode')
            .sort({ attendanceDate: -1 })
            .limit(100);

        res.json({
            success: true,
            count: attendance.length,
            data: attendance
        });
    } catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
