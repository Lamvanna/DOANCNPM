// Admin Dashboard Module
const AdminDashboardModule = {
    // Charts instances
    charts: {},

    // Initialize dashboard
    init() {
        this.bindEvents();
    },

    // Bind event listeners
    bindEvents() {
        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', this.loadDashboardData.bind(this));
        }

        // Notification button
        const notificationBtn = document.getElementById('notificationBtn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', this.showNotifications.bind(this));
        }

        // Settings button
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', this.showSettings.bind(this));
        }
    },

    // Load dashboard data
    async loadDashboardData() {
        try {
            Utils.showLoading();
            
            // Load statistics
            await this.loadStatistics();
            
            // Load charts
            await this.loadCharts();
            
            // Load recent activities
            await this.loadRecentActivities();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            Utils.showToast('Không thể tải dữ liệu dashboard', 'error');
        } finally {
            Utils.hideLoading();
        }
    },

    // Load statistics
    async loadStatistics() {
        try {
            const response = await StatisticsAPI.getDashboardStats();
            const stats = response.data.overview;
            
            // Update stat cards
            this.updateStatCard('totalOrders', stats.totalOrders || 0);
            this.updateStatCard('totalRevenue', Utils.formatCurrency(stats.totalRevenue || 0));
            this.updateStatCard('totalUsers', stats.totalUsers || 0);
            this.updateStatCard('totalProducts', stats.totalProducts || 0);
            
        } catch (error) {
            console.error('Error loading statistics:', error);
            // Set default values
            this.updateStatCard('totalOrders', 0);
            this.updateStatCard('totalRevenue', '0đ');
            this.updateStatCard('totalUsers', 0);
            this.updateStatCard('totalProducts', 0);
        }
    },

    // Update stat card
    updateStatCard(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    },

    // Load charts
    async loadCharts() {
        await Promise.all([
            this.loadRevenueChart(),
            this.loadOrderStatusChart()
        ]);
    },

    // Load revenue chart
    async loadRevenueChart() {
        try {
            const response = await StatisticsAPI.getRevenueStats('monthly');
            const data = response.data.revenue || [];
            
            const ctx = document.getElementById('revenueChart');
            if (!ctx) return;
            
            // Destroy existing chart
            if (this.charts.revenue) {
                this.charts.revenue.destroy();
            }
            
            // Prepare data
            const labels = data.map(item => item.month || item.date);
            const revenues = data.map(item => item.revenue || 0);
            
            this.charts.revenue = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Doanh thu',
                        data: revenues,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return Utils.formatCurrency(value);
                                }
                            }
                        }
                    }
                }
            });
            
        } catch (error) {
            console.error('Error loading revenue chart:', error);
            this.createEmptyChart('revenueChart', 'Không có dữ liệu doanh thu');
        }
    },

    // Load order status chart
    async loadOrderStatusChart() {
        try {
            const response = await API.get('/statistics/orders');
            const data = response.data.ordersByStatus || {};
            
            const ctx = document.getElementById('orderStatusChart');
            if (!ctx) return;
            
            // Destroy existing chart
            if (this.charts.orderStatus) {
                this.charts.orderStatus.destroy();
            }
            
            // Prepare data
            const statusLabels = {
                pending: 'Chờ xử lý',
                confirmed: 'Đã xác nhận',
                preparing: 'Đang chuẩn bị',
                shipping: 'Đang giao',
                delivered: 'Đã giao',
                cancelled: 'Đã hủy'
            };
            
            const labels = Object.keys(data).map(key => statusLabels[key] || key);
            const values = Object.values(data);
            
            this.charts.orderStatus = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: values,
                        backgroundColor: [
                            '#ffc107',
                            '#28a745',
                            '#17a2b8',
                            '#fd7e14',
                            '#6f42c1',
                            '#dc3545'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
            
        } catch (error) {
            console.error('Error loading order status chart:', error);
            this.createEmptyChart('orderStatusChart', 'Không có dữ liệu đơn hàng');
        }
    },

    // Create empty chart
    createEmptyChart(canvasId, message) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        
        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [message],
                datasets: [{
                    data: [1],
                    backgroundColor: ['#e9ecef'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
        
        this.charts[canvasId.replace('Chart', '')] = chart;
    },

    // Load recent activities
    async loadRecentActivities() {
        try {
            // This would typically come from an API endpoint
            // For now, we'll create some sample data
            const activities = [
                {
                    type: 'order',
                    title: 'Đơn hàng mới #NF202412250001',
                    time: '5 phút trước',
                    icon: 'fas fa-shopping-bag'
                },
                {
                    type: 'user',
                    title: 'Người dùng mới đăng ký',
                    time: '15 phút trước',
                    icon: 'fas fa-user-plus'
                },
                {
                    type: 'product',
                    title: 'Sản phẩm "Phở Bò Tái" được cập nhật',
                    time: '30 phút trước',
                    icon: 'fas fa-edit'
                },
                {
                    type: 'order',
                    title: 'Đơn hàng #NF202412250002 đã được giao',
                    time: '1 giờ trước',
                    icon: 'fas fa-check-circle'
                },
                {
                    type: 'user',
                    title: 'Đánh giá mới cho "Bún Bò Huế"',
                    time: '2 giờ trước',
                    icon: 'fas fa-star'
                }
            ];
            
            this.renderRecentActivities(activities);
            
        } catch (error) {
            console.error('Error loading recent activities:', error);
        }
    },

    // Render recent activities
    renderRecentActivities(activities) {
        const container = document.getElementById('recentActivities');
        if (!container) return;
        
        if (activities.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">Không có hoạt động nào</p>';
            return;
        }
        
        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');
    },

    // Show notifications
    showNotifications() {
        Utils.showToast('Chức năng thông báo sẽ được cập nhật sớm', 'info');
    },

    // Show settings
    showSettings() {
        Utils.showToast('Chức năng cài đặt sẽ được cập nhật sớm', 'info');
    },

    // Refresh dashboard
    refresh() {
        this.loadDashboardData();
    }
};

// Export module
window.AdminDashboardModule = AdminDashboardModule;
