// Admin Product Management Module
const AdminProductModule = {
    // Current state
    currentPage: 1,
    currentFilters: {
        category: '',
        status: '',
        search: ''
    },
    products: [],
    categories: [],
    selectedProducts: new Set(),

    // Initialize product management
    init() {
        this.bindEvents();
    },

    // Bind event listeners
    bindEvents() {
        // Add product button
        const addProductBtn = document.getElementById('addProductBtn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', this.showProductForm.bind(this));
        }

        // Filter events
        const categoryFilter = document.getElementById('productCategoryFilter');
        const statusFilter = document.getElementById('productStatusFilter');
        const searchInput = document.getElementById('productSearchInput');

        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.currentFilters.category = e.target.value;
                this.currentPage = 1;
                this.loadProducts();
            });
        }

        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.currentFilters.status = e.target.value;
                this.currentPage = 1;
                this.loadProducts();
            });
        }

        if (searchInput) {
            const debouncedSearch = Utils.debounce((e) => {
                this.currentFilters.search = e.target.value;
                this.currentPage = 1;
                this.loadProducts();
            }, 300);
            searchInput.addEventListener('input', debouncedSearch);
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

    // Load products
    async loadProducts() {
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

            const response = await API.get(`/products?${params}`);
            this.products = response.data.products || [];
            this.categories = response.data.categories || [];

            this.renderProducts();
            this.renderPagination(response.data.pagination);
            this.updateCategoryFilter();

        } catch (error) {
            console.error('Error loading products:', error);
            Utils.showToast('Không thể tải danh sách sản phẩm', 'error');
        } finally {
            Utils.hideLoading();
        }
    },

    // Render products table
    renderProducts() {
        const tbody = document.getElementById('productsTableBody');
        if (!tbody) return;

        if (this.products.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">
                        <div style="padding: 40px; color: #666;">
                            <i class="fas fa-box-open" style="font-size: 48px; margin-bottom: 15px; color: #ddd;"></i>
                            <p>Không có sản phẩm nào</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.products.map(product => this.createProductRow(product)).join('');
        this.bindProductEvents();
    },

    // Create product table row
    createProductRow(product) {
        const discountPercent = product.discountPercentage || 0;
        const rating = product.rating?.average || 0;
        const ratingCount = product.rating?.count || 0;

        return `
            <tr data-product-id="${product._id}">
                <td class="product-image-cell">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </td>
                <td class="product-name-cell">
                    <div class="product-name">${product.name}</div>
                    <div class="product-description">${product.description}</div>
                </td>
                <td>
                    <span class="product-category">${product.category}</span>
                </td>
                <td>
                    <div class="product-price">${Utils.formatCurrency(product.price)}</div>
                    ${product.originalPrice ? `<div class="product-original-price">${Utils.formatCurrency(product.originalPrice)}</div>` : ''}
                    ${discountPercent > 0 ? `<div style="font-size: 12px; color: #dc3545;">-${discountPercent}%</div>` : ''}
                </td>
                <td>
                    <span class="status-badge ${product.isAvailable ? 'active' : 'inactive'}">
                        ${product.isAvailable ? 'Có sẵn' : 'Hết hàng'}
                    </span>
                </td>
                <td>
                    <div class="product-stats">
                        <div class="product-rating">
                            <span class="stars">${this.renderStars(rating)}</span>
                            <span>(${ratingCount})</span>
                        </div>
                        <div>Đã bán: ${product.soldCount || 0}</div>
                    </div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" onclick="AdminProductModule.viewProduct('${product._id}')" title="Xem chi tiết">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" onclick="AdminProductModule.editProduct('${product._id}')" title="Chỉnh sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="AdminProductModule.deleteProduct('${product._id}')" title="Xóa">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    },

    // Render star rating
    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }

        return stars;
    },

    // Bind product events
    bindProductEvents() {
        // Row click events are handled by onclick attributes in the HTML
    },

    // Update category filter
    updateCategoryFilter() {
        const categoryFilter = document.getElementById('productCategoryFilter');
        if (!categoryFilter || !this.categories.length) return;

        const currentValue = categoryFilter.value;
        categoryFilter.innerHTML = '<option value="">Tất cả danh mục</option>' +
            this.categories.map(category => 
                `<option value="${category}" ${category === currentValue ? 'selected' : ''}>${category}</option>`
            ).join('');
    },

    // Show product form
    showProductForm(productId = null) {
        const modal = document.getElementById('productModal');
        const content = document.getElementById('productModalContent');
        
        if (modal && content) {
            content.innerHTML = this.getProductFormHTML(productId);
            modal.style.display = 'block';
            this.bindProductFormEvents(productId);
            
            if (productId) {
                this.loadProductData(productId);
            }
        }
    },

    // Get product form HTML
    getProductFormHTML(productId) {
        const isEdit = !!productId;
        
        return `
            <div class="product-form">
                <h2>${isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
                
                <form id="productForm">
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="productName">Tên sản phẩm *</label>
                            <input type="text" id="productName" name="name" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="productCategory">Danh mục *</label>
                            <select id="productCategory" name="category" required>
                                <option value="">Chọn danh mục</option>
                                <option value="Phở">Phở</option>
                                <option value="Bún">Bún</option>
                                <option value="Cơm">Cơm</option>
                                <option value="Bánh mì">Bánh mì</option>
                                <option value="Nước uống">Nước uống</option>
                                <option value="Tráng miệng">Tráng miệng</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="productPrice">Giá bán *</label>
                            <input type="number" id="productPrice" name="price" min="0" step="1000" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="productOriginalPrice">Giá gốc</label>
                            <input type="number" id="productOriginalPrice" name="originalPrice" min="0" step="1000">
                        </div>
                        
                        <div class="form-group">
                            <label for="productPreparationTime">Thời gian chuẩn bị (phút)</label>
                            <input type="number" id="productPreparationTime" name="preparationTime" min="1" max="120" value="15">
                        </div>
                        
                        <div class="form-group">
                            <div class="checkbox-group">
                                <input type="checkbox" id="productAvailable" name="isAvailable" checked>
                                <label for="productAvailable">Có sẵn</label>
                            </div>
                            <div class="checkbox-group">
                                <input type="checkbox" id="productFeatured" name="isFeatured">
                                <label for="productFeatured">Sản phẩm nổi bật</label>
                            </div>
                        </div>
                        
                        <div class="form-group full-width">
                            <label for="productDescription">Mô tả sản phẩm *</label>
                            <textarea id="productDescription" name="description" required></textarea>
                        </div>
                        
                        <div class="form-group full-width">
                            <label>Hình ảnh sản phẩm *</label>
                            <div class="image-upload-area" id="imageUploadArea">
                                <div class="upload-icon">
                                    <i class="fas fa-cloud-upload-alt"></i>
                                </div>
                                <div class="upload-text">Kéo thả hình ảnh vào đây hoặc click để chọn</div>
                                <div class="upload-hint">Hỗ trợ: JPG, PNG, GIF (tối đa 5MB)</div>
                                <input type="file" id="productImages" name="images" multiple accept="image/*" style="display: none;">
                            </div>
                            <div class="image-preview" id="imagePreview"></div>
                        </div>
                        
                        <div class="form-group full-width">
                            <label>Thông tin dinh dưỡng (tùy chọn)</label>
                            <div class="nutrition-grid">
                                <div class="form-group">
                                    <label for="nutritionCalories">Calories</label>
                                    <input type="number" id="nutritionCalories" name="nutritionCalories" min="0">
                                </div>
                                <div class="form-group">
                                    <label for="nutritionProtein">Protein (g)</label>
                                    <input type="number" id="nutritionProtein" name="nutritionProtein" min="0" step="0.1">
                                </div>
                                <div class="form-group">
                                    <label for="nutritionCarbs">Carbs (g)</label>
                                    <input type="number" id="nutritionCarbs" name="nutritionCarbs" min="0" step="0.1">
                                </div>
                                <div class="form-group">
                                    <label for="nutritionFat">Fat (g)</label>
                                    <input type="number" id="nutritionFat" name="nutritionFat" min="0" step="0.1">
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="AdminProductModule.closeModal()">
                            Hủy
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i>
                            ${isEdit ? 'Cập nhật' : 'Thêm sản phẩm'}
                        </button>
                    </div>
                </form>
            </div>
        `;
    },

    // Bind product form events
    bindProductFormEvents(productId) {
        const form = document.getElementById('productForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleProductSubmit(e, productId));
        }

        // Image upload events
        const uploadArea = document.getElementById('imageUploadArea');
        const fileInput = document.getElementById('productImages');

        if (uploadArea && fileInput) {
            uploadArea.addEventListener('click', () => fileInput.click());
            uploadArea.addEventListener('dragover', this.handleDragOver);
            uploadArea.addEventListener('drop', this.handleDrop.bind(this));
            fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        }
    },

    // Handle product form submission
    async handleProductSubmit(e, productId) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Process nutrition info
        if (data.nutritionCalories || data.nutritionProtein || data.nutritionCarbs || data.nutritionFat) {
            data.nutritionInfo = {
                calories: data.nutritionCalories ? parseInt(data.nutritionCalories) : undefined,
                protein: data.nutritionProtein ? parseFloat(data.nutritionProtein) : undefined,
                carbs: data.nutritionCarbs ? parseFloat(data.nutritionCarbs) : undefined,
                fat: data.nutritionFat ? parseFloat(data.nutritionFat) : undefined
            };
        }

        // Remove individual nutrition fields
        delete data.nutritionCalories;
        delete data.nutritionProtein;
        delete data.nutritionCarbs;
        delete data.nutritionFat;

        // Convert checkboxes
        data.isAvailable = form.querySelector('[name="isAvailable"]').checked;
        data.isFeatured = form.querySelector('[name="isFeatured"]').checked;

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';

        try {
            let response;
            if (productId) {
                response = await API.put(`/products/${productId}`, data);
            } else {
                response = await API.post('/products', data);
            }

            if (response.success) {
                Utils.showToast(
                    productId ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!',
                    'success'
                );
                this.closeModal();
                this.loadProducts();
            }
        } catch (error) {
            Utils.showToast(error.message || 'Có lỗi xảy ra', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="fas fa-save"></i> ${productId ? 'Cập nhật' : 'Thêm sản phẩm'}`;
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
        this.processFiles(files);
    },

    // Handle file select
    handleFileSelect(e) {
        const files = e.target.files;
        this.processFiles(files);
    },

    // Process selected files
    processFiles(files) {
        const preview = document.getElementById('imagePreview');
        if (!preview) return;

        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const previewItem = document.createElement('div');
                    previewItem.className = 'preview-item';
                    previewItem.innerHTML = `
                        <img src="${e.target.result}" alt="Preview">
                        <button type="button" class="preview-remove" onclick="this.parentElement.remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                    preview.appendChild(previewItem);
                };
                reader.readAsDataURL(file);
            }
        });
    },

    // Load product data for editing
    async loadProductData(productId) {
        try {
            const response = await API.get(`/products/${productId}`);
            const product = response.data.product;
            
            // Fill form with product data
            const form = document.getElementById('productForm');
            if (form) {
                form.querySelector('[name="name"]').value = product.name || '';
                form.querySelector('[name="category"]').value = product.category || '';
                form.querySelector('[name="price"]').value = product.price || '';
                form.querySelector('[name="originalPrice"]').value = product.originalPrice || '';
                form.querySelector('[name="preparationTime"]').value = product.preparationTime || 15;
                form.querySelector('[name="description"]').value = product.description || '';
                form.querySelector('[name="isAvailable"]').checked = product.isAvailable;
                form.querySelector('[name="isFeatured"]').checked = product.isFeatured;
                
                // Fill nutrition info
                if (product.nutritionInfo) {
                    form.querySelector('[name="nutritionCalories"]').value = product.nutritionInfo.calories || '';
                    form.querySelector('[name="nutritionProtein"]').value = product.nutritionInfo.protein || '';
                    form.querySelector('[name="nutritionCarbs"]').value = product.nutritionInfo.carbs || '';
                    form.querySelector('[name="nutritionFat"]').value = product.nutritionInfo.fat || '';
                }
            }
            
        } catch (error) {
            Utils.showToast('Không thể tải thông tin sản phẩm', 'error');
        }
    },

    // View product
    viewProduct(productId) {
        // This would open a detailed view modal
        Utils.showToast('Chức năng xem chi tiết sẽ được cập nhật sớm', 'info');
    },

    // Edit product
    editProduct(productId) {
        this.showProductForm(productId);
    },

    // Delete product
    async deleteProduct(productId) {
        if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            return;
        }

        try {
            const response = await API.delete(`/products/${productId}`);
            if (response.success) {
                Utils.showToast('Xóa sản phẩm thành công!', 'success');
                this.loadProducts();
            }
        } catch (error) {
            Utils.showToast(error.message || 'Không thể xóa sản phẩm', 'error');
        }
    },

    // Render pagination
    renderPagination(pagination) {
        const container = document.getElementById('productsPagination');
        if (!container || !pagination) return;

        const { page, pages, total } = pagination;
        
        if (pages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <button ${page <= 1 ? 'disabled' : ''} onclick="AdminProductModule.goToPage(${page - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // Page numbers
        const startPage = Math.max(1, page - 2);
        const endPage = Math.min(pages, page + 2);

        if (startPage > 1) {
            paginationHTML += `<button onclick="AdminProductModule.goToPage(1)">1</button>`;
            if (startPage > 2) {
                paginationHTML += `<span>...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="${i === page ? 'active' : ''}" onclick="AdminProductModule.goToPage(${i})">
                    ${i}
                </button>
            `;
        }

        if (endPage < pages) {
            if (endPage < pages - 1) {
                paginationHTML += `<span>...</span>`;
            }
            paginationHTML += `<button onclick="AdminProductModule.goToPage(${pages})">${pages}</button>`;
        }

        // Next button
        paginationHTML += `
            <button ${page >= pages ? 'disabled' : ''} onclick="AdminProductModule.goToPage(${page + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        // Info
        paginationHTML += `
            <div class="pagination-info">
                Hiển thị ${(page - 1) * 10 + 1}-${Math.min(page * 10, total)} trong ${total} sản phẩm
            </div>
        `;

        container.innerHTML = paginationHTML;
    },

    // Go to specific page
    goToPage(page) {
        this.currentPage = page;
        this.loadProducts();
    },

    // Close modal
    closeModal() {
        const modal = document.getElementById('productModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
};

// Export module
window.AdminProductModule = AdminProductModule;
