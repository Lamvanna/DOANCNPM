// Checkout Module for Na Food App
const CheckoutModule = {
    // Checkout state
    checkoutData: {
        cart: [],
        shippingInfo: {},
        paymentMethod: 'cash',
        note: ''
    },

    // Initialize checkout functionality
    init() {
        this.bindEvents();
    },

    // Bind event listeners
    bindEvents() {
        // Listen for checkout events
        EventBus.on('checkout:show', this.showCheckout.bind(this));

        // Close modal events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('checkout-modal')) {
                this.hideCheckout();
            }
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideCheckout();
            }
        });
    },

    // Show checkout modal
    showCheckout(data) {
        const { cart } = data;
        this.checkoutData.cart = cart;

        const user = Storage.get(STORAGE_KEYS.USER);
        if (!user) {
            Utils.showToast('Vui lòng đăng nhập để tiếp tục', 'warning');
            EventBus.emit('auth:show', { type: 'login' });
            return;
        }

        // Validate cart
        if (!cart || cart.length === 0) {
            Utils.showToast('Giỏ hàng trống', 'warning');
            return;
        }

        this.createCheckoutModal();
        this.populateUserInfo(user);
    },

    // Create checkout modal
    createCheckoutModal() {
        // Remove existing modal if any
        const existingModal = document.getElementById('checkoutModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'checkoutModal';
        modal.className = 'checkout-modal';
        modal.innerHTML = this.getCheckoutHTML();

        document.body.appendChild(modal);
        modal.style.display = 'block';

        this.bindCheckoutEvents();
    },

    // Get checkout HTML
    getCheckoutHTML() {
        const total = this.calculateTotal();
        const shippingFee = 30000; // 30k shipping fee
        const finalTotal = total + shippingFee;

        return `
            <div class="checkout-content">
                <div class="checkout-header">
                    <h2>Thanh toán đơn hàng</h2>
                    <button class="close-checkout">&times;</button>
                </div>

                <div class="checkout-body">
                    <div class="checkout-left">
                        <!-- Shipping Information -->
                        <div class="checkout-section">
                            <h3>Thông tin giao hàng</h3>
                            <form id="shippingForm" class="shipping-form">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Họ và tên *</label>
                                        <input type="text" name="name" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Số điện thoại *</label>
                                        <input type="tel" name="phone" required>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label>Địa chỉ giao hàng *</label>
                                    <input type="text" name="address" placeholder="Số nhà, tên đường" required>
                                </div>

                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Phường/Xã *</label>
                                        <input type="text" name="ward" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Quận/Huyện *</label>
                                        <input type="text" name="district" required>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label>Thành phố *</label>
                                    <input type="text" name="city" value="TP. Hồ Chí Minh" required>
                                </div>

                                <div class="form-group">
                                    <label>Ghi chú</label>
                                    <textarea name="note" placeholder="Ghi chú cho đơn hàng (tùy chọn)" rows="3"></textarea>
                                </div>
                            </form>
                        </div>

                        <!-- Payment Method -->
                        <div class="checkout-section">
                            <h3>Phương thức thanh toán</h3>
                            <div class="payment-methods">
                                <label class="payment-option">
                                    <input type="radio" name="paymentMethod" value="cash" checked>
                                    <div class="payment-info">
                                        <i class="fas fa-money-bill-wave"></i>
                                        <div class="payment-details">
                                            <span class="payment-title">Thanh toán khi nhận hàng (COD)</span>
                                            <span class="payment-desc">Thanh toán bằng tiền mặt khi nhận hàng</span>
                                        </div>
                                    </div>
                                </label>

                                <label class="payment-option">
                                    <input type="radio" name="paymentMethod" value="bank">
                                    <div class="payment-info">
                                        <i class="fas fa-university"></i>
                                        <div class="payment-details">
                                            <span class="payment-title">Chuyển khoản ngân hàng</span>
                                            <span class="payment-desc">Chuyển khoản qua ATM/Internet Banking</span>
                                        </div>
                                    </div>
                                </label>

                                <label class="payment-option">
                                    <input type="radio" name="paymentMethod" value="momo">
                                    <div class="payment-info">
                                        <i class="fas fa-mobile-alt"></i>
                                        <div class="payment-details">
                                            <span class="payment-title">Ví MoMo</span>
                                            <span class="payment-desc">Thanh toán qua ví điện tử MoMo</span>
                                        </div>
                                    </div>
                                </label>

                                <label class="payment-option">
                                    <input type="radio" name="paymentMethod" value="vnpay">
                                    <div class="payment-info">
                                        <i class="fas fa-credit-card"></i>
                                        <div class="payment-details">
                                            <span class="payment-title">VNPay</span>
                                            <span class="payment-desc">Thanh toán qua thẻ ATM/Visa/MasterCard</span>
                                        </div>
                                    </div>
                                </label>
                            </div>

                            <!-- Payment Details Section -->
                            <div class="payment-details-section" id="paymentDetailsSection" style="display: none;">
                                <!-- Payment details will be shown here based on selected method -->
                            </div>
                        </div>
                    </div>

                    <div class="checkout-right">
                        <!-- Order Summary -->
                        <div class="order-summary">
                            <h3>Đơn hàng của bạn</h3>

                            <div class="order-items">
                                ${this.checkoutData.cart.map(item => this.createOrderItemHTML(item)).join('')}
                            </div>

                            <div class="order-totals">
                                <div class="total-row">
                                    <span>Tạm tính:</span>
                                    <span>${Utils.formatCurrency(total)}</span>
                                </div>
                                <div class="total-row">
                                    <span>Phí giao hàng:</span>
                                    <span>${Utils.formatCurrency(shippingFee)}</span>
                                </div>
                                <div class="total-row final">
                                    <span>Tổng cộng:</span>
                                    <span>${Utils.formatCurrency(finalTotal)}</span>
                                </div>
                            </div>

                            <button class="btn-place-order" id="placeOrderBtn">
                                Đặt hàng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Create order item HTML
    createOrderItemHTML(item) {
        const { product, quantity } = item;
        const subtotal = product.price * quantity;

        return `
            <div class="order-item">
                <div class="item-image">
                    <img src="${product.image}" alt="${product.name}">
                    <span class="item-quantity">${quantity}</span>
                </div>
                <div class="item-info">
                    <div class="item-name">${product.name}</div>
                    <div class="item-price">${Utils.formatCurrency(subtotal)}</div>
                </div>
            </div>
        `;
    },

    // Bind checkout events
    bindCheckoutEvents() {
        // Close button
        const closeBtn = document.querySelector('.close-checkout');
        if (closeBtn) {
            closeBtn.addEventListener('click', this.hideCheckout.bind(this));
        }

        // Place order button
        const placeOrderBtn = document.getElementById('placeOrderBtn');
        if (placeOrderBtn) {
            placeOrderBtn.addEventListener('click', this.placeOrder.bind(this));
        }

        // Payment method change
        document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.checkoutData.paymentMethod = e.target.value;
                this.showPaymentDetails(e.target.value);
            });
        });

        // Form validation
        const form = document.getElementById('shippingForm');
        if (form) {
            // Real-time validation
            const inputs = form.querySelectorAll('input[required], textarea[required]');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            });
        }
    },

    // Populate user info
    populateUserInfo(user) {
        const form = document.getElementById('shippingForm');
        if (!form) return;

        // Fill form with user data
        const nameInput = form.querySelector('input[name="name"]');
        const phoneInput = form.querySelector('input[name="phone"]');
        const addressInput = form.querySelector('input[name="address"]');
        const wardInput = form.querySelector('input[name="ward"]');
        const districtInput = form.querySelector('input[name="district"]');
        const cityInput = form.querySelector('input[name="city"]');

        if (nameInput) nameInput.value = user.name || '';
        if (phoneInput) phoneInput.value = user.phone || '';

        if (user.address) {
            if (addressInput) addressInput.value = user.address.street || '';
            if (wardInput) wardInput.value = user.address.ward || '';
            if (districtInput) districtInput.value = user.address.district || '';
            if (cityInput) cityInput.value = user.address.city || 'TP. Hồ Chí Minh';
        }
    },

    // Calculate total
    calculateTotal() {
        return this.checkoutData.cart.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);
    },

    // Validate field
    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        // Clear previous errors
        this.clearFieldError(field);

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'Trường này là bắt buộc';
        }

        // Specific field validations
        switch (fieldName) {
            case 'phone':
                if (value && !/^[0-9]{10,11}$/.test(value)) {
                    isValid = false;
                    errorMessage = 'Số điện thoại không hợp lệ';
                }
                break;
            case 'name':
                if (value && value.length < 2) {
                    isValid = false;
                    errorMessage = 'Tên phải có ít nhất 2 ký tự';
                }
                break;
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    },

    // Show field error
    showFieldError(field, message) {
        field.classList.add('error');

        // Remove existing error message
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        // Add new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    },

    // Clear field error
    clearFieldError(field) {
        field.classList.remove('error');
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    },

    // Show payment details
    showPaymentDetails(paymentMethod) {
        const detailsSection = document.getElementById('paymentDetailsSection');
        if (!detailsSection) return;

        let detailsHTML = '';

        switch (paymentMethod) {
            case 'bank':
                detailsHTML = `
                    <div class="bank-details">
                        <h4>Thông tin chuyển khoản</h4>
                        <div class="bank-info">
                            <p><strong>Ngân hàng:</strong> Vietcombank</p>
                            <p><strong>Số tài khoản:</strong> 1234567890</p>
                            <p><strong>Chủ tài khoản:</strong> CONG TY NA FOOD</p>
                            <p><strong>Nội dung:</strong> [Mã đơn hàng] - [Tên khách hàng]</p>
                        </div>
                        <div class="payment-note">
                            <i class="fas fa-info-circle"></i>
                            <span>Vui lòng chuyển khoản đúng số tiền và ghi rõ nội dung để được xử lý nhanh chóng</span>
                        </div>
                    </div>
                `;
                break;
            case 'momo':
                detailsHTML = `
                    <div class="momo-details">
                        <h4>Thanh toán MoMo</h4>
                        <div class="momo-info">
                            <p>Bạn sẽ được chuyển đến ứng dụng MoMo để hoàn tất thanh toán</p>
                        </div>
                    </div>
                `;
                break;
            case 'vnpay':
                detailsHTML = `
                    <div class="vnpay-details">
                        <h4>Thanh toán VNPay</h4>
                        <div class="vnpay-info">
                            <p>Bạn sẽ được chuyển đến cổng thanh toán VNPay để hoàn tất giao dịch</p>
                        </div>
                    </div>
                `;
                break;
            default:
                detailsHTML = '';
        }

        if (detailsHTML) {
            detailsSection.innerHTML = detailsHTML;
            detailsSection.style.display = 'block';
        } else {
            detailsSection.style.display = 'none';
        }
    },

    // Validate entire form
    validateForm() {
        const form = document.getElementById('shippingForm');
        if (!form) return false;

        const requiredFields = form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    },

    // Place order
    async placeOrder() {
        // Validate form
        if (!this.validateForm()) {
            Utils.showToast('Vui lòng kiểm tra lại thông tin', 'error');
            return;
        }

        const form = document.getElementById('shippingForm');
        const formData = new FormData(form);
        const shippingInfo = Object.fromEntries(formData);

        // Prepare order data
        const orderData = {
            orderItems: this.checkoutData.cart.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.price
            })),
            shippingAddress: {
                name: shippingInfo.name,
                phone: shippingInfo.phone,
                address: shippingInfo.address,
                ward: shippingInfo.ward,
                district: shippingInfo.district,
                city: shippingInfo.city
            },
            paymentMethod: this.checkoutData.paymentMethod,
            note: shippingInfo.note || '',
            totalPrice: this.calculateTotal() + 30000 // Include shipping fee
        };

        const placeOrderBtn = document.getElementById('placeOrderBtn');
        placeOrderBtn.disabled = true;
        placeOrderBtn.textContent = 'Đang xử lý...';

        try {
            const response = await OrdersAPI.createOrder(orderData);

            if (response.success) {
                // Clear cart
                EventBus.emit('cart:clear');

                // Hide checkout
                this.hideCheckout();

                // Show success message
                Utils.showToast('Đặt hàng thành công!', 'success');

                // Show order confirmation
                this.showOrderConfirmation(response.data.order);
            } else {
                Utils.showToast(response.message || 'Đặt hàng thất bại', 'error');
            }
        } catch (error) {
            console.error('Order error:', error);
            Utils.showToast(error.message || 'Có lỗi xảy ra khi đặt hàng', 'error');
        } finally {
            placeOrderBtn.disabled = false;
            placeOrderBtn.textContent = 'Đặt hàng';
        }
    },

    // Show order confirmation
    showOrderConfirmation(order) {
        const modal = document.createElement('div');
        modal.className = 'order-confirmation-modal';
        modal.innerHTML = `
            <div class="confirmation-content">
                <div class="confirmation-header">
                    <i class="fas fa-check-circle"></i>
                    <h2>Đặt hàng thành công!</h2>
                </div>
                <div class="confirmation-body">
                    <p>Mã đơn hàng: <strong>${order.orderNumber}</strong></p>
                    <p>Tổng tiền: <strong>${Utils.formatCurrency(order.totalPrice)}</strong></p>
                    <p>Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận đơn hàng.</p>
                </div>
                <div class="confirmation-actions">
                    <button class="btn btn-primary" onclick="this.parentElement.parentElement.parentElement.remove()">
                        Đóng
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'block';

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (modal.parentElement) {
                modal.remove();
            }
        }, 5000);
    },

    // Hide checkout modal
    hideCheckout() {
        const modal = document.getElementById('checkoutModal');
        if (modal) {
            modal.remove();
        }
    }
};

window.CheckoutModule = CheckoutModule;
