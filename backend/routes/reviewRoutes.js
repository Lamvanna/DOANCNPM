const express = require('express');
const {
    createReview,
    getProductReviews,
    getAllReviews,
    approveReview,
    rejectReview,
    replyToReview,
    deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middlewares/authMiddleware');
const { isStaffOrAdmin } = require('../middlewares/roleMiddleware');

const router = express.Router();

// Public routes
router.get('/product/:productId', getProductReviews);

// User routes
router.post('/', protect, createReview);

// Staff/Admin routes
router.get('/', protect, isStaffOrAdmin, getAllReviews);
router.put('/:id/approve', protect, isStaffOrAdmin, approveReview);
router.put('/:id/reject', protect, isStaffOrAdmin, rejectReview);
router.post('/:id/reply', protect, isStaffOrAdmin, replyToReview);
router.delete('/:id', protect, isStaffOrAdmin, deleteReview);

module.exports = router;
