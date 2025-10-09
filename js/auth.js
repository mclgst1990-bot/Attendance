document.addEventListener('DOMContentLoaded', function() {
    // Load sites on page load
    loadSites();
    
    // Handle login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

async function loadSites() {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SITES}`);
        const sites = await response.json();
        
        const siteSelect = document.getElementById('siteSelect');
        sites.forEach(site => {
            const option = document.createElement('option');
            option.value = site._id;
            option.textContent = `${site.name} - ${site.code}`;
            siteSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading sites:', error);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const employeeId = document.getElementById('employeeId').value;
    const password = document.getElementById('password').value;
    const siteId = document.getElementById('siteSelect').value;
    const errorMessage = document.getElementById('errorMessage');
    
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                employeeId: employeeId,
                password: password,
                siteId: siteId
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store auth token and user data
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
            localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
            localStorage.setItem(STORAGE_KEYS.SITE_ID, siteId);
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            errorMessage.textContent = data.message || 'Login failed. Please check your credentials.';
            errorMessage.classList.add('show');
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.classList.add('show');
    }
}

// Logout functionality
function handleLogout() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.SITE_ID);
    window.location.href = 'index.html';
}
