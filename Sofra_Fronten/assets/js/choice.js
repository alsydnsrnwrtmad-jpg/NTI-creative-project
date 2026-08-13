/* =====================================================================
   SOFRA — Choice Page JavaScript
   User/Admin Selection Page
   ===================================================================== */

function goToLogin(userType) {
    // Store the selected user type in session storage
    sessionStorage.setItem('selectedUserType', userType);
    
    // Redirect to login page
    window.location.href = 'login.html';
}

// Check if user type is already selected (in case of direct navigation)
document.addEventListener('DOMContentLoaded', function() {
    const selectedType = sessionStorage.getItem('selectedUserType');
    if (selectedType) {
        // If user already selected a type, you could optionally auto-redirect
        // But keeping them on choice page gives them a chance to change
        console.log('Previously selected type:', selectedType);
    }
});
