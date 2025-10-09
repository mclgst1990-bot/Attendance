const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

const app = express();

// Middleware - BEFORE connecting to database
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Import Routes
const authRoutes = require('./routes/auth');
const attendanceRoutes = require('./routes/attendance');
const salesRoutes = require('./routes/sales');
const payrollRoutes = require('./routes/payroll');
const sitesRoutes = require('./routes/sites');
const leavesRoutes = require('./routes/leaves');

// Use Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/sales', salesRoutes);
app.use('/api/v1/payroll', payrollRoutes);
app.use('/api/v1/sites', sitesRoutes);
app.use('/api/v1/leaves', leavesRoutes);

// Root Endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Sales Attendance Payroll Management System API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: '/health',
            auth: '/api/v1/auth',
            attendance: '/api/v1/attendance',
            sales: '/api/v1/sales',
            payroll: '/api/v1/payroll',
            sites: '/api/v1/sites',
            leaves: '/api/v1/leaves'
        }
    });
});

// Health Check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date(),
        environment: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 10000
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start Server FIRST, then connect to MongoDB
const PORT = process.env.PORT || 10000;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
    console.log(`Server running on ${HOST}:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Connect to MongoDB AFTER server starts
    connectDB().catch(err => {
        console.error('MongoDB connection failed, but server is still running');
    });
});

// Handle server errors
server.on('error', (error) => {
    console.error('Server error:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});
