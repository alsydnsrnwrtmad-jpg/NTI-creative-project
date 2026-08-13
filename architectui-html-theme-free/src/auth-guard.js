/* =====================================================================
   SOFRA — Admin Dashboard Authentication Guard
   Prevents unauthorized access to admin dashboard
   ===================================================================== */

// Check if user is authenticated as admin
async function checkAdminAuth() {
    try {
        const sessionToken = localStorage.getItem('sofra_session_token');
        
        if (!sessionToken) {
            // No session token, redirect to choice page
            window.location.href = '../../Sofra_Fronten/pages/choice.html';
            return false;
        }

        // Validate session with backend
        const response = await fetch('../../backend/api/validate.php', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${sessionToken}`,
            }
        });

        const result = await response.json();
        
        if (result.success && result.user.user_type === 'admin') {
            return true; // User is authenticated as admin
        } else {
            // Not admin or invalid session, redirect to choice page
            window.location.href = '../../Sofra_Fronten/pages/choice.html';
            return false;
        }
    } catch (error) {
        console.error('Auth check error:', error);
        // On error, redirect to choice page
        window.location.href = '../../Sofra_Fronten/pages/choice.html';
        return false;
    }
}

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
});

// Add logout functionality
async function adminLogout() {
    try {
        const sessionToken = localStorage.getItem('sofra_session_token');
        
        if (sessionToken) {
            await fetch('../../backend/api/logout.php', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionToken}`,
                }
            });
        }
        
        // Clear local storage
        localStorage.removeItem('sofra_session_token');
        localStorage.removeItem('sofra_user_data');
        sessionStorage.removeItem('selectedUserType');
        
        // Redirect to choice page
        window.location.href = '../../Sofra_Fronten/pages/choice.html';
    } catch (error) {
        console.error('Logout error:', error);
        // Clear local storage and redirect anyway
        localStorage.removeItem('sofra_session_token');
        localStorage.removeItem('sofra_user_data');
        sessionStorage.removeItem('selectedUserType');
        window.location.href = '../../Sofra_Fronten/pages/choice.html';
    }
}
