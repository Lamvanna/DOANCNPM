const express = require('express');
const {
    getBanners,
    getBannerById,
    createBanner,
    updateBanner,
    deleteBanner,
    toggleBannerStatus,
    reorderBanners
} = require('../controllers/bannerController');
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

const router = express.Router();

// Public routes
router.get('/', getBanners);

// Admin routes
router.get('/:id', protect, isAdmin, getBannerById);
router.post('/', protect, isAdmin, createBanner);
router.put('/reorder', protect, isAdmin, reorderBanners);
router.put('/:id', protect, isAdmin, updateBanner);
router.put('/:id/toggle', protect, isAdmin, toggleBannerStatus);
router.delete('/:id', protect, isAdmin, deleteBanner);

module.exports = router;
