/* =====================================================================
   SOFRA — Complete JavaScript Controller (Login & Register)
   ===================================================================== */

// وظيفة تحريك الواجهة بين اللوجين والريجستر (Ui Animation)
// دالة لتفريغ الفورمز ومسح الأخطاء
function clearFormsAndErrors() {
    // 1. مسح الشريط العلوي للأخطاء
    const errorsContainer = document.getElementById('form-errors-wrapper');
    if (errorsContainer) {
        errorsContainer.innerHTML = '';
    }

    // 2. تفريغ بيانات نموذج التسجيل (Register)
    const registerForm = document.querySelector('.register_form');
    if (registerForm) {
        registerForm.reset();
    }

    // 3. تفريغ بيانات نموذج تسجيل الدخول (Login)
    const loginForm = document.querySelector('.login_form');
    if (loginForm) {
        loginForm.reset();
    }
}

// الحركة لليمين (الانتقال لنموذج التسجيل Register)
function mover_right() {
    clearFormsAndErrors(); // مسح الأخطاء وتفريغ الحقول فوراً
    
    const container = document.getElementById("main_container_login_register");
    if (container) container.classList.add("show-register");

    const move_slide = document.getElementById("card_slide_login_register");
    if (move_slide) {
        move_slide.style.translate = "100%";
        move_slide.style.borderLeft = "5px inset rgba(0,0,0,0.6)";
        move_slide.style.borderRight = "0px";
        move_slide.style.borderRadius = "16px";
        move_slide.style.setProperty("--opacity", "1");
    }

    const move_img = document.getElementById("img_login_register");
    if (move_img) move_img.style.translate = "510px";
}

// الحركة لليصار (الانتقال لنموذج تسجيل الدخول Login)
function mover_left() {
    clearFormsAndErrors(); // مسح الأخطاء وتفريغ الحقول فوراً
    
    const container = document.getElementById("main_container_login_register");
    if (container) container.classList.remove("show-register");

    const move_slide = document.getElementById("card_slide_login_register");
    if (move_slide) {
        move_slide.style.translate = "0%";
        move_slide.style.setProperty("--opacity", "0");
        move_slide.style.borderLeft = "0px";
        move_slide.style.borderRight = "5px inset rgba(0,0,0,0.6)";
    }

    const move_img = document.getElementById("img_login_register");
    if (move_img) move_img.style.translate = "0";
}

/**
 * [جزء الاستقبال والعرض العام]:
 * هذه الدالة مسؤولة عن استقبال مصفوفة الأخطاء (Errors Array) القادمة من الـ PHP،
 * وعرضها في الـ div العام الموجود أعلى الصفحة (#form-errors-wrapper) كشريط عائم تحت بعضه.
 */
function displayFormErrors(errorsArray) {
    const errorsContainer = document.getElementById('form-errors-wrapper');
    if (!errorsContainer) return;

    // مسح أي أخطاء كانت موجودة سابقاً (عشان الأخطاء القديمة متتراكمش مع الجديدة)
    errorsContainer.innerHTML = ''; 

    errorsArray.forEach(errMessage => {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger';
        alertDiv.style.margin = '8px auto';
        alertDiv.style.maxWidth = '600px';
        alertDiv.style.padding = '12px 15px';
        alertDiv.style.borderRadius = '8px';
        alertDiv.style.backgroundColor = '#f8d7da';
        alertDiv.style.color = '#721c24';
        alertDiv.style.border = '1px solid #f5c6cb';
        alertDiv.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        alertDiv.style.fontWeight = '500';
        alertDiv.textContent = errMessage;
        
        errorsContainer.appendChild(alertDiv);
    });

    errorsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}


// دالة ذكية لتحديد مسار الـ API ديناميكياً
function getApiBaseUrl() {
    // بما إن صفحة login.html موجودة في Sofra_Fronten/pages/
    // فنحتاج نرجع خطوتين للخلف للوصول لمجلد backend الرئيسي
    const path = window.location.pathname;
    
    if (path.includes('/pages/')) {
        return '../../backend/api';
    }
    
    return 'backend/api';
}

document.addEventListener('DOMContentLoaded', function() {

    // 1. تهيئة نوع المستخدم (User / Admin) من الـ SessionStorage
    const selectedUserType = sessionStorage.getItem('selectedUserType');
    if (selectedUserType) {
        const userTypeInput = document.getElementById('user_type');
        const registerUserTypeInput = document.getElementById('register_user_type');
        
        if (userTypeInput) userTypeInput.value = selectedUserType;
        if (registerUserTypeInput) registerUserTypeInput.value = selectedUserType;

        const typeLabel = selectedUserType.charAt(0).toUpperCase() + selectedUserType.slice(1);
        [document.getElementById('login_type_badge'), document.getElementById('register_type_badge')].forEach(badge => {
            if (!badge) return;
            badge.textContent = `${typeLabel} Account`;
            badge.classList.add('is-visible', selectedUserType === 'admin' ? 'type-admin' : 'type-user');
        });
    }

    // ==========================================
    // 2. معالجة نموذج تسجيل الدخول (Login Form)
    // ==========================================
    const loginForm = document.querySelector('.login_form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // منع إعادة تحميل الصفحة
            
            const emailInput = document.getElementById('login_email');
            const passInput = document.getElementById('login_pass');
            const userTypeInput = document.getElementById('user_type');

            if (!emailInput || !passInput) {
                displayFormErrors(['A login field is missing. Please reload the page.']);
                return;
            }

            const email = emailInput.value.trim();
            const password = passInput.value;
            const userType = userTypeInput ? userTypeInput.value : 'user';
            
            const submitButton = loginForm.querySelector('button[type="submit"]');
            const originalText = submitButton ? submitButton.innerHTML : '';
            if (submitButton) {
                submitButton.innerHTML = '<p>Loading...</p>';
                submitButton.disabled = true;
            }
            
            try {
                const response = await fetch(`${getApiBaseUrl()}/login.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, user_type: userType })
                });

                const result = await response.json();
                
                if (result.success) {
                    localStorage.setItem('sofra_session_token', result.session_token);
                    localStorage.setItem('sofra_user_data', JSON.stringify(result.user));
                    
                    if (userType === 'admin') {
                        window.location.href = '../../architectui-html-theme-free/architectui-html-free/index.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                } else {
                    const serverErrors = result.errors || [result.message || 'Login failed'];
                    displayFormErrors(serverErrors);
                }
            } catch (error) {
                console.error('Login error:', error);
                displayFormErrors(['A network error occurred during login.']);
            } finally {
                if (submitButton) {
                    submitButton.innerHTML = originalText;
                    submitButton.disabled = false;
                }
            }
        });
    }

    // ==========================================
    // 3. معالجة نموذج التسجيل (Register Form) - معدل بالأمان التام
    // ==========================================
    const registerForm = document.querySelector('.register_form');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // منع إعادة تحميل الصفحة
            
            // جلب العناصر بـ أمان تام لمنع خطأ الـ Null في حال تم تعديل الـ DOM عبر الـ Inspect
            const firstInput = document.getElementById('first');
            const lastInput = document.getElementById('last');
            const emailInput = document.getElementById('email_1');
            const pass1Input = document.getElementById('pass_1');
            const pass2Input = document.getElementById('pass_2');
            const registerUserTypeInput = document.getElementById('register_user_type');
            
            if (!firstInput || !lastInput || !emailInput || !pass1Input || !pass2Input) {
                displayFormErrors(['A form field is missing or was modified. Please reload the page.']);
                return;
            }

            const firstName = firstInput.value.trim();
            const lastName = lastInput.value.trim();
            const email = emailInput.value.trim();
            const password = pass1Input.value;
            const confirmPassword = pass2Input.value;
            const userType = registerUserTypeInput ? registerUserTypeInput.value : 'user';
            
            const termsCheckbox = document.getElementById('cheak_one');
            const termsChecked = termsCheckbox ? termsCheckbox.checked : false;

            const submitButton = registerForm.querySelector('button[type="submit"]');
            const originalText = submitButton ? submitButton.innerHTML : '';
            if (submitButton) {
                submitButton.innerHTML = '<p>Loading...</p>';
                submitButton.disabled = true;
            }
            
            try {
                const response = await fetch(`${getApiBaseUrl()}/register.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        first_name: firstName,
                        last_name: lastName,
                        email: email,
                        password: password,
                        confirm_password: confirmPassword,
                        user_type: userType,
                        terms: termsChecked
                    })
                });

                const result = await response.json();
                
                if (result.success) {
                    alert('Registration successful! Please login.');
                    mover_left();
                } else {
                    const serverErrors = result.errors || [result.message || 'Registration failed'];
                    displayFormErrors(serverErrors);
                }
            } catch (error) {
                console.error('Registration error:', error);
                displayFormErrors(['A network error occurred during registration.']);
            } finally {
                if (submitButton) {
                    submitButton.innerHTML = originalText;
                    submitButton.disabled = false;
                }
            }
        });
    }
});