// Admin Login Module
const AdminLoginModule = {
    // Initialize login functionality
    init() {
        this.bindEvents();
        this.checkAuthStatus();
    },

    // Bind event listeners
    bindEvents() {
        // Login form submission
        const loginForm = document.getElementById('adminLoginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }

        // Password toggle
        const passwordToggle = document.querySelector('.password-toggle');
        if (passwordToggle) {
            passwordToggle.addEventListener('click', this.togglePassword);
        }

        // Logout button
        const logoutBtn = document.getElementById('adminLogout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        }

        // Sidebar toggle for mobile
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', this.toggleSidebar);
        }

        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', this.handleNavigation.bind(this));
        });
    },

    // Check authentication status
    checkAuthStatus() {
        const token = Utils.storage.get('token');
        const user = Utils.storage.get('user');

        if (token && user && (user.role === 'admin' || user.role === 'staff')) {
            this.showDashboard(user);
        } else {
            this.showLogin();
        }
    },

    // Handle login form submission
    async handleLogin(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Validate form
        if (!this.validateLoginForm(data)) {
            return;
        }

        const submitBtn = form.querySelector('.login-btn');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        try {
            const response = await AuthAPI.login(data.email, data.password);
            
            if (response.success) {
                const { user, token } = response.data;
                
                // Check if user has admin/staff role
                if (user.role !== 'admin' && user.role !== 'staff') {
                    throw new Error('Bạn không có quyền truy cập vào trang quản trị');
                }

                // Save auth data
                Utils.storage.set('token', token);
                Utils.storage.set('user', user);
                
                // Show success message
                Utils.showToast('Đăng nhập thành công!', 'success');
                
                // Show dashboard
                this.showDashboard(user);
            }
        } catch (error) {
            Utils.showToast(error.message || 'Đăng nhập thất bại', 'error');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    },

    // Handle logout
    handleLogout() {
        if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            // Clear auth data
            Utils.storage.remove('token');
            Utils.storage.remove('user');
            
            // Show success message
            Utils.showToast('Đăng xuất thành công', 'success');
            
            // Show login screen
            this.showLogin();
        }
    },

    // Show login screen
    showLogin() {
        const loginScreen = document.getElementById('adminLogin');
        const dashboard = document.getElementById('adminDashboard');
        
        if (loginScreen) loginScreen.style.display = 'flex';
        if (dashboard) dashboard.style.display = 'none';
    },

    // Show dashboard
    showDashboard(user) {
        const loginScreen = document.getElementById('adminLogin');
        const dashboard = document.getElementById('adminDashboard');
        
        if (loginScreen) loginScreen.style.display = 'none';
        if (dashboard) dashboard.style.display = 'flex';
        
        // Update user info in sidebar
        this.updateUserInfo(user);
        
        // Initialize dashboard modules
        if (typeof AdminDashboardModule !== 'undefined') {
            AdminDashboardModule.loadDashboardData();
        }
    },

    // Update user info in sidebar
    updateUserInfo(user) {
        const adminName = document.getElementById('adminName');
        const adminRole = document.getElementById('adminRole');
        const adminAvatar = document.getElementById('adminAvatar');
        
        if (adminName) adminName.textContent = user.name;
        if (adminRole) {
            const roleText = user.role === 'admin' ? 'Quản trị viên' : 'Nhân viên';
            adminRole.textContent = roleText;
        }
        if (adminAvatar && user.avatar) {
            adminAvatar.src = user.avatar;
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

    // Toggle sidebar for mobile
    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.toggle('active');
        }
    },

    // Handle navigation
    handleNavigation(e) {
        e.preventDefault();
        
        const link = e.currentTarget;
        const section = link.dataset.section;
        
        if (!section) return;
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(navLink => {
            navLink.classList.remove('active');
        });
        link.classList.add('active');
        
        // Show corresponding section
        this.showSection(section);
        
        // Update page title
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            const titles = {
                dashboard: 'Dashboard',
                products: 'Quản lý sản phẩm',
                orders: 'Quản lý đơn hàng',
                users: 'Quản lý người dùng',
                reviews: 'Quản lý đánh giá',
                banners: 'Quản lý banner',
                reports: 'Báo cáo thống kê'
            };
            pageTitle.textContent = titles[section] || 'Dashboard';
        }
        
        // Close sidebar on mobile after navigation
        if (window.innerWidth <= 768) {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.classList.remove('active');
            }
        }
    },

    // Show specific section
    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        const targetSection = document.getElementById(`${sectionName}Section`);
        if (targetSection) {
            targetSection.classList.add('active');
            
            // Load section data
            this.loadSectionData(sectionName);
        }
    },

    // Load section data
    loadSectionData(sectionName) {
        switch (sectionName) {
            case 'dashboard':
                if (typeof AdminDashboardModule !== 'undefined') {
                    AdminDashboardModule.loadDashboardData();
                }
                break;
            case 'products':
                if (typeof AdminProductModule !== 'undefined') {
                    AdminProductModule.loadProducts();
                }
                break;
            case 'orders':
                if (typeof AdminOrderModule !== 'undefined') {
                    AdminOrderModule.loadOrders();
                }
                break;
            case 'users':
                if (typeof AdminUserModule !== 'undefined') {
                    AdminUserModule.loadUsers();
                }
                break;
            case 'reviews':
                if (typeof AdminReviewModule !== 'undefined') {
                    AdminReviewModule.loadReviews();
                }
                break;
            case 'banners':
                if (typeof AdminBannerModule !== 'undefined') {
                    AdminBannerModule.loadBanners();
                }
                break;
            case 'reports':
                if (typeof AdminReportModule !== 'undefined') {
                    AdminReportModule.loadReports();
                }
                break;
        }
    }
};

// Export module
window.AdminLoginModule = AdminLoginModule;
