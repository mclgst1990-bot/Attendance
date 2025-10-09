document.addEventListener('DOMContentLoaded', function() {
    requireAuth();
    
    // Load user info
    const userData = getUserData();
    document.getElementById('userName').textContent = `${userData.firstName} ${userData.lastName}`;
    
    // Set current date
    const today = new Date();
    document.getElementById('currentDate').textContent = formatDate(today);
    
    // Load dashboard data
    loadAttendanceStatus();
    
    // Check-in button
    document.getElementById('checkInBtn').addEventListener('click', handleCheckIn);
    
    // Check-out button
    document.getElementById('checkOutBtn').addEventListener('click', handleCheckOut);
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
});

async function handleCheckIn() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }
    
    navigator.geolocation.getCurrentPosition(async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHECK_IN}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify({
                    latitude: latitude,
                    longitude: longitude,
                    method: 'mobile_app'
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Check-in successful!');
                loadAttendanceStatus();
            } else {
                alert(data.message || 'Check-in failed');
            }
        } catch (error) {
            console.error('Check-in error:', error);
            alert('An error occurred during check-in');
        }
    }, (error) => {
        alert('Unable to get your location. Please enable location services.');
    });
}

async function handleCheckOut() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }
    
    navigator.geolocation.getCurrentPosition(async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHECK_OUT}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify({
                    latitude: latitude,
                    longitude: longitude,
                    method: 'mobile_app'
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Check-out successful!');
                loadAttendanceStatus();
            } else {
                alert(data.message || 'Check-out failed');
            }
        } catch (error) {
            console.error('Check-out error:', error);
            alert('An error occurred during check-out');
        }
    }, (error) => {
        alert('Unable to get your location. Please enable location services.');
    });
}

async function loadAttendanceStatus() {
    const userData = getUserData();
    const today = new Date().toISOString().split('T')[0];
    
    try {
        const response = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ATTENDANCE}?userId=${userData._id}&date=${today}`,
            {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            }
        );
        
        const data = await response.json();
        
        if (data.attendance) {
            // Update check-in status
            const checkInTime = new Date(data.attendance.checkInTime);
            document.getElementById('checkInStatus').textContent = 
                `Checked in at ${formatTime(checkInTime)}`;
            document.getElementById('checkInBtn').disabled = true;
            
            // Update check-out status
            if (data.attendance.checkOutTime) {
                const checkOutTime = new Date(data.attendance.checkOutTime);
                document.getElementById('checkOutStatus').textContent = 
                    `Checked out at ${formatTime(checkOutTime)}`;
                document.getElementById('checkOutBtn').disabled = true;
            } else {
                document.getElementById('checkOutBtn').disabled = false;
            }
        }
    } catch (error) {
        console.error('Error loading attendance status:', error);
    }
}

// Utility Functions
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-IN', options);
}

function formatTime(date) {
    const options = { hour: '2-digit', minute: '2-digit', hour12: true };
    return date.toLocaleTimeString('en-IN', options);
}
