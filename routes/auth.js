const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
    try {
        const { employeeCode, email, password, firstName, lastName, siteId, phone, department, designation, dateOfJoining, salaryStructure } = req.body;

        let user = await User.findOne({ $or: [{ email }, { employeeCode }] });
        if (user) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        user = new User({
            employeeCode,
            email,
            passwordHash: password,
            firstName,
            lastName,
            phone,
            siteId,
            department,
            designation,
            dateOfJoining,
            salaryStructure: salaryStructure || { basic: 30000, hra: 12000, conveyance: 3000, medical: 2000 }
        });

        await user.save();

        const token = jwt.sign(
            { id: user._id, role: user.role, siteId: user.siteId },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                employeeCode: user.employeeCode,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                siteId: user.siteId
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { employeeId, password, siteId } = req.body;

        const user = await User.findOne({
            $or: [{ email: employeeId }, { employeeCode: employeeId }],
            siteId: siteId,
            isActive: true
        });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, siteId: user.siteId },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                employeeCode: user.employeeCode,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                siteId: user.siteId
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
