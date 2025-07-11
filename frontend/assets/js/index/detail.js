// Product Detail Module for Na Food App
const ProductDetailModule = {
    currentProduct: null,

    // Initialize product detail functionality
    init() {
        this.bindEvents();
    },

    // Bind event listeners
    bindEvents() {
        // Listen for product detail events
        EventBus.on('product:show', this.showProductDetail.bind(this));
    },

    // Show product detail modal
    async showProductDetail(data) {
        const { productId } = data;
        
        try {
            const response = await API.get(`/products/${productId}`);
            this.currentProduct = response.data.product;
            
            const modal = document.getElementById('productModal');
            const content = document.getElementById('productContent');
            
            if (modal && content) {
                content.innerHTML = this.getProductDetailHTML(this.currentProduct);
                modal.style.display = 'block';
                this.bindProductDetailEvents();
            }
        } catch (error) {
            Utils.showToast('Không thể tải thông tin sản phẩm', 'error');
        }
    },

    // Get product detail HTML
    getProductDetailHTML(product) {
        const rating = product.rating?.average || 0;
        const ratingCount = product.rating?.count || 0;
        const discountPercent = product.discountPercentage || 0;

        return `
            <div class="product-detail">
                <div class="product-detail-images">
                    <div class="main-image">
                        <img src="${product.image}" alt="${product.name}" id="mainProductImage">
                    </div>
                    ${product.images && product.images.length > 0 ? `
                        <div class="thumbnail-images">
                            <img src="${product.image}" alt="${product.name}" class="thumbnail active">
                            ${product.images.map(img => `
                                <img src="${img}" alt="${product.name}" class="thumbnail">
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                
                <div class="product-detail-info">
                    <h1 class="product-detail-name">${product.name}</h1>
                    
                    <div class="product-detail-rating">
                        <div class="stars">
                            ${this.renderStars(rating)}
                        </div>
                        <span class="rating-text">(${ratingCount} đánh giá)</span>
                    </div>
                    
                    <div class="product-detail-price">
                        <span class="price-current">${Utils.formatCurrency(product.price)}</span>
                        ${product.originalPrice ? `
                            <span class="price-original">${Utils.formatCurrency(product.originalPrice)}</span>
                            <span class="discount-badge">-${discountPercent}%</span>
                        ` : ''}
                    </div>
                    
                    <div class="product-detail-description">
                        <h3>Mô tả sản phẩm</h3>
                        <p>${product.description}</p>
                    </div>
                    
                    ${product.nutritionInfo ? `
                        <div class="nutrition-info">
                            <h3>Thông tin dinh dưỡng</h3>
                            <div class="nutrition-grid">
                                ${product.nutritionInfo.calories ? `<div class="nutrition-item"><span>Calories:</span> <strong>${product.nutritionInfo.calories}</strong></div>` : ''}
                                ${product.nutritionInfo.protein ? `<div class="nutrition-item"><span>Protein:</span> <strong>${product.nutritionInfo.protein}g</strong></div>` : ''}
                                ${product.nutritionInfo.carbs ? `<div class="nutrition-item"><span>Carbs:</span> <strong>${product.nutritionInfo.carbs}g</strong></div>` : ''}
                                ${product.nutritionInfo.fat ? `<div class="nutrition-item"><span>Fat:</span> <strong>${product.nutritionInfo.fat}g</strong></div>` : ''}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="product-detail-actions">
                        <div class="quantity-selector">
                            <label>Số lượng:</label>
                            <div class="quantity-controls">
                                <button class="quantity-btn decrease" id="decreaseQty">-</button>
                                <span class="quantity-display" id="productQuantity">1</span>
                                <button class="quantity-btn increase" id="increaseQty">+</button>
                            </div>
                        </div>
                        
                        <div class="action-buttons">
                            <button class="btn btn-primary btn-add-to-cart" id="addToCartBtn" ${!product.isAvailable ? 'disabled' : ''}>
                                <i class="fas fa-shopping-cart"></i>
                                ${product.isAvailable ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
                            </button>
                        </div>
                    </div>
                    
                    <div class="product-meta">
                        <div class="meta-item">
                            <span>Danh mục:</span> <strong>${product.category}</strong>
                        </div>
                        <div class="meta-item">
                            <span>Thời gian chuẩn bị:</span> <strong>${product.preparationTime || 15} phút</strong>
                        </div>
                        <div class="meta-item">
                            <span>Đã bán:</span> <strong>${product.soldCount || 0} suất</strong>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="product-reviews-section">
                <h3>Đánh giá sản phẩm</h3>
                <div id="productReviews">
                    <!-- Reviews will be loaded here -->
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
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star star"></i>';
        }
        
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt star"></i>';
        }
        
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star star empty"></i>';
        }

        return stars;
    },

    // Bind product detail events
    bindProductDetailEvents() {
        let quantity = 1;

        // Quantity controls
        const decreaseBtn = document.getElementById('decreaseQty');
        const increaseBtn = document.getElementById('increaseQty');
        const quantityDisplay = document.getElementById('productQuantity');

        if (decreaseBtn) {
            decreaseBtn.addEventListener('click', () => {
                if (quantity > 1) {
                    quantity--;
                    quantityDisplay.textContent = quantity;
                }
            });
        }

        if (increaseBtn) {
            increaseBtn.addEventListener('click', () => {
                if (quantity < 99) {
                    quantity++;
                    quantityDisplay.textContent = quantity;
                }
            });
        }

        // Add to cart button
        const addToCartBtn = document.getElementById('addToCartBtn');
        if (addToCartBtn && this.currentProduct) {
            addToCartBtn.addEventListener('click', () => {
                const cartItem = {
                    product: this.currentProduct,
                    quantity: quantity
                };

                EventBus.emit('cart:add', cartItem);
                Utils.showToast(`Đã thêm ${this.currentProduct.name} vào giỏ hàng`, 'success');
            });
        }

        // Image thumbnails
        const thumbnails = document.querySelectorAll('.thumbnail');
        const mainImage = document.getElementById('mainProductImage');

        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                // Remove active class from all thumbnails
                thumbnails.forEach(t => t.classList.remove('active'));
                // Add active class to clicked thumbnail
                thumb.classList.add('active');
                // Update main image
                if (mainImage) {
                    mainImage.src = thumb.src;
                }
            });
        });

        // Close modal events
        const modal = document.getElementById('productModal');
        const closeBtn = modal?.querySelector('.close');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        // Close on outside click
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }

        // Load reviews
        this.loadProductReviews(this.currentProduct._id);
    },

    // Load product reviews
    async loadProductReviews(productId) {
        try {
            const response = await API.get(`/reviews/product/${productId}`);
            const reviewsContainer = document.getElementById('productReviews');

            if (response.success && response.data.reviews.length > 0) {
                reviewsContainer.innerHTML = response.data.reviews.map(review => `
                    <div class="review-item">
                        <div class="review-header">
                            <div class="reviewer-info">
                                <strong>${review.user.name}</strong>
                                <div class="review-rating">
                                    ${this.renderStars(review.rating)}
                                </div>
                            </div>
                            <span class="review-date">${new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div class="review-content">
                            <p>${review.comment}</p>
                        </div>
                    </div>
                `).join('');
            } else {
                reviewsContainer.innerHTML = `
                    <div class="no-reviews">
                        <i class="fas fa-star-o"></i>
                        <p>Chưa có đánh giá nào cho sản phẩm này</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
            const reviewsContainer = document.getElementById('productReviews');
            if (reviewsContainer) {
                reviewsContainer.innerHTML = `
                    <div class="no-reviews">
                        <p>Không thể tải đánh giá</p>
                    </div>
                `;
            }
        }
    }
};

window.ProductDetailModule = ProductDetailModule;
                    quantity--;
                    quantityDisplay.textContent = quantity;
                }
            });
        }

        if (increaseBtn) {
            increaseBtn.addEventListener('click', () => {
                quantity++;
                quantityDisplay.textContent = quantity;
            });
        }

        // Add to cart button
        const addToCartBtn = document.getElementById('addToCartBtn');
        if (addToCartBtn && this.currentProduct) {
            addToCartBtn.addEventListener('click', () => {
                EventBus.emit('cart:add', { 
                    product: this.currentProduct, 
                    quantity: quantity 
                });
                Utils.showToast(`Đã thêm ${quantity} ${this.currentProduct.name} vào giỏ hàng`, 'success');
            });
        }

        // Image thumbnails
        document.querySelectorAll('.thumbnail').forEach(thumb => {
            thumb.addEventListener('click', (e) => {
                document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                
                const mainImage = document.getElementById('mainProductImage');
                if (mainImage) {
                    mainImage.src = e.target.src;
                }
            });
        });

        // Load reviews
        this.loadProductReviews();
    },

    // Load product reviews
    async loadProductReviews() {
        if (!this.currentProduct) return;

        try {
            const response = await API.get(`/reviews/product/${this.currentProduct._id}`);
            const reviews = response.data.reviews || [];
            this.renderProductReviews(reviews);
        } catch (error) {
            console.error('Error loading reviews:', error);
        }
    },

    // Render product reviews
    renderProductReviews(reviews) {
        const container = document.getElementById('productReviews');
        if (!container) return;

        if (reviews.length === 0) {
            container.innerHTML = '<p class="no-reviews">Chưa có đánh giá nào cho sản phẩm này.</p>';
            return;
        }

        container.innerHTML = reviews.map(review => `
            <div class="review-item">
                <div class="review-header">
                    <div class="reviewer-info">
                        <img src="${review.user?.avatar || '/assets/images/default-avatar.png'}" alt="Avatar" class="reviewer-avatar">
                        <div>
                            <div class="reviewer-name">${review.user?.name || 'Ẩn danh'}</div>
                            <div class="review-date">${Utils.formatDate(review.createdAt)}</div>
                        </div>
                    </div>
                    <div class="review-rating">
                        ${this.renderStars(review.rating)}
                    </div>
                </div>
                <div class="review-content">
                    <p>${review.comment}</p>
                    ${review.images && review.images.length > 0 ? `
                        <div class="review-images">
                            ${review.images.map(img => `
                                <img src="${img}" alt="Review image" class="review-image">
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                ${review.adminResponse ? `
                    <div class="admin-response">
                        <strong>Phản hồi từ cửa hàng:</strong>
                        <p>${review.adminResponse.message}</p>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }
};

// Export module
window.ProductDetailModule = ProductDetailModule;
