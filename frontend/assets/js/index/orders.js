// Orders Module for Na Food App
const OrdersModule = {
    currentOrders: [],
    currentPage: 1,
    totalPages: 1,

    // Initialize orders functionality
    init() {
        this.bindEvents();
    },

    // Bind event listeners
    bindEvents() {
        // Listen for orders link click
        const ordersLink = document.getElementById('ordersLink');
        if (ordersLink) {
            ordersLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showMyOrders();
            });
        }

        // Close modal events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal') && e.target.id === 'myOrdersModal') {
                this.hideMyOrders();
            }
        });

        const myOrdersModal = document.getElementById('myOrdersModal');
        if (myOrdersModal) {
            const closeBtn = myOrdersModal.querySelector('.close');
            if (closeBtn) {
                closeBtn.addEventListener('click', this.hideMyOrders.bind(this));
            }
        }
    },

    // Show my orders modal
    async showMyOrders() {
        // Check if user is logged in
        const user = Storage.get(STORAGE_KEYS.USER);
        if (!user) {
            Utils.showToast('Vui lòng đăng nhập để xem đơn hàng', 'warning');
            EventBus.emit('auth:show', { type: 'login' });
            return;
        }

        const modal = document.getElementById('myOrdersModal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';

            // Show loading and load orders
            this.showOrdersLoading();
            await this.loadMyOrders();
        }
    },

    // Hide my orders modal
    hideMyOrders() {
        const modal = document.getElementById('myOrdersModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    },

    // Show loading state
    showOrdersLoading() {
        const content = document.getElementById('myOrdersContent');
        if (content) {
            content.innerHTML = `
                <div class="orders-loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Đang tải đơn hàng...</p>
                </div>
            `;
        }
    },

    // Load user orders
    async loadMyOrders(page = 1) {
        try {
            const response = await OrdersAPI.getMyOrders({ page, limit: 10 });

            if (response.success) {
                this.currentOrders = response.data.orders;
                this.currentPage = response.data.pagination.page;
                this.totalPages = response.data.pagination.pages;

                this.renderMyOrders();
            } else {
                this.showOrdersError('Không thể tải danh sách đơn hàng');
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            this.showOrdersError('Có lỗi xảy ra khi tải đơn hàng');
        }
    },

    // Show orders error
    showOrdersError(message) {
        const content = document.getElementById('myOrdersContent');
        if (content) {
            content.innerHTML = `
                <div class="orders-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="OrdersModule.loadMyOrders()">
                        Thử lại
                    </button>
                </div>
            `;
        }
    },

    // Render my orders
    renderMyOrders() {
        const content = document.getElementById('myOrdersContent');
        if (!content) return;

        if (this.currentOrders.length === 0) {
            content.innerHTML = `
                <div class="no-orders">
                    <i class="fas fa-shopping-bag"></i>
                    <h3>Chưa có đơn hàng nào</h3>
                    <p>Bạn chưa có đơn hàng nào. Hãy đặt món ngon ngay!</p>
                    <button class="btn btn-primary" onclick="OrdersModule.hideMyOrders()">
                        Đặt hàng ngay
                    </button>
                </div>
            `;
            return;
        }

        content.innerHTML = `
            <div class="my-orders-container">
                <div class="orders-header">
                    <h2>Đơn hàng của tôi</h2>
                    <div class="orders-stats">
                        <span>Tổng: ${this.currentOrders.length} đơn hàng</span>
                    </div>
                </div>

                <div class="orders-list">
                    ${this.currentOrders.map(order => this.createOrderHTML(order)).join('')}
                </div>

                ${this.totalPages > 1 ? this.createPaginationHTML() : ''}
            </div>
        `;

        this.bindOrderEvents();
    },

    // Create order HTML
    createOrderHTML(order) {
        const statusClass = this.getOrderStatusClass(order.status);
        const statusText = this.getOrderStatusText(order.status);

        return `
            <div class="order-item" data-order-id="${order._id}">
                <div class="order-header">
                    <div class="order-info">
                        <div class="order-number">
                            <strong>Đơn hàng #${order.orderNumber}</strong>
                        </div>
                        <div class="order-date">
                            ${new Date(order.createdAt).toLocaleDateString('vi-VN')}
                            ${new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                    <div class="order-status">
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </div>
                </div>

                <div class="order-items">
                    ${order.orderItems.slice(0, 3).map(item => `
                        <div class="order-item-detail">
                            <img src="${item.product.image}" alt="${item.product.name}" class="item-image">
                            <div class="item-info">
                                <div class="item-name">${item.product.name}</div>
                                <div class="item-quantity">x${item.quantity}</div>
                            </div>
                            <div class="item-price">${Utils.formatCurrency(item.price * item.quantity)}</div>
                        </div>
                    `).join('')}
                    ${order.orderItems.length > 3 ? `
                        <div class="more-items">
                            +${order.orderItems.length - 3} món khác
                        </div>
                    ` : ''}
                </div>

                <div class="order-footer">
                    <div class="order-total">
                        <strong>Tổng cộng: ${Utils.formatCurrency(order.totalPrice)}</strong>
                    </div>
                    <div class="order-actions">
                        <button class="btn btn-outline btn-sm view-order-btn" data-order-id="${order._id}">
                            <i class="fas fa-eye"></i> Xem chi tiết
                        </button>
                        ${order.status === 'pending' ? `
                            <button class="btn btn-danger btn-sm cancel-order-btn" data-order-id="${order._id}">
                                <i class="fas fa-times"></i> Hủy đơn
                            </button>
                        ` : ''}
                        ${order.status === 'delivered' && !order.isReviewed ? `
                            <button class="btn btn-primary btn-sm review-order-btn" data-order-id="${order._id}">
                                <i class="fas fa-star"></i> Đánh giá
                            </button>
                        ` : ''}
                        ${order.status === 'delivered' ? `
                            <button class="btn btn-success btn-sm reorder-btn" data-order-id="${order._id}">
                                <i class="fas fa-redo"></i> Đặt lại
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    },

    // Get order status class
    getOrderStatusClass(status) {
        const statusClasses = {
            'pending': 'status-pending',
            'confirmed': 'status-confirmed',
            'preparing': 'status-preparing',
            'shipping': 'status-shipping',
            'delivered': 'status-delivered',
            'cancelled': 'status-cancelled'
        };
        return statusClasses[status] || 'status-pending';
    },

    // Get order status text
    getOrderStatusText(status) {
        const statusTexts = {
            'pending': 'Chờ xác nhận',
            'confirmed': 'Đã xác nhận',
            'preparing': 'Đang chuẩn bị',
            'shipping': 'Đang giao hàng',
            'delivered': 'Đã giao hàng',
            'cancelled': 'Đã hủy'
        };
        return statusTexts[status] || 'Chờ xác nhận';
    },

    // Create pagination HTML
    createPaginationHTML() {
        if (this.totalPages <= 1) return '';

        let paginationHTML = '<div class="orders-pagination">';

        // Previous button
        if (this.currentPage > 1) {
            paginationHTML += `
                <button class="pagination-btn" onclick="OrdersModule.loadMyOrders(${this.currentPage - 1})">
                    <i class="fas fa-chevron-left"></i>
                </button>
            `;
        }

        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(this.totalPages, this.currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}"
                        onclick="OrdersModule.loadMyOrders(${i})">
                    ${i}
                </button>
            `;
        }

        // Next button
        if (this.currentPage < this.totalPages) {
            paginationHTML += `
                <button class="pagination-btn" onclick="OrdersModule.loadMyOrders(${this.currentPage + 1})">
                    <i class="fas fa-chevron-right"></i>
                </button>
            `;
        }

        paginationHTML += '</div>';
        return paginationHTML;
    },

    // Bind order events
    bindOrderEvents() {
        // View order detail buttons
        document.querySelectorAll('.view-order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.currentTarget.dataset.orderId;
                this.showOrderDetail(orderId);
            });
        });

        // Cancel order buttons
        document.querySelectorAll('.cancel-order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.currentTarget.dataset.orderId;
                this.cancelOrder(orderId);
            });
        });

        // Review order buttons
        document.querySelectorAll('.review-order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.currentTarget.dataset.orderId;
                this.showReviewModal(orderId);
            });
        });

        // Reorder buttons
        document.querySelectorAll('.reorder-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.currentTarget.dataset.orderId;
                this.reorder(orderId);
            });
        });
    },

    // Show order detail
    async showOrderDetail(orderId) {
        try {
            const response = await OrdersAPI.getOrder(orderId);

            if (response.success) {
                const order = response.data.order;
                this.showOrderDetailModal(order);
            } else {
                Utils.showToast('Không thể tải chi tiết đơn hàng', 'error');
            }
        } catch (error) {
            console.error('Error loading order detail:', error);
            Utils.showToast('Có lỗi xảy ra khi tải chi tiết đơn hàng', 'error');
        }
    },

    // Show order detail modal
    showOrderDetailModal(order) {
        const modal = document.createElement('div');
        modal.className = 'modal order-detail-modal';
        modal.innerHTML = `
            <div class="modal-content large">
                <span class="close">&times;</span>
                <div class="order-detail-container">
                    <div class="order-detail-header">
                        <h2>Chi tiết đơn hàng #${order.orderNumber}</h2>
                        <span class="status-badge ${this.getOrderStatusClass(order.status)}">
                            ${this.getOrderStatusText(order.status)}
                        </span>
                    </div>

                    <div class="order-detail-info">
                        <div class="info-section">
                            <h3>Thông tin đơn hàng</h3>
                            <div class="info-grid">
                                <div class="info-item">
                                    <span>Ngày đặt:</span>
                                    <strong>${new Date(order.createdAt).toLocaleString('vi-VN')}</strong>
                                </div>
                                <div class="info-item">
                                    <span>Phương thức thanh toán:</span>
                                    <strong>${order.paymentMethod === 'cash' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản'}</strong>
                                </div>
                                <div class="info-item">
                                    <span>Ghi chú:</span>
                                    <strong>${order.note || 'Không có'}</strong>
                                </div>
                            </div>
                        </div>

                        <div class="info-section">
                            <h3>Địa chỉ giao hàng</h3>
                            <div class="shipping-address">
                                <p><strong>${order.shippingAddress.name}</strong></p>
                                <p>${order.shippingAddress.phone}</p>
                                <p>${order.shippingAddress.address}, ${order.shippingAddress.ward}</p>
                                <p>${order.shippingAddress.district}, ${order.shippingAddress.city}</p>
                            </div>
                        </div>
                    </div>

                    <div class="order-items-detail">
                        <h3>Sản phẩm đã đặt</h3>
                        <div class="items-list">
                            ${order.orderItems.map(item => `
                                <div class="item-row">
                                    <img src="${item.product.image}" alt="${item.product.name}" class="item-image">
                                    <div class="item-info">
                                        <div class="item-name">${item.product.name}</div>
                                        <div class="item-category">${item.product.category}</div>
                                    </div>
                                    <div class="item-quantity">x${item.quantity}</div>
                                    <div class="item-price">${Utils.formatCurrency(item.price)}</div>
                                    <div class="item-total">${Utils.formatCurrency(item.price * item.quantity)}</div>
                                </div>
                            `).join('')}
                        </div>

                        <div class="order-summary">
                            <div class="summary-row">
                                <span>Tạm tính:</span>
                                <span>${Utils.formatCurrency(order.totalPrice - 30000)}</span>
                            </div>
                            <div class="summary-row">
                                <span>Phí giao hàng:</span>
                                <span>${Utils.formatCurrency(30000)}</span>
                            </div>
                            <div class="summary-row total">
                                <span>Tổng cộng:</span>
                                <strong>${Utils.formatCurrency(order.totalPrice)}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'block';

        // Bind close events
        const closeBtn = modal.querySelector('.close');
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    },

    // Cancel order
    async cancelOrder(orderId) {
        if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
            return;
        }

        try {
            const response = await OrdersAPI.cancelOrder(orderId);

            if (response.success) {
                Utils.showToast('Đã hủy đơn hàng thành công', 'success');
                this.loadMyOrders(this.currentPage);
            } else {
                Utils.showToast(response.message || 'Không thể hủy đơn hàng', 'error');
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            Utils.showToast('Có lỗi xảy ra khi hủy đơn hàng', 'error');
        }
    },

    // Show review modal
    showReviewModal(orderId) {
        // This will be implemented with the review module
        Utils.showToast('Chức năng đánh giá đang được phát triển', 'info');
    },

    // Reorder
    async reorder(orderId) {
        try {
            const response = await OrdersAPI.getOrder(orderId);

            if (response.success) {
                const order = response.data.order;

                // Add all items to cart
                order.orderItems.forEach(item => {
                    const cartItem = {
                        product: item.product,
                        quantity: item.quantity
                    };
                    EventBus.emit('cart:add', cartItem);
                });

                Utils.showToast('Đã thêm tất cả sản phẩm vào giỏ hàng', 'success');
                this.hideMyOrders();
            } else {
                Utils.showToast('Không thể đặt lại đơn hàng', 'error');
            }
        } catch (error) {
            console.error('Error reordering:', error);
            Utils.showToast('Có lỗi xảy ra khi đặt lại đơn hàng', 'error');
        }
    }
};

window.OrdersModule = OrdersModule;
