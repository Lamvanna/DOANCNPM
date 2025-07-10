// Products Module for Na Food App
const ProductsModule = {
    // Current state
    currentPage: 1,
    currentFilters: {
        category: 'all',
        sort: 'newest',
        search: '',
        minPrice: '',
        maxPrice: ''
    },
    products: [],
    categories: [],

    // Initialize products functionality
    init() {
        this.bindEvents();
        this.loadBanners();
        this.loadFeaturedProducts();
        this.loadProducts();
        this.loadCategories();
    },

    // Bind event listeners
    bindEvents() {
        // Filter events
        const categoryFilter = document.getElementById('categoryFilter');
        const sortFilter = document.getElementById('sortFilter');
        const applyPriceFilter = document.getElementById('applyPriceFilter');

        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.currentFilters.category = e.target.value;
                this.currentPage = 1;
                this.loadProducts();
            });
        }

        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                this.currentFilters.sort = e.target.value;
                this.currentPage = 1;
                this.loadProducts();
            });
        }

        if (applyPriceFilter) {
            applyPriceFilter.addEventListener('click', () => {
                const minPrice = document.getElementById('minPrice').value;
                const maxPrice = document.getElementById('maxPrice').value;
                
                this.currentFilters.minPrice = minPrice;
                this.currentFilters.maxPrice = maxPrice;
                this.currentPage = 1;
                this.loadProducts();
            });
        }

        // Listen for search events
        EventBus.on('products:search', (data) => {
            this.currentFilters.search = data.query;
            this.currentPage = 1;
            this.loadProducts();
        });

        // Listen for banner clicks
        EventBus.on('banner:click', this.handleBannerClick.bind(this));
    },

    // Load banners
    async loadBanners() {
        try {
            const response = await API.get('/banners/active');
            const banners = response.data.banners || [];
            this.renderBanners(banners);
        } catch (error) {
            console.error('Error loading banners:', error);
        }
    },

    // Render banners
    renderBanners(banners) {
        const container = document.querySelector('.banner-container');
        const dotsContainer = document.getElementById('bannerDots');
        
        if (!container || !banners.length) return;

        // Render banner slides
        container.innerHTML = banners.map(banner => `
            <div class="banner-slide" style="background-image: url('${banner.image}')">
                <div class="banner-content">
                    <h2 class="banner-title">${banner.title}</h2>
                    <p class="banner-description">${banner.description}</p>
                    <a href="${banner.link}" class="banner-button">${banner.buttonText || 'Xem thêm'}</a>
                </div>
            </div>
        `).join('');

        // Render dots
        if (dotsContainer) {
            dotsContainer.innerHTML = banners.map((_, index) => `
                <div class="banner-dot ${index === 0 ? 'active' : ''}" data-slide="${index}"></div>
            `).join('');

            // Bind dot events
            dotsContainer.querySelectorAll('.banner-dot').forEach(dot => {
                dot.addEventListener('click', (e) => {
                    const slideIndex = parseInt(e.target.dataset.slide);
                    this.goToSlide(slideIndex);
                });
            });
        }

        // Auto-slide banners
        this.initBannerSlider(banners.length);
    },

    // Initialize banner slider
    initBannerSlider(totalSlides) {
        if (totalSlides <= 1) return;

        let currentSlide = 0;
        const container = document.querySelector('.banner-container');
        const dots = document.querySelectorAll('.banner-dot');

        const nextSlide = () => {
            currentSlide = (currentSlide + 1) % totalSlides;
            this.goToSlide(currentSlide);
        };

        // Auto-advance every 5 seconds
        setInterval(nextSlide, 5000);
    },

    // Go to specific slide
    goToSlide(slideIndex) {
        const container = document.querySelector('.banner-container');
        const dots = document.querySelectorAll('.banner-dot');
        
        if (container) {
            container.style.transform = `translateX(-${slideIndex * 100}%)`;
        }

        // Update active dot
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === slideIndex);
        });
    },

    // Load featured products
    async loadFeaturedProducts() {
        try {
            const response = await API.get('/products/featured');
            const products = response.data.products || [];
            this.renderFeaturedProducts(products);
        } catch (error) {
            console.error('Error loading featured products:', error);
        }
    },

    // Render featured products
    renderFeaturedProducts(products) {
        const container = document.getElementById('featuredProducts');
        if (!container) return;

        if (products.length === 0) {
            container.innerHTML = '<p class="text-center">Không có sản phẩm nổi bật</p>';
            return;
        }

        container.innerHTML = products.map(product => this.createProductCard(product)).join('');
        this.bindProductEvents(container);
    },

    // Load products with filters
    async loadProducts() {
        try {
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: 12,
                ...this.currentFilters
            });

            // Remove empty filters
            Object.keys(this.currentFilters).forEach(key => {
                if (!this.currentFilters[key] || this.currentFilters[key] === 'all') {
                    params.delete(key);
                }
            });

            const response = await API.get(`/products?${params}`);
            this.products = response.data.products || [];
            this.categories = response.data.categories || [];
            
            this.renderProducts();
            this.renderPagination(response.data.pagination);
            this.updateCategoryFilter();
        } catch (error) {
            console.error('Error loading products:', error);
            Utils.showToast('Không thể tải danh sách sản phẩm', 'error');
        }
    },

    // Load categories
    async loadCategories() {
        try {
            const response = await API.get('/products?limit=1');
            this.categories = response.data.categories || [];
            this.updateCategoryFilter();
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    },

    // Update category filter options
    updateCategoryFilter() {
        const categoryFilter = document.getElementById('categoryFilter');
        if (!categoryFilter || !this.categories.length) return;

        const currentValue = categoryFilter.value;
        categoryFilter.innerHTML = '<option value="all">Tất cả</option>' +
            this.categories.map(category => 
                `<option value="${category}" ${category === currentValue ? 'selected' : ''}>${category}</option>`
            ).join('');
    },

    // Render products
    renderProducts() {
        const container = document.getElementById('productsGrid');
        if (!container) return;

        if (this.products.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>Không tìm thấy sản phẩm</h3>
                    <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.products.map(product => this.createProductCard(product)).join('');
        this.bindProductEvents(container);
    },

    // Create product card HTML
    createProductCard(product) {
        const discountPercent = product.discountPercentage || 0;
        const rating = product.rating?.average || 0;
        const ratingCount = product.rating?.count || 0;

        return `
            <div class="product-card" data-product-id="${product._id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    ${discountPercent > 0 ? `<div class="product-badge discount">-${discountPercent}%</div>` : ''}
                    ${product.isFeatured ? '<div class="product-badge new">Nổi bật</div>' : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-rating">
                        <div class="stars">
                            ${this.renderStars(rating)}
                        </div>
                        <span class="rating-text">(${ratingCount})</span>
                    </div>
                    <div class="product-price">
                        <span class="price-current">${Utils.formatCurrency(product.price)}</span>
                        ${product.originalPrice ? `<span class="price-original">${Utils.formatCurrency(product.originalPrice)}</span>` : ''}
                    </div>
                    <div class="product-actions">
                        <button class="btn-add-cart" data-product-id="${product._id}" ${!product.isAvailable ? 'disabled' : ''}>
                            ${product.isAvailable ? 'Thêm vào giỏ' : 'Hết hàng'}
                        </button>
                        <button class="btn-quick-view" data-product-id="${product._id}">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // Render star rating
    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let stars = '';
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star star"></i>';
        }
        
        // Half star
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt star"></i>';
        }
        
        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star star empty"></i>';
        }

        return stars;
    },

    // Bind product events
    bindProductEvents(container) {
        // Add to cart buttons
        container.querySelectorAll('.btn-add-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = btn.dataset.productId;
                this.addToCart(productId);
            });
        });

        // Quick view buttons
        container.querySelectorAll('.btn-quick-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = btn.dataset.productId;
                this.showProductDetail(productId);
            });
        });

        // Product cards
        container.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', () => {
                const productId = card.dataset.productId;
                this.showProductDetail(productId);
            });
        });
    },

    // Add product to cart
    addToCart(productId) {
        const product = this.products.find(p => p._id === productId);
        if (!product || !product.isAvailable) return;

        EventBus.emit('cart:add', { product, quantity: 1 });
        Utils.showToast(`Đã thêm ${product.name} vào giỏ hàng`, 'success');
    },

    // Show product detail
    showProductDetail(productId) {
        EventBus.emit('product:show', { productId });
    },

    // Render pagination
    renderPagination(pagination) {
        const container = document.getElementById('pagination');
        if (!container || !pagination) return;

        const { page, pages, total } = pagination;
        
        if (pages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <button ${page <= 1 ? 'disabled' : ''} onclick="ProductsModule.goToPage(${page - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // Page numbers
        const startPage = Math.max(1, page - 2);
        const endPage = Math.min(pages, page + 2);

        if (startPage > 1) {
            paginationHTML += `<button onclick="ProductsModule.goToPage(1)">1</button>`;
            if (startPage > 2) {
                paginationHTML += `<span>...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="${i === page ? 'active' : ''}" onclick="ProductsModule.goToPage(${i})">
                    ${i}
                </button>
            `;
        }

        if (endPage < pages) {
            if (endPage < pages - 1) {
                paginationHTML += `<span>...</span>`;
            }
            paginationHTML += `<button onclick="ProductsModule.goToPage(${pages})">${pages}</button>`;
        }

        // Next button
        paginationHTML += `
            <button ${page >= pages ? 'disabled' : ''} onclick="ProductsModule.goToPage(${page + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        // Info
        paginationHTML += `
            <div class="pagination-info">
                Hiển thị ${(page - 1) * 12 + 1}-${Math.min(page * 12, total)} trong ${total} sản phẩm
            </div>
        `;

        container.innerHTML = paginationHTML;
    },

    // Go to specific page
    goToPage(page) {
        this.currentPage = page;
        this.loadProducts();
        Utils.scrollTo('products');
    },

    // Handle banner click
    handleBannerClick(data) {
        // Handle banner click actions
        console.log('Banner clicked:', data);
    }
};

// Export module
window.ProductsModule = ProductsModule;
