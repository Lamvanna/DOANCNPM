// Admin Review Management Module
const AdminReviewModule = {
    // Current state
    currentPage: 1,
    currentFilters: {
        status: '',
        rating: '',
        search: ''
    },
    reviews: [],

    // Initialize review management
    init() {
        this.bindEvents();
    },

    // Bind event listeners
    bindEvents() {
        // Filter events
        const statusFilter = document.getElementById('reviewStatusFilter');
        const ratingFilter = document.getElementById('reviewRatingFilter');
        const searchInput = document.getElementById('reviewSearchInput');

        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.currentFilters.status = e.target.value;
                this.currentPage = 1;
                this.loadReviews();
            });
        }

        if (ratingFilter) {
            ratingFilter.addEventListener('change', (e) => {
                this.currentFilters.rating = e.target.value;
                this.currentPage = 1;
                this.loadReviews();
            });
        }

        if (searchInput) {
            const debouncedSearch = Utils.debounce((e) => {
                this.currentFilters.search = e.target.value;
                this.currentPage = 1;
                this.loadReviews();
            }, 300);
            searchInput.addEventListener('input', debouncedSearch);
        }
    },

    // Load reviews
    async loadReviews() {
        try {
            Utils.showLoading();

            const params = new URLSearchParams({
                page: this.currentPage,
                limit: 12,
                ...this.currentFilters
            });

            // Remove empty filters
            Object.keys(this.currentFilters).forEach(key => {
                if (!this.currentFilters[key]) {
                    params.delete(key);
                }
            });

            const response = await API.get(`/reviews?${params}`);
            this.reviews = response.data.reviews || [];

            this.renderReviews();
            this.renderPagination(response.data.pagination);

        } catch (error) {
            console.error('Error loading reviews:', error);
            Utils.showToast('Không thể tải danh sách đánh giá', 'error');
        } finally {
            Utils.hideLoading();
        }
    },

    // Render reviews grid
    renderReviews() {
        const container = document.getElementById('reviewsGrid');
        if (!container) return;

        if (this.reviews.length === 0) {
            container.innerHTML = `
                <div class="reviews-empty">
                    <i class="fas fa-star"></i>
                    <h3>Không có đánh giá nào</h3>
                    <p>Chưa có đánh giá nào cần xử lý</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.reviews.map(review => this.createReviewCard(review)).join('');
        this.bindReviewEvents();
    },

    // Create review card
    createReviewCard(review) {
        const statusTexts = {
            true: 'Đã duyệt',
            false: 'Chờ duyệt'
        };

        const statusClasses = {
            true: 'approved',
            false: 'pending'
        };

        return `
            <div class="review-card" data-review-id="${review._id}">
                <div class="review-header">
                    <div class="reviewer-info">
                        <img src="${review.user?.avatar || '/assets/images/default-avatar.png'}" 
                             alt="Avatar" class="reviewer-avatar">
                        <div class="reviewer-details">
                            <div class="reviewer-name">${review.user?.name || 'Ẩn danh'}</div>
                            <div class="review-date">${Utils.formatDate(review.createdAt)}</div>
                        </div>
                    </div>
                    <div class="review-status">
                        <div class="status-indicator ${statusClasses[review.isApproved]}"></div>
                        <span class="status-text">${statusTexts[review.isApproved]}</span>
                    </div>
                </div>
                
                <div class="review-product">
                    <img src="${review.product?.image || '/assets/images/placeholder.jpg'}" 
                         alt="${review.product?.name}" class="product-image">
                    <div class="product-name">${review.product?.name || 'Sản phẩm đã xóa'}</div>
                </div>
                
                <div class="review-rating">
                    <div class="stars">
                        ${this.renderStars(review.rating)}
                    </div>
                    <span class="rating-value">${review.rating}/5</span>
                </div>
                
                <div class="review-content">
                    <div class="review-comment">${review.comment}</div>
                    ${review.images && review.images.length > 0 ? `
                        <div class="review-images">
                            ${review.images.map(img => `
                                <img src="${img}" alt="Review image" class="review-image" 
                                     onclick="AdminReviewModule.showImageModal('${img}')">
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                
                ${review.adminResponse ? `
                    <div class="admin-response">
                        <div class="response-header">Phản hồi từ cửa hàng:</div>
                        <div class="response-content">${review.adminResponse.message}</div>
                        <div class="response-date">${Utils.formatDate(review.adminResponse.createdAt)}</div>
                    </div>
                ` : ''}
                
                <div class="review-actions">
                    ${!review.isApproved ? `
                        <button class="review-btn approve" onclick="AdminReviewModule.approveReview('${review._id}')">
                            <i class="fas fa-check"></i> Duyệt
                        </button>
                        <button class="review-btn reject" onclick="AdminReviewModule.rejectReview('${review._id}')">
                            <i class="fas fa-times"></i> Từ chối
                        </button>
                    ` : ''}
                    ${!review.adminResponse ? `
                        <button class="review-btn reply" onclick="AdminReviewModule.showReplyForm('${review._id}')">
                            <i class="fas fa-reply"></i> Phản hồi
                        </button>
                    ` : ''}
                    <button class="review-btn delete" onclick="AdminReviewModule.deleteReview('${review._id}')">
                        <i class="fas fa-trash"></i> Xóa
                    </button>
                </div>
                
                <div class="reply-form" id="replyForm_${review._id}">
                    <textarea placeholder="Nhập phản hồi của bạn..." id="replyText_${review._id}"></textarea>
                    <div class="reply-form-actions">
                        <button class="reply-submit" onclick="AdminReviewModule.submitReply('${review._id}')">
                            Gửi phản hồi
                        </button>
                        <button class="reply-cancel" onclick="AdminReviewModule.hideReplyForm('${review._id}')">
                            Hủy
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

    // Bind review events
    bindReviewEvents() {
        // Events are handled by onclick attributes in the HTML
    },

    // Approve review
    async approveReview(reviewId) {
        try {
            const response = await API.put(`/reviews/${reviewId}/approve`);
            if (response.success) {
                Utils.showToast('Duyệt đánh giá thành công!', 'success');
                this.loadReviews();
            }
        } catch (error) {
            Utils.showToast(error.message || 'Không thể duyệt đánh giá', 'error');
        }
    },

    // Reject review
    async rejectReview(reviewId) {
        if (!confirm('Bạn có chắc chắn muốn từ chối đánh giá này?')) {
            return;
        }

        try {
            const response = await API.put(`/reviews/${reviewId}/reject`);
            if (response.success) {
                Utils.showToast('Từ chối đánh giá thành công!', 'success');
                this.loadReviews();
            }
        } catch (error) {
            Utils.showToast(error.message || 'Không thể từ chối đánh giá', 'error');
        }
    },

    // Delete review
    async deleteReview(reviewId) {
        if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
            return;
        }

        try {
            const response = await API.delete(`/reviews/${reviewId}`);
            if (response.success) {
                Utils.showToast('Xóa đánh giá thành công!', 'success');
                this.loadReviews();
            }
        } catch (error) {
            Utils.showToast(error.message || 'Không thể xóa đánh giá', 'error');
        }
    },

    // Show reply form
    showReplyForm(reviewId) {
        const form = document.getElementById(`replyForm_${reviewId}`);
        if (form) {
            form.classList.add('active');
            const textarea = document.getElementById(`replyText_${reviewId}`);
            if (textarea) {
                textarea.focus();
            }
        }
    },

    // Hide reply form
    hideReplyForm(reviewId) {
        const form = document.getElementById(`replyForm_${reviewId}`);
        if (form) {
            form.classList.remove('active');
            const textarea = document.getElementById(`replyText_${reviewId}`);
            if (textarea) {
                textarea.value = '';
            }
        }
    },

    // Submit reply
    async submitReply(reviewId) {
        const textarea = document.getElementById(`replyText_${reviewId}`);
        if (!textarea) return;

        const message = textarea.value.trim();
        if (!message) {
            Utils.showToast('Vui lòng nhập nội dung phản hồi', 'warning');
            return;
        }

        try {
            const response = await API.post(`/reviews/${reviewId}/reply`, {
                message: message
            });

            if (response.success) {
                Utils.showToast('Gửi phản hồi thành công!', 'success');
                this.hideReplyForm(reviewId);
                this.loadReviews();
            }
        } catch (error) {
            Utils.showToast(error.message || 'Không thể gửi phản hồi', 'error');
        }
    },

    // Show image modal
    showImageModal(imageUrl) {
        // Create a simple image modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px; padding: 0;">
                <span class="close">&times;</span>
                <img src="${imageUrl}" alt="Review image" style="width: 100%; height: auto; border-radius: 12px;">
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal events
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('close')) {
                document.body.removeChild(modal);
            }
        });
    },

    // Render pagination
    renderPagination(pagination) {
        const container = document.getElementById('reviewsPagination');
        if (!container || !pagination) return;

        const { page, pages, total } = pagination;
        
        if (pages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <button ${page <= 1 ? 'disabled' : ''} onclick="AdminReviewModule.goToPage(${page - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // Page numbers
        const startPage = Math.max(1, page - 2);
        const endPage = Math.min(pages, page + 2);

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="${i === page ? 'active' : ''}" onclick="AdminReviewModule.goToPage(${i})">
                    ${i}
                </button>
            `;
        }

        // Next button
        paginationHTML += `
            <button ${page >= pages ? 'disabled' : ''} onclick="AdminReviewModule.goToPage(${page + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        // Info
        paginationHTML += `
            <div class="pagination-info">
                Hiển thị ${(page - 1) * 12 + 1}-${Math.min(page * 12, total)} trong ${total} đánh giá
            </div>
        `;

        container.innerHTML = paginationHTML;
    },

    // Go to specific page
    goToPage(page) {
        this.currentPage = page;
        this.loadReviews();
    }
};

// Export module
window.AdminReviewModule = AdminReviewModule;
