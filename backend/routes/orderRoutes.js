const express = require('express');
const {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    cancelOrder
} = require('../controllers/orderController');
const { protect } = require('../middlewares/authMiddleware');
const { isStaffOrAdmin } = require('../middlewares/roleMiddleware');

const router = express.Router();

// User routes
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/cancel', protect, cancelOrder);

// Admin/Staff routes
router.get('/', protect, isStaffOrAdmin, getAllOrders);
router.put('/:id/status', protect, isStaffOrAdmin, updateOrderStatus);

module.exports = router;
