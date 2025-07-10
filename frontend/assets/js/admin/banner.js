// Admin Banner Management Module
const AdminBannerModule = {
    // Current state
    banners: [],

    // Initialize banner management
    init() {
        this.bindEvents();
    },

    // Bind event listeners
    bindEvents() {
        // Add banner button
        const addBannerBtn = document.getElementById('addBannerBtn');
        if (addBannerBtn) {
            addBannerBtn.addEventListener('click', this.showBannerForm.bind(this));
        }

        // Modal close events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });

        document.querySelectorAll('.modal .close').forEach(closeBtn => {
            closeBtn.addEventListener('click', this.closeModal.bind(this));
        });
    },

    // Load banners
    async loadBanners() {
        try {
            Utils.showLoading();

            const response = await API.get('/banners');
            this.banners = response.data.banners || [];

            this.renderBanners();

        } catch (error) {
            console.error('Error loading banners:', error);
            Utils.showToast('Không thể tải danh sách banner', 'error');
        } finally {
            Utils.hideLoading();
        }
    },

    // Render banners grid
    renderBanners() {
        const container = document.getElementById('bannersGrid');
        if (!container) return;

        if (this.banners.length === 0) {
            container.innerHTML = `
                <div class="banners-empty">
                    <i class="fas fa-image"></i>
                    <h3>Chưa có banner nào</h3>
                    <p>Thêm banner đầu tiên để bắt đầu</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.banners.map(banner => this.createBannerCard(banner)).join('');
    },

    // Create banner card
    createBannerCard(banner) {
        return `
            <div class="banner-card" data-banner-id="${banner._id}">
                <img src="${banner.image}" alt="${banner.title}" class="banner-image">
                <div class="banner-content">
                    <h3 class="banner-title">${banner.title}</h3>
                    <p class="banner-description">${banner.description}</p>
                    
                    <div class="banner-meta">
                        <span>Thứ tự: <span class="banner-order">${banner.order}</span></span>
                        <span>${banner.isActive ? 'Đang hiển thị' : 'Đã ẩn'}</span>
                    </div>
                    
                    <div class="banner-actions">
                        <button class="banner-btn edit" onclick="AdminBannerModule.editBanner('${banner._id}')" title="Chỉnh sửa">
                            <i class="fas fa-edit"></i> Sửa
                        </button>
                        <button class="banner-btn toggle ${banner.isActive ? '' : 'inactive'}" 
                                onclick="AdminBannerModule.toggleBanner('${banner._id}')" 
                                title="${banner.isActive ? 'Ẩn banner' : 'Hiển thị banner'}">
                            <i class="fas fa-${banner.isActive ? 'eye-slash' : 'eye'}"></i> 
                            ${banner.isActive ? 'Ẩn' : 'Hiện'}
                        </button>
                        <button class="banner-btn delete" onclick="AdminBannerModule.deleteBanner('${banner._id}')" title="Xóa">
                            <i class="fas fa-trash"></i> Xóa
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // Show banner form
    showBannerForm(bannerId = null) {
        const modal = document.getElementById('bannerModal');
        const content = document.getElementById('bannerModalContent');
        
        if (modal && content) {
            content.innerHTML = this.getBannerFormHTML(bannerId);
            modal.style.display = 'block';
            this.bindBannerFormEvents(bannerId);
            
            if (bannerId) {
                this.loadBannerData(bannerId);
            }
        }
    },

    // Get banner form HTML
    getBannerFormHTML(bannerId) {
        const isEdit = !!bannerId;
        
        return `
            <div class="banner-form">
                <h2>${isEdit ? 'Chỉnh sửa banner' : 'Thêm banner mới'}</h2>
                
                <form id="bannerForm">
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="bannerTitle">Tiêu đề *</label>
                            <input type="text" id="bannerTitle" name="title" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="bannerOrder">Thứ tự hiển thị</label>
                            <input type="number" id="bannerOrder" name="order" min="1" value="1">
                        </div>
                        
                        <div class="form-group full-width">
                            <label for="bannerDescription">Mô tả</label>
                            <textarea id="bannerDescription" name="description"></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="bannerLink">Liên kết (URL)</label>
                            <input type="url" id="bannerLink" name="link" placeholder="https://...">
                        </div>
                        
                        <div class="form-group">
                            <label for="bannerButtonText">Văn bản nút</label>
                            <input type="text" id="bannerButtonText" name="buttonText" placeholder="Xem thêm">
                        </div>
                        
                        <div class="form-group full-width">
                            <label>Hình ảnh banner *</label>
                            <div class="image-upload-area" id="bannerImageUploadArea">
                                <div class="upload-icon">
                                    <i class="fas fa-cloud-upload-alt"></i>
                                </div>
                                <div class="upload-text">Kéo thả hình ảnh vào đây hoặc click để chọn</div>
                                <div class="upload-hint">Khuyến nghị: 1200x400px, JPG/PNG (tối đa 5MB)</div>
                                <input type="file" id="bannerImage" name="image" accept="image/*" style="display: none;">
                            </div>
                            <div class="image-preview" id="bannerImagePreview"></div>
                        </div>
                        
                        <div class="form-group">
                            <div class="checkbox-group">
                                <input type="checkbox" id="bannerActive" name="isActive" checked>
                                <label for="bannerActive">Hiển thị banner</label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="AdminBannerModule.closeModal()">
                            Hủy
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i>
                            ${isEdit ? 'Cập nhật' : 'Thêm banner'}
                        </button>
                    </div>
                </form>
            </div>
        `;
    },

    // Bind banner form events
    bindBannerFormEvents(bannerId) {
        const form = document.getElementById('bannerForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleBannerSubmit(e, bannerId));
        }

        // Image upload events
        const uploadArea = document.getElementById('bannerImageUploadArea');
        const fileInput = document.getElementById('bannerImage');

        if (uploadArea && fileInput) {
            uploadArea.addEventListener('click', () => fileInput.click());
            uploadArea.addEventListener('dragover', this.handleDragOver);
            uploadArea.addEventListener('drop', this.handleDrop.bind(this));
            fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        }
    },

    // Handle banner form submission
    async handleBannerSubmit(e, bannerId) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Convert checkbox
        data.isActive = form.querySelector('[name="isActive"]').checked;

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';

        try {
            let response;
            if (bannerId) {
                response = await API.put(`/banners/${bannerId}`, data);
            } else {
                response = await API.post('/banners', data);
            }

            if (response.success) {
                Utils.showToast(
                    bannerId ? 'Cập nhật banner thành công!' : 'Thêm banner thành công!',
                    'success'
                );
                this.closeModal();
                this.loadBanners();
            }
        } catch (error) {
            Utils.showToast(error.message || 'Có lỗi xảy ra', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="fas fa-save"></i> ${bannerId ? 'Cập nhật' : 'Thêm banner'}`;
        }
    },

    // Handle file drag over
    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    },

    // Handle file drop
    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        this.processFile(files[0]);
    },

    // Handle file select
    handleFileSelect(e) {
        const file = e.target.files[0];
        this.processFile(file);
    },

    // Process selected file
    processFile(file) {
        if (!file || !file.type.startsWith('image/')) {
            Utils.showToast('Vui lòng chọn file hình ảnh', 'warning');
            return;
        }

        const preview = document.getElementById('bannerImagePreview');
        if (!preview) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            preview.innerHTML = `
                <div class="preview-container">
                    <img src="${e.target.result}" alt="Preview" class="preview-image">
                    <button type="button" class="preview-remove" onclick="this.parentElement.parentElement.innerHTML=''">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        };
        reader.readAsDataURL(file);
    },

    // Load banner data for editing
    async loadBannerData(bannerId) {
        try {
            const response = await API.get(`/banners/${bannerId}`);
            const banner = response.data.banner;
            
            // Fill form with banner data
            const form = document.getElementById('bannerForm');
            if (form) {
                form.querySelector('[name="title"]').value = banner.title || '';
                form.querySelector('[name="description"]').value = banner.description || '';
                form.querySelector('[name="link"]').value = banner.link || '';
                form.querySelector('[name="buttonText"]').value = banner.buttonText || '';
                form.querySelector('[name="order"]').value = banner.order || 1;
                form.querySelector('[name="isActive"]').checked = banner.isActive;
                
                // Show current image
                if (banner.image) {
                    const preview = document.getElementById('bannerImagePreview');
                    if (preview) {
                        preview.innerHTML = `
                            <div class="preview-container">
                                <img src="${banner.image}" alt="Current banner" class="preview-image">
                                <button type="button" class="preview-remove" onclick="this.parentElement.parentElement.innerHTML=''">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        `;
                    }
                }
            }
            
        } catch (error) {
            Utils.showToast('Không thể tải thông tin banner', 'error');
        }
    },

    // Edit banner
    editBanner(bannerId) {
        this.showBannerForm(bannerId);
    },

    // Toggle banner visibility
    async toggleBanner(bannerId) {
        const banner = this.banners.find(b => b._id === bannerId);
        if (!banner) return;

        try {
            const response = await API.put(`/banners/${bannerId}/toggle`);
            if (response.success) {
                const action = banner.isActive ? 'ẩn' : 'hiển thị';
                Utils.showToast(`${action.charAt(0).toUpperCase() + action.slice(1)} banner thành công!`, 'success');
                this.loadBanners();
            }
        } catch (error) {
            Utils.showToast(error.message || 'Không thể thay đổi trạng thái banner', 'error');
        }
    },

    // Delete banner
    async deleteBanner(bannerId) {
        if (!confirm('Bạn có chắc chắn muốn xóa banner này?')) {
            return;
        }

        try {
            const response = await API.delete(`/banners/${bannerId}`);
            if (response.success) {
                Utils.showToast('Xóa banner thành công!', 'success');
                this.loadBanners();
            }
        } catch (error) {
            Utils.showToast(error.message || 'Không thể xóa banner', 'error');
        }
    },

    // Close modal
    closeModal() {
        const modal = document.getElementById('bannerModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
};

// Export module
window.AdminBannerModule = AdminBannerModule;
