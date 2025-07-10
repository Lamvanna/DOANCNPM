// Admin User Management Module
const AdminUserModule = {
    // Current state
    currentPage: 1,
    currentFilters: {
        role: '',
        status: '',
        search: ''
    },
    users: [],

    // Initialize user management
    init() {
        this.bindEvents();
    },

    // Bind event listeners
    bindEvents() {
        // Filter events
        const roleFilter = document.getElementById('userRoleFilter');
        const statusFilter = document.getElementById('userStatusFilter');
        const searchInput = document.getElementById('userSearchInput');

        if (roleFilter) {
            roleFilter.addEventListener('change', (e) => {
                this.currentFilters.role = e.target.value;
                this.currentPage = 1;
                this.loadUsers();
            });
        }

        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.currentFilters.status = e.target.value;
                this.currentPage = 1;
                this.loadUsers();
            });
        }

        if (searchInput) {
            const debouncedSearch = Utils.debounce((e) => {
                this.currentFilters.search = e.target.value;
                this.currentPage = 1;
                this.loadUsers();
            }, 300);
            searchInput.addEventListener('input', debouncedSearch);
        }
    },

    // Load users
    async loadUsers() {
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

            const response = await API.get(`/users?${params}`);
            this.users = response.data.users || [];

            this.renderUsers();
            this.renderPagination(response.data.pagination);

        } catch (error) {
            console.error('Error loading users:', error);
            Utils.showToast('Không thể tải danh sách người dùng', 'error');
        } finally {
            Utils.hideLoading();
        }
    },

    // Render users table
    renderUsers() {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        if (this.users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">
                        <div style="padding: 40px; color: #666;">
                            <i class="fas fa-users" style="font-size: 48px; margin-bottom: 15px; color: #ddd;"></i>
                            <p>Không có người dùng nào</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.users.map(user => this.createUserRow(user)).join('');
    },

    // Create user table row
    createUserRow(user) {
        const roleTexts = {
            admin: 'Quản trị viên',
            staff: 'Nhân viên',
            user: 'Khách hàng'
        };

        return `
            <tr data-user-id="${user._id}">
                <td class="user-avatar-cell">
                    <img src="${user.avatar || '/assets/images/default-avatar.png'}" alt="Avatar">
                </td>
                <td>
                    <div class="user-info">
                        <div class="user-name">${user.name}</div>
                        <div class="user-email">${user.email}</div>
                    </div>
                </td>
                <td>${user.email}</td>
                <td>
                    <span class="role-badge ${user.role}">
                        ${roleTexts[user.role]}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${user.isActive ? 'active' : 'inactive'}">
                        ${user.isActive ? 'Hoạt động' : 'Bị khóa'}
                    </span>
                </td>
                <td>
                    <div class="join-date">${Utils.formatDate(user.createdAt)}</div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" onclick="AdminUserModule.viewUser('${user._id}')" title="Xem chi tiết">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" onclick="AdminUserModule.editUser('${user._id}')" title="Chỉnh sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${user.role !== 'admin' ? `
                            <button class="action-btn ${user.isActive ? 'delete' : 'view'}" 
                                    onclick="AdminUserModule.toggleUserStatus('${user._id}')" 
                                    title="${user.isActive ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}">
                                <i class="fas fa-${user.isActive ? 'lock' : 'unlock'}"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    },

    // View user details
    async viewUser(userId) {
        try {
            const response = await API.get(`/users/${userId}`);
            const user = response.data.user;
            
            // Show user detail modal
            Utils.showToast('Chức năng xem chi tiết người dùng sẽ được cập nhật sớm', 'info');
        } catch (error) {
            Utils.showToast('Không thể tải thông tin người dùng', 'error');
        }
    },

    // Edit user
    editUser(userId) {
        Utils.showToast('Chức năng chỉnh sửa người dùng sẽ được cập nhật sớm', 'info');
    },

    // Toggle user status
    async toggleUserStatus(userId) {
        const user = this.users.find(u => u._id === userId);
        if (!user) return;

        const action = user.isActive ? 'khóa' : 'kích hoạt';
        if (!confirm(`Bạn có chắc chắn muốn ${action} tài khoản này?`)) {
            return;
        }

        try {
            const response = await API.put(`/users/${userId}/status`, {
                isActive: !user.isActive
            });

            if (response.success) {
                Utils.showToast(`${action.charAt(0).toUpperCase() + action.slice(1)} tài khoản thành công!`, 'success');
                this.loadUsers();
            }
        } catch (error) {
            Utils.showToast(error.message || `Không thể ${action} tài khoản`, 'error');
        }
    },

    // Change user role
    async changeUserRole(userId, newRole) {
        try {
            const response = await API.put(`/users/${userId}/role`, {
                role: newRole
            });

            if (response.success) {
                Utils.showToast('Thay đổi vai trò thành công!', 'success');
                this.loadUsers();
            }
        } catch (error) {
            Utils.showToast(error.message || 'Không thể thay đổi vai trò', 'error');
        }
    },

    // Render pagination
    renderPagination(pagination) {
        const container = document.getElementById('usersPagination');
        if (!container || !pagination) return;

        const { page, pages, total } = pagination;
        
        if (pages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <button ${page <= 1 ? 'disabled' : ''} onclick="AdminUserModule.goToPage(${page - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // Page numbers
        const startPage = Math.max(1, page - 2);
        const endPage = Math.min(pages, page + 2);

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="${i === page ? 'active' : ''}" onclick="AdminUserModule.goToPage(${i})">
                    ${i}
                </button>
            `;
        }

        // Next button
        paginationHTML += `
            <button ${page >= pages ? 'disabled' : ''} onclick="AdminUserModule.goToPage(${page + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        // Info
        paginationHTML += `
            <div class="pagination-info">
                Hiển thị ${(page - 1) * 10 + 1}-${Math.min(page * 10, total)} trong ${total} người dùng
            </div>
        `;

        container.innerHTML = paginationHTML;
    },

    // Go to specific page
    goToPage(page) {
        this.currentPage = page;
        this.loadUsers();
    }
};

// Export module
window.AdminUserModule = AdminUserModule;
