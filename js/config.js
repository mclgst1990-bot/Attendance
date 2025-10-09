// API Configuration for Render.com deployment
const API_CONFIG = {
    BASE_URL: 'http://0.0.0.0:10000/api/v1', // Change in production
    ENDPOINTS: {
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        CHECK_IN: '/attendance/check-in',
        CHECK_OUT: '/attendance/check-out',
        ATTENDANCE: '/attendance',
        SALES: '/sales',
        PAYROLL: '/payroll',
        LEAVES: '/leaves',
        SITES: '/sites',
        USERS: '/users'
    }
};

// Local Storage Keys
const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    USER_DATA: 'user_data',
    SITE_ID: 'site_id'
};

// Helper function to get auth token
function getAuthToken() {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
}

// Helper function to get user data
function getUserData() {
    const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
}

// Helper function to check if user is authenticated
function isAuthenticated() {
    return !!getAuthToken();
}

// Redirect to login if not authenticated
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'index.html';
    }
}
