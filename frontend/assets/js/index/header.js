// Header Module for Na Food App
const HeaderModule = {
    // Initialize header functionality
    init() {
        this.bindEvents();
        this.updateUserInterface();
        this.initMobileMenu();
        this.initSearch();
    },

    // Bind event listeners
    bindEvents() {
        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', this.handleNavigation.bind(this));
        });

        // User menu dropdown
        const userInfo = document.getElementById('userInfo');
        const userDropdown = document.getElementById('userDropdown');
        
        if (userInfo) {
            userInfo.addEventListener('click', () => {
                userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-menu')) {
                if (userDropdown) userDropdown.style.display = 'none';
            }
        });

        // Auth buttons
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const logoutBtn = document.getElementById('logoutBtn');

        if (loginBtn) loginBtn.addEventListener('click', () => this.showAuthModal('login'));
        if (registerBtn) registerBtn.addEventListener('click', () => this.showAuthModal('register'));
        if (logoutBtn) logoutBtn.addEventListener('click', this.handleLogout.bind(this));

        // Profile and orders links
        const profileLink = document.getElementById('profileLink');
        const ordersLink = document.getElementById('ordersLink');

        if (profileLink) profileLink.addEventListener('click', this.showProfile.bind(this));
        if (ordersLink) ordersLink.addEventListener('click', this.showOrders.bind(this));

        // Listen for auth events
        EventBus.on('user:login', this.updateUserInterface.bind(this));
        EventBus.on('user:logout', this.updateUserInterface.bind(this));
        EventBus.on('cart:update', this.updateCartCount.bind(this));
    },

    // Handle navigation
    handleNavigation(e) {
        e.preventDefault();
        const href = e.target.getAttribute('href');
        
        if (href.startsWith('#')) {
            const sectionId = href.substring(1);
            this.showSection(sectionId);
            
            // Update active nav link
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            e.target.classList.add('active');
            
            // Scroll to section if not home
            if (sectionId !== 'home') {
                Utils.scrollTo(sectionId);
            }
        }
    },

    // Show specific section
    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update URL without page reload
        Utils.setQueryParam('section', sectionId);
    },

    // Update user interface based on auth status
    updateUserInterface() {
        const user = Storage.get(STORAGE_KEYS.USER);
        const userInfo = document.getElementById('userInfo');
        const authButtons = document.getElementById('authButtons');
        const userName = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');

        if (user) {
            // User is logged in
            if (userInfo) userInfo.style.display = 'flex';
            if (authButtons) authButtons.style.display = 'none';
            if (userName) userName.textContent = user.name;
            if (userAvatar && user.avatar) userAvatar.src = user.avatar;
        } else {
            // User is not logged in
            if (userInfo) userInfo.style.display = 'none';
            if (authButtons) authButtons.style.display = 'flex';
        }
    },

    // Show authentication modal
    showAuthModal(type) {
        EventBus.emit('auth:show', { type });
    },

    // Handle user logout
    handleLogout() {
        if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            // Clear user data
            Storage.remove(STORAGE_KEYS.USER);
            Storage.remove(STORAGE_KEYS.TOKEN);
            
            // Update UI
            this.updateUserInterface();
            
            // Emit logout event
            EventBus.emit('user:logout');
            
            // Show success message
            Utils.showToast('Đăng xuất thành công', 'success');
            
            // Redirect to home if on protected page
            this.showSection('home');
        }
    },

    // Show user profile
    showProfile(e) {
        e.preventDefault();
        EventBus.emit('profile:show');
        document.getElementById('userDropdown').style.display = 'none';
    },

    // Show user orders
    showOrders(e) {
        e.preventDefault();
        this.showSection('orders');
        document.getElementById('userDropdown').style.display = 'none';
    },

    // Initialize mobile menu
    initMobileMenu() {
        const mobileToggle = document.getElementById('mobileMenuToggle');
        const navMenu = document.querySelector('.nav-menu');

        if (mobileToggle && navMenu) {
            mobileToggle.addEventListener('click', () => {
                navMenu.classList.toggle('mobile-active');
                mobileToggle.classList.toggle('active');
            });
        }
    },

    // Initialize search functionality
    initSearch() {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');

        if (searchInput && searchBtn) {
            // Debounced search
            const debouncedSearch = Utils.debounce(this.performSearch.bind(this), 300);
            
            searchInput.addEventListener('input', debouncedSearch);
            searchBtn.addEventListener('click', () => this.performSearch());
            
            // Search on Enter key
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }
    },

    // Perform search
    performSearch() {
        const searchInput = document.getElementById('searchInput');
        const query = searchInput.value.trim();

        if (query) {
            // Switch to products section
            this.showSection('products');
            
            // Emit search event
            EventBus.emit('products:search', { query });
            
            Utils.showToast(`Tìm kiếm: "${query}"`, 'info');
        }
    },

    // Update cart count in header
    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        const cart = Storage.get(STORAGE_KEYS.CART) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    },

    // Handle cart icon click
    showCart() {
        EventBus.emit('cart:show');
    }
};

// Initialize cart icon click handler
document.addEventListener('DOMContentLoaded', () => {
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.addEventListener('click', HeaderModule.showCart);
    }
});

// Export module
window.HeaderModule = HeaderModule;
