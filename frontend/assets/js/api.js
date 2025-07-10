// API Configuration and Helper Functions
const API_BASE_URL = 'http://localhost:5000/api';

// API Helper Class
class API {
    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Add auth token if available
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    static async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        
        return this.request(url, {
            method: 'GET'
        });
    }

    static async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }

    // File upload method
    static async uploadFile(endpoint, formData) {
        const url = `${API_BASE_URL}${endpoint}`;
        
        const config = {
            method: 'POST',
            body: formData
        };

        // Add auth token if available
        const token = localStorage.getItem('token');
        if (token) {
            config.headers = {
                Authorization: `Bearer ${token}`
            };
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Upload failed');
            }

            return data;
        } catch (error) {
            console.error('Upload Error:', error);
            throw error;
        }
    }
}

// Auth API methods
const AuthAPI = {
    async login(email, password) {
        return API.post('/auth/login', { email, password });
    },

    async register(userData) {
        return API.post('/auth/register', userData);
    },

    async logout() {
        return API.post('/auth/logout');
    },

    async getProfile() {
        return API.get('/auth/profile');
    },

    async updateProfile(userData) {
        return API.put('/auth/profile', userData);
    },

    async changePassword(passwordData) {
        return API.put('/auth/change-password', passwordData);
    }
};

// Products API methods
const ProductsAPI = {
    async getProducts(params = {}) {
        return API.get('/products', params);
    },

    async getProduct(id) {
        return API.get(`/products/${id}`);
    },

    async createProduct(productData) {
        return API.post('/products', productData);
    },

    async updateProduct(id, productData) {
        return API.put(`/products/${id}`, productData);
    },

    async deleteProduct(id) {
        return API.delete(`/products/${id}`);
    },

    async getFeaturedProducts() {
        return API.get('/products', { featured: true });
    },

    async searchProducts(query) {
        return API.get('/products', { search: query });
    }
};

// Orders API methods
const OrdersAPI = {
    async createOrder(orderData) {
        return API.post('/orders', orderData);
    },

    async getMyOrders(params = {}) {
        return API.get('/orders/my-orders', params);
    },

    async getOrder(id) {
        return API.get(`/orders/${id}`);
    },

    async getAllOrders(params = {}) {
        return API.get('/orders', params);
    },

    async updateOrderStatus(id, status, note = '') {
        return API.put(`/orders/${id}/status`, { status, note });
    },

    async cancelOrder(id, reason = '') {
        return API.put(`/orders/${id}/cancel`, { reason });
    }
};

// Users API methods (Admin)
const UsersAPI = {
    async getUsers(params = {}) {
        return API.get('/users', params);
    },

    async getUser(id) {
        return API.get(`/users/${id}`);
    },

    async updateUser(id, userData) {
        return API.put(`/users/${id}`, userData);
    },

    async deleteUser(id) {
        return API.delete(`/users/${id}`);
    },

    async updateUserStatus(id, isActive) {
        return API.put(`/users/${id}/status`, { isActive });
    },

    async updateUserRole(id, role) {
        return API.put(`/users/${id}/role`, { role });
    },

    async getUserStats() {
        return API.get('/users/stats');
    }
};

// Reviews API methods
const ReviewsAPI = {
    async createReview(reviewData) {
        return API.post('/reviews', reviewData);
    },

    async getProductReviews(productId, params = {}) {
        return API.get(`/reviews/product/${productId}`, params);
    },

    async getAllReviews(params = {}) {
        return API.get('/reviews', params);
    },

    async approveReview(id) {
        return API.put(`/reviews/${id}/approve`);
    },

    async rejectReview(id) {
        return API.put(`/reviews/${id}/reject`);
    },

    async replyToReview(id, message) {
        return API.post(`/reviews/${id}/reply`, { message });
    },

    async deleteReview(id) {
        return API.delete(`/reviews/${id}`);
    }
};

// Banners API methods
const BannersAPI = {
    async getBanners(params = {}) {
        return API.get('/banners', params);
    },

    async getBanner(id) {
        return API.get(`/banners/${id}`);
    },

    async createBanner(bannerData) {
        return API.post('/banners', bannerData);
    },

    async updateBanner(id, bannerData) {
        return API.put(`/banners/${id}`, bannerData);
    },

    async deleteBanner(id) {
        return API.delete(`/banners/${id}`);
    },

    async toggleBannerStatus(id) {
        return API.put(`/banners/${id}/toggle`);
    },

    async reorderBanners(banners) {
        return API.put('/banners/reorder', { banners });
    }
};

// Statistics API methods
const StatisticsAPI = {
    async getDashboardStats() {
        return API.get('/statistics/dashboard');
    },

    async getRevenueStats(period = 'monthly') {
        return API.get('/statistics/revenue', { period });
    },

    async getTopProducts(period = 'monthly', limit = 10) {
        return API.get('/statistics/top-products', { period, limit });
    },

    async getCategoryRevenue(period = 'monthly') {
        return API.get('/statistics/category-revenue', { period });
    },

    async getNewUsersStats(period = 'monthly') {
        return API.get('/statistics/new-users', { period });
    },

    async getOrderCompletionStats(period = 'monthly') {
        return API.get('/statistics/order-completion', { period });
    }
};

// Export all API methods
window.API = API;
window.AuthAPI = AuthAPI;
window.ProductsAPI = ProductsAPI;
window.OrdersAPI = OrdersAPI;
window.UsersAPI = UsersAPI;
window.ReviewsAPI = ReviewsAPI;
window.BannersAPI = BannersAPI;
window.StatisticsAPI = StatisticsAPI;
