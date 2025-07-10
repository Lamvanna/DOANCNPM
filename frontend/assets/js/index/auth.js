// Authentication Module for Na Food App
const AuthModule = {
    // Current auth mode
    currentMode: 'login', // 'login', 'register', 'profile'

    // Initialize auth functionality
    init() {
        this.bindEvents();
        this.checkAuthStatus();
    },

    // Bind event listeners
    bindEvents() {
        // Listen for auth events
        EventBus.on('auth:show', this.showAuthModal.bind(this));
        EventBus.on('profile:show', this.showProfileModal.bind(this));

        // Modal close events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal();
            }
        });

        // Close button events
        document.querySelectorAll('.modal .close').forEach(closeBtn => {
            closeBtn.addEventListener('click', this.hideModal.bind(this));
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal();
            }
        });
    },

    // Check authentication status on page load
    checkAuthStatus() {
        const token = Storage.get(STORAGE_KEYS.TOKEN);
        const user = Storage.get(STORAGE_KEYS.USER);

        if (token && user) {
            // Verify token is still valid
            this.verifyToken(token);
        }
    },

    // Verify token validity
    async verifyToken(token) {
        try {
            const response = await API.get('/auth/me');
            if (response.success) {
                // Token is valid, update user data
                Storage.set(STORAGE_KEYS.USER, response.data.user);
                EventBus.emit('user:login', response.data.user);
            }
        } catch (error) {
            // Token is invalid, clear auth data
            this.logout();
        }
    },

    // Show authentication modal
    showAuthModal(data) {
        const { type = 'login' } = data;
        this.currentMode = type;
        
        const modal = document.getElementById('authModal');
        const content = document.getElementById('authContent');
        
        if (modal && content) {
            content.innerHTML = this.getAuthHTML(type);
            modal.style.display = 'block';
            this.bindAuthEvents();
        }
    },

    // Show profile modal
    showProfileModal() {
        const user = Storage.get(STORAGE_KEYS.USER);
        if (!user) {
            this.showAuthModal({ type: 'login' });
            return;
        }

        const modal = document.getElementById('authModal');
        const content = document.getElementById('authContent');
        
        if (modal && content) {
            content.innerHTML = this.getProfileHTML(user);
            modal.style.display = 'block';
            this.bindProfileEvents();
        }
    },

    // Hide modal
    hideModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    // Get authentication HTML
    getAuthHTML(type) {
        if (type === 'login') {
            return this.getLoginHTML();
        } else if (type === 'register') {
            return this.getRegisterHTML();
        }
        return '';
    },

    // Get login HTML
    getLoginHTML() {
        return `
            <div class="auth-modal-content">
                <div class="auth-header">
                    <h2 class="auth-title">Đăng nhập</h2>
                    <p class="auth-subtitle">Chào mừng bạn quay trở lại!</p>
                </div>
                
                <form class="auth-form" id="loginForm">
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-input" name="email" required>
                        <div class="form-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Mật khẩu</label>
                        <div class="password-field">
                            <input type="password" class="form-input" name="password" required>
                            <button type="button" class="password-toggle">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                        <div class="form-error"></div>
                    </div>
                    
                    <div class="form-checkbox">
                        <input type="checkbox" id="rememberMe" name="remember">
                        <label for="rememberMe">Ghi nhớ đăng nhập</label>
                    </div>
                    
                    <button type="submit" class="auth-submit">Đăng nhập</button>
                </form>
                
                <div class="forgot-password">
                    <a href="#" id="forgotPasswordLink">Quên mật khẩu?</a>
                </div>
                
                <div class="auth-switch">
                    Chưa có tài khoản? <a href="#" id="switchToRegister">Đăng ký ngay</a>
                </div>
            </div>
        `;
    },

    // Get register HTML
    getRegisterHTML() {
        return `
            <div class="auth-modal-content">
                <div class="auth-header">
                    <h2 class="auth-title">Đăng ký</h2>
                    <p class="auth-subtitle">Tạo tài khoản mới để bắt đầu</p>
                </div>
                
                <form class="auth-form" id="registerForm">
                    <div class="form-group">
                        <label class="form-label">Họ và tên</label>
                        <input type="text" class="form-input" name="name" required>
                        <div class="form-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-input" name="email" required>
                        <div class="form-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Số điện thoại</label>
                        <input type="tel" class="form-input" name="phone">
                        <div class="form-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Mật khẩu</label>
                        <div class="password-field">
                            <input type="password" class="form-input" name="password" required>
                            <button type="button" class="password-toggle">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                        <div class="form-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Xác nhận mật khẩu</label>
                        <div class="password-field">
                            <input type="password" class="form-input" name="confirmPassword" required>
                            <button type="button" class="password-toggle">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                        <div class="form-error"></div>
                    </div>
                    
                    <div class="form-checkbox">
                        <input type="checkbox" id="agreeTerms" name="agree" required>
                        <label for="agreeTerms">
                            Tôi đồng ý với <a href="#" target="_blank">Điều khoản sử dụng</a> 
                            và <a href="#" target="_blank">Chính sách bảo mật</a>
                        </label>
                    </div>
                    
                    <button type="submit" class="auth-submit">Đăng ký</button>
                </form>
                
                <div class="auth-switch">
                    Đã có tài khoản? <a href="#" id="switchToLogin">Đăng nhập ngay</a>
                </div>
            </div>
        `;
    },

    // Get profile HTML
    getProfileHTML(user) {
        return `
            <div class="profile-content">
                <div class="profile-header">
                    <img src="${user.avatar || '/assets/images/default-avatar.png'}" alt="Avatar" class="profile-avatar">
                    <h2 class="profile-name">${user.name}</h2>
                    <p class="profile-email">${user.email}</p>
                </div>
                
                <form class="profile-form" id="profileForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Họ và tên</label>
                            <input type="text" class="form-input" name="name" value="${user.name || ''}" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Số điện thoại</label>
                            <input type="tel" class="form-input" name="phone" value="${user.phone || ''}">
                        </div>
                    </div>
                    
                    <div class="address-group">
                        <h3>Địa chỉ giao hàng</h3>
                        
                        <div class="form-group">
                            <label class="form-label">Địa chỉ</label>
                            <input type="text" class="form-input" name="street" value="${user.address?.street || ''}">
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Phường/Xã</label>
                                <input type="text" class="form-input" name="ward" value="${user.address?.ward || ''}">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Quận/Huyện</label>
                                <input type="text" class="form-input" name="district" value="${user.address?.district || ''}">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Thành phố</label>
                            <input type="text" class="form-input" name="city" value="${user.address?.city || ''}">
                        </div>
                    </div>
                    
                    <div class="profile-actions">
                        <button type="submit" class="btn btn-primary">Cập nhật thông tin</button>
                        <button type="button" class="btn btn-secondary" id="changePasswordBtn">Đổi mật khẩu</button>
                    </div>
                </form>
            </div>
        `;
    },

    // Bind authentication events
    bindAuthEvents() {
        // Form submissions
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }

        if (registerForm) {
            registerForm.addEventListener('submit', this.handleRegister.bind(this));
        }

        // Switch between login/register
        const switchToRegister = document.getElementById('switchToRegister');
        const switchToLogin = document.getElementById('switchToLogin');

        if (switchToRegister) {
            switchToRegister.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAuthModal({ type: 'register' });
            });
        }

        if (switchToLogin) {
            switchToLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAuthModal({ type: 'login' });
            });
        }

        // Password toggle
        document.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', this.togglePassword);
        });

        // Forgot password
        const forgotPasswordLink = document.getElementById('forgotPasswordLink');
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', this.handleForgotPassword.bind(this));
        }
    },

    // Bind profile events
    bindProfileEvents() {
        const profileForm = document.getElementById('profileForm');
        const changePasswordBtn = document.getElementById('changePasswordBtn');

        if (profileForm) {
            profileForm.addEventListener('submit', this.handleProfileUpdate.bind(this));
        }

        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', this.showChangePassword.bind(this));
        }
    },

    // Handle login
    async handleLogin(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Validate form
        if (!this.validateLoginForm(data)) {
            return;
        }

        const submitBtn = form.querySelector('.auth-submit');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        try {
            const response = await API.post('/auth/login', data);
            
            if (response.success) {
                // Save auth data
                Storage.set(STORAGE_KEYS.TOKEN, response.data.token);
                Storage.set(STORAGE_KEYS.USER, response.data.user);
                
                // Emit login event
                EventBus.emit('user:login', response.data.user);
                
                // Show success message
                Utils.showToast('Đăng nhập thành công!', 'success');
                
                // Close modal
                this.hideModal();
            }
        } catch (error) {
            Utils.showToast(error.message || 'Đăng nhập thất bại', 'error');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    },

    // Handle register
    async handleRegister(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Validate form
        if (!this.validateRegisterForm(data)) {
            return;
        }

        const submitBtn = form.querySelector('.auth-submit');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        try {
            const response = await API.post('/auth/register', data);
            
            if (response.success) {
                // Save auth data
                Storage.set(STORAGE_KEYS.TOKEN, response.data.token);
                Storage.set(STORAGE_KEYS.USER, response.data.user);
                
                // Emit login event
                EventBus.emit('user:login', response.data.user);
                
                // Show success message
                Utils.showToast('Đăng ký thành công!', 'success');
                
                // Close modal
                this.hideModal();
            }
        } catch (error) {
            Utils.showToast(error.message || 'Đăng ký thất bại', 'error');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    },

    // Handle profile update
    async handleProfileUpdate(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Organize address data
        const profileData = {
            name: data.name,
            phone: data.phone,
            address: {
                street: data.street,
                ward: data.ward,
                district: data.district,
                city: data.city
            }
        };

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        try {
            const response = await API.put('/auth/profile', profileData);
            
            if (response.success) {
                // Update stored user data
                Storage.set(STORAGE_KEYS.USER, response.data.user);
                
                // Emit update event
                EventBus.emit('user:updated', response.data.user);
                
                // Show success message
                Utils.showToast('Cập nhật thông tin thành công!', 'success');
                
                // Close modal
                this.hideModal();
            }
        } catch (error) {
            Utils.showToast(error.message || 'Cập nhật thất bại', 'error');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    },

    // Validate login form
    validateLoginForm(data) {
        let isValid = true;

        // Email validation
        if (!data.email || !Utils.validateEmail(data.email)) {
            this.showFieldError('email', 'Email không hợp lệ');
            isValid = false;
        }

        // Password validation
        if (!data.password || data.password.length < 6) {
            this.showFieldError('password', 'Mật khẩu phải có ít nhất 6 ký tự');
            isValid = false;
        }

        return isValid;
    },

    // Validate register form
    validateRegisterForm(data) {
        let isValid = true;

        // Name validation
        if (!data.name || data.name.trim().length < 2) {
            this.showFieldError('name', 'Tên phải có ít nhất 2 ký tự');
            isValid = false;
        }

        // Email validation
        if (!data.email || !Utils.validateEmail(data.email)) {
            this.showFieldError('email', 'Email không hợp lệ');
            isValid = false;
        }

        // Phone validation
        if (data.phone && !Utils.validatePhone(data.phone)) {
            this.showFieldError('phone', 'Số điện thoại không hợp lệ');
            isValid = false;
        }

        // Password validation
        if (!data.password || data.password.length < 6) {
            this.showFieldError('password', 'Mật khẩu phải có ít nhất 6 ký tự');
            isValid = false;
        }

        // Confirm password validation
        if (data.password !== data.confirmPassword) {
            this.showFieldError('confirmPassword', 'Mật khẩu xác nhận không khớp');
            isValid = false;
        }

        // Terms agreement
        if (!data.agree) {
            Utils.showToast('Vui lòng đồng ý với điều khoản sử dụng', 'warning');
            isValid = false;
        }

        return isValid;
    },

    // Show field error
    showFieldError(fieldName, message) {
        const field = document.querySelector(`[name="${fieldName}"]`);
        const errorDiv = field?.parentNode.querySelector('.form-error');
        
        if (field && errorDiv) {
            field.classList.add('error');
            errorDiv.textContent = message;
            errorDiv.classList.add('show');
            
            // Clear error on input
            field.addEventListener('input', () => {
                field.classList.remove('error');
                errorDiv.classList.remove('show');
            }, { once: true });
        }
    },

    // Toggle password visibility
    togglePassword(e) {
        const toggle = e.target.closest('.password-toggle');
        const input = toggle.parentNode.querySelector('input');
        const icon = toggle.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    },

    // Handle forgot password
    handleForgotPassword(e) {
        e.preventDefault();
        Utils.showToast('Chức năng quên mật khẩu sẽ được cập nhật sớm', 'info');
    },

    // Show change password form
    showChangePassword() {
        Utils.showToast('Chức năng đổi mật khẩu sẽ được cập nhật sớm', 'info');
    },

    // Logout user
    logout() {
        Storage.remove(STORAGE_KEYS.TOKEN);
        Storage.remove(STORAGE_KEYS.USER);
        EventBus.emit('user:logout');
    }
};

// Export module
window.AuthModule = AuthModule;
