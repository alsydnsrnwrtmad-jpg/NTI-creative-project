/* =====================================================================
   SOFRA — Navbar Authentication State Manager
   Updates navbar based on authentication status
   ===================================================================== */

// Determine API base URL based on current location
function getApiBaseUrl() {
    if (window.location.pathname.includes('/pages/')) {
        return '../backend/api';
    } else {
        return 'backend/api';
    }
}

// Determine pages base URL based on current location
function getPagesBaseUrl() {
    if (window.location.pathname.includes('/pages/')) {
        return '';
    } else {
        return 'pages/';
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    const authSection = document.getElementById('user-auth-section');
    if (!authSection) return;

    try {
        const sessionToken = localStorage.getItem('sofra_session_token');
        const pagesBaseUrl = getPagesBaseUrl();
        
        if (sessionToken) {
            // Validate session
            const apiUrl = getApiBaseUrl();
            const response = await fetch(`${apiUrl}/validate.php`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${sessionToken}`,
                }
            });

            const result = await response.json();
            
            if (result.success && result.user) {
                // User is authenticated, show logout button
                const userData = result.user;
                const userName = `${userData.first_name} ${userData.last_name}`;
                
                authSection.innerHTML = `
                    <div class="dropdown">
                        <a class="nav-account-link text-decoration-none dropdown-toggle" href="#" role="button" 
                           data-bs-toggle="dropdown" aria-expanded="false">
                            <span data-i18n="account">مرحباً، ${userName}</span>
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item" href="${pagesBaseUrl}cart.html">السلة 🛒</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item" href="#" onclick="userLogout()">تسجيل الخروج</a></li>
                        </ul>
                    </div>
                `;
            } else {
                // Invalid session, show login button
                authSection.innerHTML = `
                    <a href="${pagesBaseUrl}login.html" class="nav-account-link text-decoration-none">
                        <span data-i18n="account">تسجيل خروج</span>
                    </a>
                `;
            }
        } else {
            // No session, show login button
            authSection.innerHTML = `
                <a href="${pagesBaseUrl}login.html" class="nav-account-link text-decoration-none">
                    <span data-i18n="account">تسجيل خروج</span>
                </a>
            `;
        }
    } catch (error) {
        console.error('Auth state error:', error);
        const pagesBaseUrl = getPagesBaseUrl();
        // On error, show login button
        authSection.innerHTML = `
            <a href="${pagesBaseUrl}login.html" class="nav-account-link text-decoration-none">
                <span data-i18n="account">تسجيل خروج</span>
            </a>
        `;
    }
});
