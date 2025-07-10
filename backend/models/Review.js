const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },

    rating: {
        type: Number,
        required: [true, 'Vui lòng chọn số sao đánh giá'],
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        maxlength: [500, 'Bình luận không được vượt quá 500 ký tự']
    },
    images: [{
        type: String
    }],
    isApproved: {
        type: Boolean,
        default: false
    },
    adminResponse: {
        message: String,
        createdAt: {
            type: Date,
            default: Date.now
        },
        respondedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    helpfulCount: {
        type: Number,
        default: 0
    },
    reportCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes
reviewSchema.index({ product: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ isApproved: 1 });
reviewSchema.index({ createdAt: -1 });

// Ensure one review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Update product rating after review save/update/delete
reviewSchema.post('save', async function() {
    await updateProductRating(this.product);
});

reviewSchema.post('remove', async function() {
    await updateProductRating(this.product);
});

reviewSchema.post('findOneAndUpdate', async function(doc) {
    if (doc) {
        await updateProductRating(doc.product);
    }
});

// Function to update product rating
async function updateProductRating(productId) {
    const Product = mongoose.model('Product');
    const Review = mongoose.model('Review');
    
    const stats = await Review.aggregate([
        {
            $match: { 
                product: productId,
                isApproved: true
            }
        },
        {
            $group: {
                _id: null,
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 }
            }
        }
    ]);
    
    if (stats.length > 0) {
        await Product.findByIdAndUpdate(productId, {
            rating: Math.round(stats[0].averageRating * 10) / 10,
            numReviews: stats[0].totalReviews
        });
    } else {
        await Product.findByIdAndUpdate(productId, {
            rating: 0,
            numReviews: 0
        });
    }
}

module.exports = mongoose.model('Review', reviewSchema);
