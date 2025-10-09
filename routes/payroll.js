const express = require('express');
const router = express.Router();
const Payroll = require('../models/Payroll');
const Attendance = require('../models/Attendance');
const Sales = require('../models/Sales');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Generate Payroll
router.post('/generate', auth, async (req, res) => {
    try {
        const { userId, month, year } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if payroll already exists
        const existingPayroll = await Payroll.findOne({ userId, month, year });
        if (existingPayroll) {
            return res.status(400).json({ success: false, message: 'Payroll already exists for this period' });
        }

        // Get attendance data
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        
        const attendance = await Attendance.find({
            userId,
            attendanceDate: { $gte: startDate, $lte: endDate }
        });

        const presentDays = attendance.filter(a => a.status === 'present').length;
        const totalOvertimeHours = attendance.reduce((sum, a) => sum + (a.overtimeHours || 0), 0);

        // Get sales data
        const sales = await Sales.find({
            userId,
            saleDate: { $gte: startDate, $lte: endDate }
        });

        const salesIncentives = sales.reduce((sum, s) => sum + s.commissionAmount, 0);

        // Calculate salary
        const basicSalary = user.salaryStructure.basic;
        const hra = user.salaryStructure.hra || 0;
        const conveyance = user.salaryStructure.conveyance || 0;
        const medical = user.salaryStructure.medical || 0;
        
        const grossSalary = basicSalary + hra + conveyance + medical;
        const hourlyRate = basicSalary / 208;
        const overtimeAmount = hourlyRate * totalOvertimeHours * 1.5;

        // Calculate deductions
        const pfDeduction = basicSalary * 0.12;
        const esicDeduction = grossSalary <= 21000 ? grossSalary * 0.0325 : 0;
        const taxDeduction = 0; // Simplified
        
        const totalDeductions = pfDeduction + esicDeduction + taxDeduction;
        const netSalary = grossSalary + overtimeAmount + salesIncentives - totalDeductions;

        const payroll = new Payroll({
            userId,
            siteId: user.siteId,
            month,
            year,
            basicSalary,
            allowances: { hra, conveyance, medical },
            totalWorkingDays: new Date(year, month, 0).getDate(),
            presentDays,
            absentDays: new Date(year, month, 0).getDate() - presentDays,
            overtimeHours: totalOvertimeHours,
            overtimeAmount,
            grossSalary,
            deductions: {
                pf: pfDeduction,
                esic: esicDeduction,
                tax: taxDeduction
            },
            totalDeductions,
            netSalary,
            salesIncentives,
            status: 'processed',
            processedBy: req.user.id
        });

        await payroll.save();

        res.status(201).json({
            success: true,
            message: 'Payroll generated successfully',
            data: payroll
        });
    } catch (error) {
        console.error('Generate payroll error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get Payroll
router.get('/', auth, async (req, res) => {
    try {
        const { userId, month, year } = req.query;
        
        let query = { userId: userId || req.user.id };
        
        if (month && year) {
            query.month = month;
            query.year = year;
        }

        const payroll = await Payroll.find(query)
            .populate('userId', 'firstName lastName employeeCode')
            .sort({ year: -1, month: -1 });

        res.json({
            success: true,
            count: payroll.length,
            data: payroll
        });
    } catch (error) {
        console.error('Get payroll error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
