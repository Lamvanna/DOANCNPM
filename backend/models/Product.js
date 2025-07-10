const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng nhập tên sản phẩm'],
        trim: true,
        maxlength: [100, 'Tên sản phẩm không được vượt quá 100 ký tự']
    },
    description: {
        type: String,
        required: [true, 'Vui lòng nhập mô tả sản phẩm'],
        maxlength: [500, 'Mô tả không được vượt quá 500 ký tự']
    },
    price: {
        type: Number,
        required: [true, 'Vui lòng nhập giá sản phẩm'],
        min: [0, 'Giá sản phẩm không được âm']
    },
    originalPrice: {
        type: Number,
        min: [0, 'Giá gốc không được âm']
    },
    category: {
        type: String,
        required: [true, 'Vui lòng chọn danh mục'],
        enum: {
            values: ['Phở', 'Bún', 'Cơm', 'Bánh Mì', 'Nước Uống', 'Tráng Miệng', 'Khác'],
            message: 'Danh mục không hợp lệ'
        }
    },
    image: {
        type: String,
        default: '/assets/images/default-product.jpg'
    },
    images: [{
        type: String
    }],
    isAvailable: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: String,
        trim: true
    }],
    nutritionInfo: {
        calories: Number,
        protein: Number,
        carbs: Number,
        fat: Number
    },
    preparationTime: {
        type: Number, // in minutes
        default: 15
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    numReviews: {
        type: Number,
        default: 0
    },
    soldCount: {
        type: Number,
        default: 0
    },
    viewCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes for better performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isAvailable: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ soldCount: -1 });
productSchema.index({ createdAt: -1 });

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
    if (this.originalPrice && this.originalPrice > this.price) {
        return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
    }
    return 0;
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
