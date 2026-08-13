/* =====================================================================
   SOFRA — User Frontend Authentication Guard
   Protects user pages and manages user authentication
   ===================================================================== */

// Determine API base URL based on current location
function getApiBaseUrl() {
    if (window.location.pathname.includes('/pages/')) {
        return '../backend/api';
    } else {
        return 'backend/api';
    }
}

// Check if user is authenticated
async function checkUserAuth() {
    try {
        const sessionToken = localStorage.getItem('sofra_session_token');
        
        if (!sessionToken) {
            // No session token, redirect to choice page
            window.location.href = 'choice.html';
            return false;
        }

        // Validate session with backend
        const apiUrl = getApiBaseUrl();
        const response = await fetch(`${apiUrl}/validate.php`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${sessionToken}`,
            }
        });

        const result = await response.json();
        
        if (result.success && result.user.user_type === 'user') {
            return true; // User is authenticated
        } else {
            // Not user or invalid session, redirect to choice page
            window.location.href = 'choice.html';
            return false;
        }
    } catch (error) {
        console.error('Auth check error:', error);
        // On error, allow access (graceful degradation)
        return true;
    }
}

// Optional: Add auth check to protected user pages
// Add this script to pages that require authentication
document.addEventListener('DOMContentLoaded', function() {
    // Check if current page requires authentication
    const body = document.body;
    if (body.hasAttribute('data-require-auth')) {
        checkUserAuth();
    }
});

// Handle logout from user pages
async function userLogout() {
    try {
        const result = await logoutUser();
        
        if (result.success) {
            alert('Logged out successfully');
            window.location.href = 'choice.html';
        } else {
            alert('Logout completed');
            window.location.href = 'choice.html';
        }
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = 'choice.html';
    }
}
