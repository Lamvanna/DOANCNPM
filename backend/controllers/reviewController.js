const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
    try {
        const { product, rating, comment, images } = req.body;

        // Check if product exists
        const productExists = await Product.findById(product);
        if (!productExists) {
            return res.status(404).json({
                success: false,
                message: 'Sản phẩm không tồn tại'
            });
        }

        // Check if user has ordered this product
        const hasOrdered = await Order.findOne({
            user: req.user.id,
            'orderItems.product': product,
            status: 'delivered'
        });

        if (!hasOrdered) {
            return res.status(400).json({
                success: false,
                message: 'Bạn chỉ có thể đánh giá sản phẩm đã mua'
            });
        }

        // Check if user already reviewed this product
        const existingReview = await Review.findOne({
            user: req.user.id,
            product
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'Bạn đã đánh giá sản phẩm này rồi'
            });
        }

        // Create review
        const review = await Review.create({
            user: req.user.id,
            product,
            rating,
            comment,
            images: images || []
        });

        // Populate user info
        await review.populate('user', 'name avatar');
        await review.populate('product', 'name image');

        // Update product rating
        await updateProductRating(product);

        res.status(201).json({
            success: true,
            message: 'Đánh giá thành công',
            data: {
                review
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const { rating, sort } = req.query;
        
        // Build filter
        const filter = { 
            product: req.params.productId,
            isApproved: true
        };
        if (rating) filter.rating = parseInt(rating);

        // Build sort
        let sortOption = { createdAt: -1 };
        if (sort === 'rating_high') sortOption = { rating: -1, createdAt: -1 };
        if (sort === 'rating_low') sortOption = { rating: 1, createdAt: -1 };
        if (sort === 'oldest') sortOption = { createdAt: 1 };

        const reviews = await Review.find(filter)
            .populate('user', 'name avatar')
            .sort(sortOption)
            .skip(skip)
            .limit(limit);

        const total = await Review.countDocuments(filter);

        // Get rating statistics
        const ratingStats = await Review.aggregate([
            { $match: { product: req.params.productId, isApproved: true } },
            {
                $group: {
                    _id: '$rating',
                    count: { $sum: 1 }
                }
            }
        ]);

        const stats = {
            1: 0, 2: 0, 3: 0, 4: 0, 5: 0
        };
        ratingStats.forEach(stat => {
            stats[stat._id] = stat.count;
        });

        res.json({
            success: true,
            data: {
                reviews,
                pagination: {
                    page,
                    pages: Math.ceil(total / limit),
                    total
                },
                stats
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews
// @access  Private (Admin/Staff)
const getAllReviews = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const { status, rating, search } = req.query;
        
        // Build filter
        const filter = {};
        if (status === 'approved') filter.isApproved = true;
        if (status === 'pending') filter.isApproved = false;
        if (rating) filter.rating = parseInt(rating);
        if (search) {
            filter.$or = [
                { comment: { $regex: search, $options: 'i' } }
            ];
        }

        const reviews = await Review.find(filter)
            .populate('user', 'name email avatar')
            .populate('product', 'name image')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Review.countDocuments(filter);

        res.json({
            success: true,
            data: {
                reviews,
                pagination: {
                    page,
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Approve review
// @route   PUT /api/reviews/:id/approve
// @access  Private (Admin/Staff)
const approveReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đánh giá'
            });
        }

        review.isApproved = true;
        await review.save();

        // Update product rating
        await updateProductRating(review.product);

        res.json({
            success: true,
            message: 'Duyệt đánh giá thành công',
            data: {
                review
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Reject review
// @route   PUT /api/reviews/:id/reject
// @access  Private (Admin/Staff)
const rejectReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đánh giá'
            });
        }

        review.isApproved = false;
        await review.save();

        res.json({
            success: true,
            message: 'Từ chối đánh giá thành công',
            data: {
                review
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Reply to review
// @route   POST /api/reviews/:id/reply
// @access  Private (Admin/Staff)
const replyToReview = async (req, res) => {
    try {
        const { message } = req.body;
        
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đánh giá'
            });
        }

        review.adminResponse = {
            message,
            respondedBy: req.user.id,
            createdAt: new Date()
        };

        await review.save();
        await review.populate('adminResponse.respondedBy', 'name');

        res.json({
            success: true,
            message: 'Phản hồi đánh giá thành công',
            data: {
                review
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Admin)
const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đánh giá'
            });
        }

        const productId = review.product;
        await Review.findByIdAndDelete(req.params.id);

        // Update product rating
        await updateProductRating(productId);

        res.json({
            success: true,
            message: 'Xóa đánh giá thành công'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Helper function to update product rating
const updateProductRating = async (productId) => {
    try {
        const reviews = await Review.find({ 
            product: productId, 
            isApproved: true 
        });

        if (reviews.length === 0) {
            await Product.findByIdAndUpdate(productId, {
                rating: 0,
                numReviews: 0
            });
            return;
        }

        const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
        const avgRating = totalRating / reviews.length;

        await Product.findByIdAndUpdate(productId, {
            rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
            numReviews: reviews.length
        });
    } catch (error) {
        console.error('Error updating product rating:', error);
    }
};

module.exports = {
    createReview,
    getProductReviews,
    getAllReviews,
    approveReview,
    rejectReview,
    replyToReview,
    deleteReview
};
