const express = require('express');
const {
    getDashboardStats,
    getRevenueStats,
    getTopProducts,
    getCategoryRevenue,
    getNewUsersStats,
    getOrderCompletionStats
} = require('../controllers/statisticController');
const { protect } = require('../middlewares/authMiddleware');
const { isStaffOrAdmin } = require('../middlewares/roleMiddleware');

const router = express.Router();

// Staff/Admin routes
router.get('/dashboard', protect, isStaffOrAdmin, getDashboardStats);
router.get('/revenue', protect, isStaffOrAdmin, getRevenueStats);
router.get('/top-products', protect, isStaffOrAdmin, getTopProducts);
router.get('/category-revenue', protect, isStaffOrAdmin, getCategoryRevenue);
router.get('/new-users', protect, isStaffOrAdmin, getNewUsersStats);
router.get('/order-completion', protect, isStaffOrAdmin, getOrderCompletionStats);

module.exports = router;
