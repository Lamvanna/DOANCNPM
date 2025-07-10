const express = require('express');
const {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    updateUserStatus,
    updateUserRole,
    getUserStats
} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

const router = express.Router();

// Admin routes
router.get('/', protect, isAdmin, getUsers);
router.get('/stats', protect, isAdmin, getUserStats);
router.get('/:id', protect, isAdmin, getUserById);
router.put('/:id', protect, isAdmin, updateUser);
router.put('/:id/role', protect, isAdmin, updateUserRole);
router.put('/:id/status', protect, isAdmin, updateUserStatus);
router.delete('/:id', protect, isAdmin, deleteUser);

module.exports = router;
