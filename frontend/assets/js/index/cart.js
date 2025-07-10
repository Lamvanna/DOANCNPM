// Cart Module for Na Food App
const CartModule = {
    // Cart state
    cart: [],

    // Initialize cart functionality
    init() {
        this.loadCart();
        this.bindEvents();
        this.updateCartDisplay();
    },

    // Bind event listeners
    bindEvents() {
        // Close cart button
        const closeCart = document.getElementById('closeCart');
        if (closeCart) {
            closeCart.addEventListener('click', this.hideCart.bind(this));
        }

        // Cart overlay
        const cartOverlay = document.querySelector('.cart-overlay');
        if (cartOverlay) {
            cartOverlay.addEventListener('click', this.hideCart.bind(this));
        }

        // Checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', this.proceedToCheckout.bind(this));
        }

        // Listen for cart events
        EventBus.on('cart:show', this.showCart.bind(this));
        EventBus.on('cart:add', this.addToCart.bind(this));
        EventBus.on('cart:remove', this.removeFromCart.bind(this));
        EventBus.on('cart:update', this.updateQuantity.bind(this));
        EventBus.on('cart:clear', this.clearCart.bind(this));
    },

    // Load cart from localStorage
    loadCart() {
        this.cart = Storage.get(STORAGE_KEYS.CART) || [];
    },

    // Save cart to localStorage
    saveCart() {
        Storage.set(STORAGE_KEYS.CART, this.cart);
        EventBus.emit('cart:updated', { cart: this.cart });
    },

    // Add item to cart
    addToCart(data) {
        const { product, quantity = 1 } = data;
        
        if (!product || !product._id) {
            Utils.showToast('Sản phẩm không hợp lệ', 'error');
            return;
        }

        // Check if item already exists in cart
        const existingItem = this.cart.find(item => item.product._id === product._id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                id: Utils.generateId(),
                product: {
                    _id: product._id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    isAvailable: product.isAvailable
                },
                quantity: quantity
            });
        }

        this.saveCart();
        this.updateCartDisplay();
        
        // Show success message
        Utils.showToast(`Đã thêm ${product.name} vào giỏ hàng`, 'success');
    },

    // Remove item from cart
    removeFromCart(data) {
        const { itemId } = data;
        
        const itemIndex = this.cart.findIndex(item => item.id === itemId);
        if (itemIndex > -1) {
            const item = this.cart[itemIndex];
            this.cart.splice(itemIndex, 1);
            
            this.saveCart();
            this.updateCartDisplay();
            
            Utils.showToast(`Đã xóa ${item.product.name} khỏi giỏ hàng`, 'success');
        }
    },

    // Update item quantity
    updateQuantity(data) {
        const { itemId, quantity } = data;
        
        const item = this.cart.find(item => item.id === itemId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart({ itemId });
            } else {
                item.quantity = quantity;
                this.saveCart();
                this.updateCartDisplay();
            }
        }
    },

    // Clear entire cart
    clearCart() {
        if (this.cart.length === 0) return;
        
        if (confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?')) {
            this.cart = [];
            this.saveCart();
            this.updateCartDisplay();
            Utils.showToast('Đã xóa tất cả sản phẩm trong giỏ hàng', 'success');
        }
    },

    // Show cart sidebar
    showCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        const cartOverlay = document.querySelector('.cart-overlay');
        
        if (cartSidebar) {
            cartSidebar.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        
        if (cartOverlay) {
            cartOverlay.classList.add('active');
        }
        
        this.updateCartDisplay();
    },

    // Hide cart sidebar
    hideCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        const cartOverlay = document.querySelector('.cart-overlay');
        
        if (cartSidebar) {
            cartSidebar.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        if (cartOverlay) {
            cartOverlay.classList.remove('active');
        }
    },

    // Update cart display
    updateCartDisplay() {
        this.updateCartContent();
        this.updateCartTotal();
        this.updateCartCount();
    },

    // Update cart content
    updateCartContent() {
        const cartContent = document.getElementById('cartContent');
        if (!cartContent) return;

        if (this.cart.length === 0) {
            cartContent.innerHTML = `
                <div class="cart-empty">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Giỏ hàng trống</h3>
                    <p>Thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
                    <button class="btn btn-primary" onclick="CartModule.hideCart()">
                        Tiếp tục mua sắm
                    </button>
                </div>
            `;
            return;
        }

        cartContent.innerHTML = this.cart.map(item => this.createCartItemHTML(item)).join('');
        this.bindCartItemEvents();
    },

    // Create cart item HTML
    createCartItemHTML(item) {
        const { product, quantity } = item;
        const subtotal = product.price * quantity;

        return `
            <div class="cart-item" data-item-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${product.name}</div>
                    <div class="cart-item-price">${Utils.formatCurrency(product.price)}</div>
                    <div class="cart-item-controls">
                        <div class="quantity-controls">
                            <button class="quantity-btn decrease" data-item-id="${item.id}" ${quantity <= 1 ? 'disabled' : ''}>
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="quantity-display">${quantity}</span>
                            <button class="quantity-btn increase" data-item-id="${item.id}">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <button class="remove-item" data-item-id="${item.id}" title="Xóa sản phẩm">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // Bind cart item events
    bindCartItemEvents() {
        // Quantity controls
        document.querySelectorAll('.quantity-btn.decrease').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.currentTarget.dataset.itemId;
                const item = this.cart.find(item => item.id === itemId);
                if (item && item.quantity > 1) {
                    this.updateQuantity({ itemId, quantity: item.quantity - 1 });
                }
            });
        });

        document.querySelectorAll('.quantity-btn.increase').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.currentTarget.dataset.itemId;
                const item = this.cart.find(item => item.id === itemId);
                if (item) {
                    this.updateQuantity({ itemId, quantity: item.quantity + 1 });
                }
            });
        });

        // Remove item buttons
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.currentTarget.dataset.itemId;
                this.removeFromCart({ itemId });
            });
        });
    },

    // Update cart total
    updateCartTotal() {
        const cartTotal = document.getElementById('cartTotal');
        if (!cartTotal) return;

        const total = this.getCartTotal();
        cartTotal.textContent = Utils.formatCurrency(total);
    },

    // Update cart count in header
    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        if (!cartCount) return;

        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    },

    // Get cart total
    getCartTotal() {
        return this.cart.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);
    },

    // Get cart item count
    getCartItemCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    },

    // Proceed to checkout
    proceedToCheckout() {
        if (this.cart.length === 0) {
            Utils.showToast('Giỏ hàng trống', 'warning');
            return;
        }

        // Check if user is logged in
        const user = Storage.get(STORAGE_KEYS.USER);
        if (!user) {
            Utils.showToast('Vui lòng đăng nhập để tiếp tục', 'warning');
            EventBus.emit('auth:show', { type: 'login' });
            return;
        }

        // Hide cart and show checkout
        this.hideCart();
        EventBus.emit('checkout:show', { cart: this.cart });
    },

    // Get cart data for checkout
    getCartData() {
        return {
            items: this.cart,
            total: this.getCartTotal(),
            itemCount: this.getCartItemCount()
        };
    }
};

// Export module
window.CartModule = CartModule;
