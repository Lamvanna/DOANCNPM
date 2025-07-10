// Admin Order Management Module
const AdminOrderModule = {
    // Current state
    currentPage: 1,
    currentFilters: {
        status: '',
        dateFrom: '',
        dateTo: '',
        search: ''
    },
    orders: [],

    // Initialize order management
    init() {
        this.bindEvents();
    },

    // Bind event listeners
    bindEvents() {
        // Filter events
        const statusFilter = document.getElementById('orderStatusFilter');
        const dateFromFilter = document.getElementById('orderDateFrom');
        const dateToFilter = document.getElementById('orderDateTo');
        const searchInput = document.getElementById('orderSearchInput');
        const exportBtn = document.getElementById('exportOrdersBtn');

        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.currentFilters.status = e.target.value;
                this.currentPage = 1;
                this.loadOrders();
            });
        }

        if (dateFromFilter) {
            dateFromFilter.addEventListener('change', (e) => {
                this.currentFilters.dateFrom = e.target.value;
                this.currentPage = 1;
                this.loadOrders();
            });
        }

        if (dateToFilter) {
            dateToFilter.addEventListener('change', (e) => {
                this.currentFilters.dateTo = e.target.value;
                this.currentPage = 1;
                this.loadOrders();
            });
        }

        if (searchInput) {
            const debouncedSearch = Utils.debounce((e) => {
                this.currentFilters.search = e.target.value;
                this.currentPage = 1;
                this.loadOrders();
            }, 300);
            searchInput.addEventListener('input', debouncedSearch);
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', this.showExportOptions.bind(this));
        }
    },

    // Load orders
    async loadOrders() {
        try {
            Utils.showLoading();

            const params = new URLSearchParams({
                page: this.currentPage,
                limit: 10,
                ...this.currentFilters
            });

            // Remove empty filters
            Object.keys(this.currentFilters).forEach(key => {
                if (!this.currentFilters[key]) {
                    params.delete(key);
                }
            });

            const response = await API.get(`/orders?${params}`);
            this.orders = response.data.orders || [];

            this.renderOrders();
            this.renderPagination(response.data.pagination);

        } catch (error) {
            console.error('Error loading orders:', error);
            Utils.showToast('Không thể tải danh sách đơn hàng', 'error');
        } finally {
            Utils.hideLoading();
        }
    },

    // Render orders table
    renderOrders() {
        const tbody = document.getElementById('ordersTableBody');
        if (!tbody) return;

        if (this.orders.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">
                        <div style="padding: 40px; color: #666;">
                            <i class="fas fa-shopping-bag" style="font-size: 48px; margin-bottom: 15px; color: #ddd;"></i>
                            <p>Không có đơn hàng nào</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.orders.map(order => this.createOrderRow(order)).join('');
    },

    // Create order table row
    createOrderRow(order) {
        const statusColors = {
            pending: 'pending',
            confirmed: 'confirmed',
            preparing: 'preparing',
            shipping: 'shipping',
            delivered: 'delivered',
            cancelled: 'cancelled'
        };

        const statusTexts = {
            pending: 'Chờ xử lý',
            confirmed: 'Đã xác nhận',
            preparing: 'Đang chuẩn bị',
            shipping: 'Đang giao',
            delivered: 'Đã giao',
            cancelled: 'Đã hủy'
        };

        const paymentMethods = {
            cod: 'Thanh toán khi nhận hàng',
            online: 'Thanh toán online'
        };

        return `
            <tr data-order-id="${order._id}">
                <td>
                    <span class="order-number" onclick="AdminOrderModule.viewOrder('${order._id}')">
                        ${order.orderNumber}
                    </span>
                </td>
                <td>
                    <div class="customer-info">
                        <img src="${order.user?.avatar || '/assets/images/default-avatar.png'}" 
                             alt="Avatar" class="customer-avatar">
                        <div class="customer-details">
                            <div class="customer-name">${order.user?.name || 'N/A'}</div>
                            <div class="customer-email">${order.user?.email || 'N/A'}</div>
                        </div>
                    </div>
                </td>
                <td>${Utils.formatDate(order.createdAt)}</td>
                <td>
                    <div class="order-amount">${Utils.formatCurrency(order.finalAmount)}</div>
                </td>
                <td>
                    <span class="status-badge ${statusColors[order.status]}">
                        ${statusTexts[order.status]}
                    </span>
                </td>
                <td>
                    <span class="payment-method ${order.paymentMethod}">
                        ${paymentMethods[order.paymentMethod]}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" onclick="AdminOrderModule.viewOrder('${order._id}')" title="Xem chi tiết">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${order.status !== 'delivered' && order.status !== 'cancelled' ? `
                            <button class="action-btn edit" onclick="AdminOrderModule.updateOrderStatus('${order._id}')" title="Cập nhật trạng thái">
                                <i class="fas fa-edit"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    },

    // View order details
    async viewOrder(orderId) {
        try {
            const response = await API.get(`/orders/${orderId}`);
            const order = response.data.order;
            
            const modal = document.getElementById('orderModal');
            const content = document.getElementById('orderModalContent');
            
            if (modal && content) {
                content.innerHTML = this.getOrderDetailHTML(order);
                modal.style.display = 'block';
                this.bindOrderDetailEvents(order);
            }
        } catch (error) {
            Utils.showToast('Không thể tải thông tin đơn hàng', 'error');
        }
    },

    // Get order detail HTML
    getOrderDetailHTML(order) {
        const statusTexts = {
            pending: 'Chờ xử lý',
            confirmed: 'Đã xác nhận',
            preparing: 'Đang chuẩn bị',
            shipping: 'Đang giao',
            delivered: 'Đã giao',
            cancelled: 'Đã hủy'
        };

        return `
            <div class="order-detail">
                <div class="order-detail-header">
                    <h2 class="order-detail-title">Đơn hàng ${order.orderNumber}</h2>
                    <div class="order-status-update">
                        <select id="orderStatusSelect" ${order.status === 'delivered' || order.status === 'cancelled' ? 'disabled' : ''}>
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Chờ xử lý</option>
                            <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Đã xác nhận</option>
                            <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Đang chuẩn bị</option>
                            <option value="shipping" ${order.status === 'shipping' ? 'selected' : ''}>Đang giao</option>
                            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Đã giao</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Đã hủy</option>
                        </select>
                        <button class="btn btn-primary" id="updateStatusBtn" ${order.status === 'delivered' || order.status === 'cancelled' ? 'disabled' : ''}>
                            Cập nhật
                        </button>
                    </div>
                </div>
                
                <div class="order-info-grid">
                    <div class="info-section">
                        <h3>Thông tin khách hàng</h3>
                        <div class="info-item">
                            <span class="info-label">Tên:</span>
                            <span class="info-value">${order.user?.name || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Email:</span>
                            <span class="info-value">${order.user?.email || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Điện thoại:</span>
                            <span class="info-value">${order.shippingAddress?.phone || 'N/A'}</span>
                        </div>
                    </div>
                    
                    <div class="info-section">
                        <h3>Thông tin đơn hàng</h3>
                        <div class="info-item">
                            <span class="info-label">Ngày đặt:</span>
                            <span class="info-value">${Utils.formatDate(order.createdAt)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Trạng thái:</span>
                            <span class="info-value">${statusTexts[order.status]}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Thanh toán:</span>
                            <span class="info-value">${order.paymentMethod === 'cod' ? 'COD' : 'Online'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="order-items">
                    <h3>Sản phẩm đã đặt</h3>
                    ${order.items.map(item => `
                        <div class="order-item">
                            <img src="${item.product?.image || '/assets/images/placeholder.jpg'}" 
                                 alt="${item.product?.name}" class="order-item-image">
                            <div class="order-item-details">
                                <div class="order-item-name">${item.product?.name || 'Sản phẩm đã xóa'}</div>
                                <div class="order-item-price">${Utils.formatCurrency(item.price)}</div>
                            </div>
                            <div class="order-item-quantity">x${item.quantity}</div>
                            <div class="order-item-total">${Utils.formatCurrency(item.price * item.quantity)}</div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="order-summary">
                    <div class="summary-row">
                        <span>Tạm tính:</span>
                        <span>${Utils.formatCurrency(order.totalAmount)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Phí giao hàng:</span>
                        <span>${Utils.formatCurrency(order.shippingFee || 0)}</span>
                    </div>
                    ${order.discountAmount ? `
                        <div class="summary-row">
                            <span>Giảm giá:</span>
                            <span>-${Utils.formatCurrency(order.discountAmount)}</span>
                        </div>
                    ` : ''}
                    <div class="summary-row total">
                        <span>Tổng cộng:</span>
                        <span>${Utils.formatCurrency(order.finalAmount)}</span>
                    </div>
                </div>
                
                ${order.shippingAddress ? `
                    <div class="info-section">
                        <h3>Địa chỉ giao hàng</h3>
                        <p>${order.shippingAddress.name}</p>
                        <p>${order.shippingAddress.phone}</p>
                        <p>${order.shippingAddress.street}, ${order.shippingAddress.ward}, ${order.shippingAddress.district}, ${order.shippingAddress.city}</p>
                        ${order.shippingAddress.note ? `<p><strong>Ghi chú:</strong> ${order.shippingAddress.note}</p>` : ''}
                    </div>
                ` : ''}
                
                <div class="staff-notes">
                    <h3>Ghi chú nhân viên</h3>
                    <div class="notes-form">
                        <input type="text" class="notes-input" id="staffNotesInput" 
                               placeholder="Thêm ghi chú..." value="${order.staffNotes || ''}">
                        <button class="btn btn-secondary" id="saveNotesBtn">Lưu</button>
                    </div>
                </div>
            </div>
        `;
    },

    // Bind order detail events
    bindOrderDetailEvents(order) {
        const updateBtn = document.getElementById('updateStatusBtn');
        const saveNotesBtn = document.getElementById('saveNotesBtn');

        if (updateBtn) {
            updateBtn.addEventListener('click', () => {
                const newStatus = document.getElementById('orderStatusSelect').value;
                this.updateStatus(order._id, newStatus);
            });
        }

        if (saveNotesBtn) {
            saveNotesBtn.addEventListener('click', () => {
                const notes = document.getElementById('staffNotesInput').value;
                this.saveStaffNotes(order._id, notes);
            });
        }
    },

    // Update order status
    async updateStatus(orderId, newStatus) {
        try {
            const response = await API.put(`/orders/${orderId}/status`, {
                status: newStatus,
                staffNotes: document.getElementById('staffNotesInput')?.value || ''
            });

            if (response.success) {
                Utils.showToast('Cập nhật trạng thái thành công!', 'success');
                this.closeModal();
                this.loadOrders();
            }
        } catch (error) {
            Utils.showToast(error.message || 'Không thể cập nhật trạng thái', 'error');
        }
    },

    // Save staff notes
    async saveStaffNotes(orderId, notes) {
        try {
            const response = await API.put(`/orders/${orderId}/notes`, {
                staffNotes: notes
            });

            if (response.success) {
                Utils.showToast('Lưu ghi chú thành công!', 'success');
            }
        } catch (error) {
            Utils.showToast(error.message || 'Không thể lưu ghi chú', 'error');
        }
    },

    // Show export options
    showExportOptions() {
        Utils.showToast('Chức năng xuất báo cáo sẽ được cập nhật sớm', 'info');
    },

    // Update order status from table
    updateOrderStatus(orderId) {
        this.viewOrder(orderId);
    },

    // Render pagination
    renderPagination(pagination) {
        const container = document.getElementById('ordersPagination');
        if (!container || !pagination) return;

        const { page, pages, total } = pagination;
        
        if (pages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <button ${page <= 1 ? 'disabled' : ''} onclick="AdminOrderModule.goToPage(${page - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // Page numbers
        const startPage = Math.max(1, page - 2);
        const endPage = Math.min(pages, page + 2);

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="${i === page ? 'active' : ''}" onclick="AdminOrderModule.goToPage(${i})">
                    ${i}
                </button>
            `;
        }

        // Next button
        paginationHTML += `
            <button ${page >= pages ? 'disabled' : ''} onclick="AdminOrderModule.goToPage(${page + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        // Info
        paginationHTML += `
            <div class="pagination-info">
                Hiển thị ${(page - 1) * 10 + 1}-${Math.min(page * 10, total)} trong ${total} đơn hàng
            </div>
        `;

        container.innerHTML = paginationHTML;
    },

    // Go to specific page
    goToPage(page) {
        this.currentPage = page;
        this.loadOrders();
    },

    // Close modal
    closeModal() {
        const modal = document.getElementById('orderModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
};

// Export module
window.AdminOrderModule = AdminOrderModule;
