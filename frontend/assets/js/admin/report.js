// Admin Report Module
const AdminReportModule = {
    // Charts instances
    charts: {},
    currentPeriod: 'monthly',

    // Initialize report module
    init() {
        this.bindEvents();
    },

    // Bind event listeners
    bindEvents() {
        // Period filter
        const periodFilter = document.getElementById('reportPeriod');
        if (periodFilter) {
            periodFilter.addEventListener('change', (e) => {
                this.currentPeriod = e.target.value;
                this.loadReports();
            });
        }
    },

    // Load all reports
    async loadReports() {
        try {
            Utils.showLoading();
            
            await Promise.all([
                this.loadTopProducts(),
                this.loadCategoryRevenue(),
                this.loadNewUsers(),
                this.loadOrderCompletion()
            ]);
            
        } catch (error) {
            console.error('Error loading reports:', error);
            Utils.showToast('Không thể tải báo cáo', 'error');
        } finally {
            Utils.hideLoading();
        }
    },

    // Load top products report
    async loadTopProducts() {
        try {
            const response = await API.get(`/statistics/top-products?period=${this.currentPeriod}`);
            const products = response.data.products || [];
            
            this.renderTopProducts(products);
            
        } catch (error) {
            console.error('Error loading top products:', error);
            this.renderTopProducts([]);
        }
    },

    // Render top products
    renderTopProducts(products) {
        const container = document.getElementById('topProductsReport');
        if (!container) return;

        if (products.length === 0) {
            container.innerHTML = `
                <div class="chart-no-data">
                    <i class="fas fa-chart-bar"></i>
                    <p>Không có dữ liệu</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="top-products-list">
                ${products.slice(0, 10).map((product, index) => `
                    <div class="top-product-item">
                        <div class="product-rank ${this.getRankClass(index)}">${index + 1}</div>
                        <img src="${product.image || '/assets/images/placeholder.jpg'}" 
                             alt="${product.name}" class="product-image">
                        <div class="product-info">
                            <div class="product-name">${product.name}</div>
                            <div class="product-sales">Đã bán: ${product.soldCount || 0}</div>
                        </div>
                        <div class="product-revenue">${Utils.formatCurrency(product.revenue || 0)}</div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // Get rank class for styling
    getRankClass(index) {
        switch (index) {
            case 0: return 'gold';
            case 1: return 'silver';
            case 2: return 'bronze';
            default: return '';
        }
    },

    // Load category revenue chart
    async loadCategoryRevenue() {
        try {
            const response = await API.get(`/statistics/category-revenue?period=${this.currentPeriod}`);
            const data = response.data.categories || [];
            
            this.renderCategoryRevenueChart(data);
            
        } catch (error) {
            console.error('Error loading category revenue:', error);
            this.createEmptyChart('categoryRevenueChart', 'Không có dữ liệu doanh thu theo danh mục');
        }
    },

    // Render category revenue chart
    renderCategoryRevenueChart(data) {
        const ctx = document.getElementById('categoryRevenueChart');
        if (!ctx) return;

        // Destroy existing chart
        if (this.charts.categoryRevenue) {
            this.charts.categoryRevenue.destroy();
        }

        if (data.length === 0) {
            this.createEmptyChart('categoryRevenueChart', 'Không có dữ liệu doanh thu theo danh mục');
            return;
        }

        const labels = data.map(item => item.category);
        const revenues = data.map(item => item.revenue);
        const colors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
            '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
        ];

        this.charts.categoryRevenue = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: revenues,
                    backgroundColor: colors.slice(0, data.length),
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = Utils.formatCurrency(context.raw);
                                return `${context.label}: ${value}`;
                            }
                        }
                    }
                }
            }
        });
    },

    // Load new users chart
    async loadNewUsers() {
        try {
            const response = await API.get(`/statistics/new-users?period=${this.currentPeriod}`);
            const data = response.data.users || [];
            
            this.renderNewUsersChart(data);
            
        } catch (error) {
            console.error('Error loading new users:', error);
            this.createEmptyChart('newUsersChart', 'Không có dữ liệu người dùng mới');
        }
    },

    // Render new users chart
    renderNewUsersChart(data) {
        const ctx = document.getElementById('newUsersChart');
        if (!ctx) return;

        // Destroy existing chart
        if (this.charts.newUsers) {
            this.charts.newUsers.destroy();
        }

        if (data.length === 0) {
            this.createEmptyChart('newUsersChart', 'Không có dữ liệu người dùng mới');
            return;
        }

        const labels = data.map(item => item.date || item.month);
        const userCounts = data.map(item => item.count);

        this.charts.newUsers = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Người dùng mới',
                    data: userCounts,
                    borderColor: '#4BC0C0',
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
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
                            stepSize: 1
                        }
                    }
                }
            }
        });
    },

    // Load order completion chart
    async loadOrderCompletion() {
        try {
            const response = await API.get(`/statistics/order-completion?period=${this.currentPeriod}`);
            const data = response.data.completion || {};
            
            this.renderOrderCompletionChart(data);
            
        } catch (error) {
            console.error('Error loading order completion:', error);
            this.createEmptyChart('orderCompletionChart', 'Không có dữ liệu hoàn thành đơn hàng');
        }
    },

    // Render order completion chart
    renderOrderCompletionChart(data) {
        const ctx = document.getElementById('orderCompletionChart');
        if (!ctx) return;

        // Destroy existing chart
        if (this.charts.orderCompletion) {
            this.charts.orderCompletion.destroy();
        }

        const total = data.total || 0;
        const completed = data.completed || 0;
        const cancelled = data.cancelled || 0;
        const pending = total - completed - cancelled;

        if (total === 0) {
            this.createEmptyChart('orderCompletionChart', 'Không có dữ liệu hoàn thành đơn hàng');
            return;
        }

        this.charts.orderCompletion = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Hoàn thành', 'Đang xử lý', 'Đã hủy'],
                datasets: [{
                    data: [completed, pending, cancelled],
                    backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const percentage = ((context.raw / total) * 100).toFixed(1);
                                return `${context.label}: ${context.raw} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    },

    // Create empty chart
    createEmptyChart(canvasId, message) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        // Destroy existing chart
        const chartKey = canvasId.replace('Chart', '');
        if (this.charts[chartKey]) {
            this.charts[chartKey].destroy();
        }

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
                    },
                    tooltip: {
                        enabled: false
                    }
                }
            }
        });

        this.charts[chartKey] = chart;
    },

    // Export report
    exportReport(format) {
        Utils.showToast(`Chức năng xuất báo cáo ${format.toUpperCase()} sẽ được cập nhật sớm`, 'info');
    }
};

// Export module
window.AdminReportModule = AdminReportModule;
