const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Vui lòng nhập tiêu đề banner'],
        trim: true,
        maxlength: [100, 'Tiêu đề không được vượt quá 100 ký tự']
    },
    description: {
        type: String,
        maxlength: [200, 'Mô tả không được vượt quá 200 ký tự']
    },
    image: {
        type: String,
        required: [true, 'Vui lòng chọn hình ảnh banner']
    },
    link: {
        type: String,
        default: '#'
    },
    buttonText: {
        type: String,
        default: 'Xem thêm'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date
    },
    clickCount: {
        type: Number,
        default: 0
    },
    viewCount: {
        type: Number,
        default: 0
    },
    targetAudience: {
        type: String,
        enum: ['all', 'new_users', 'returning_users', 'vip_users'],
        default: 'all'
    },
    backgroundColor: {
        type: String,
        default: '#ffffff'
    },
    textColor: {
        type: String,
        default: '#000000'
    }
}, {
    timestamps: true
});

// Indexes
bannerSchema.index({ isActive: 1 });
bannerSchema.index({ order: 1 });
bannerSchema.index({ startDate: 1, endDate: 1 });

// Virtual to check if banner is currently active
bannerSchema.virtual('isCurrentlyActive').get(function() {
    const now = new Date();
    const isWithinDateRange = (!this.startDate || this.startDate <= now) && 
                             (!this.endDate || this.endDate >= now);
    return this.isActive && isWithinDateRange;
});

// Ensure virtual fields are serialized
bannerSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Banner', bannerSchema);
