/* =====================================================================
   SOFRA — Authentication API Integration
   Handles communication with PHP Backend for Login/Register
   ===================================================================== */

// Determine API base URL based on current location
function getApiBaseUrl() {
    return '/sofra/backend/api';
}

const API_BASE_URL = getApiBaseUrl();

// Store session token
function setSessionToken(token) {
    localStorage.setItem('sofra_session_token', token);
}

// Get session token
function getSessionToken() {
    return localStorage.getItem('sofra_session_token');
}

// Clear session token
function clearSessionToken() {
    localStorage.removeItem('sofra_session_token');
    sessionStorage.removeItem('selectedUserType');
}

// Store user data
function setUserData(userData) {
    localStorage.setItem('sofra_user_data', JSON.stringify(userData));
}

// Get user data
function getUserData() {
    const userData = localStorage.getItem('sofra_user_data');
    return userData ? JSON.parse(userData) : null;
}

// Clear user data
function clearUserData() {
    localStorage.removeItem('sofra_user_data');
}

// Register user
async function registerUser(userData) {
    try {
        const apiUrl = getApiBaseUrl();
        const response = await fetch(`${apiUrl}/register.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, message: 'Network error occurred' };
    }
}

// Login user
async function loginUser(email, password, userType) {
    try {
        const apiUrl = getApiBaseUrl();
        const response = await fetch(`${apiUrl}/login.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password,
                user_type: userType
            })
        });

        const result = await response.json();
        
        if (result.success) {
            // Store session token and user data
            setSessionToken(result.session_token);
            setUserData(result.user);
        }
        
        return result;
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'Network error occurred' };
    }
}

// Validate session
async function validateSession() {
    try {
        const token = getSessionToken();
        if (!token) {
            return { valid: false, message: 'No session token' };
        }

        const apiUrl = getApiBaseUrl();
        const response = await fetch(`${apiUrl}/validate.php`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Session validation error:', error);
        return { valid: false, message: 'Network error occurred' };
    }
}

// Logout user
async function logoutUser() {
    try {
        const token = getSessionToken();
        if (!token) {
            return { success: true, message: 'Already logged out' };
        }

        const apiUrl = getApiBaseUrl();
        const response = await fetch(`${apiUrl}/logout.php`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });

        const result = await response.json();
        
        // Clear local storage regardless of API response
        clearSessionToken();
        clearUserData();
        
        return result;
    } catch (error) {
        console.error('Logout error:', error);
        // Clear local storage even on error
        clearSessionToken();
        clearUserData();
        return { success: true, message: 'Logged out (local)' };
    }
}

// Redirect based on user type
function redirectBasedOnUserType(userType) {
    if (userType === 'admin') {
        // Redirect to admin dashboard
        window.location.href = '../../architectui-html-theme-free/architectui-html-free/index.html';
    } else {
        // Redirect to user dashboard/home
        window.location.href = 'index.html';
    }
}

// Check authentication status
async function checkAuthStatus() {
    const validation = await validateSession();
    if (validation.success) {
        return { authenticated: true, user: validation.user };
    } else {
        return { authenticated: false };
    }
}