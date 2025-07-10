const Banner = require('../models/Banner');

// @desc    Get all banners
// @route   GET /api/banners
// @access  Public
const getBanners = async (req, res) => {
    try {
        const { isActive } = req.query;
        
        // Build filter
        const filter = {};
        if (isActive !== undefined) {
            filter.isActive = isActive === 'true';
        }

        const banners = await Banner.find(filter)
            .sort({ order: 1, createdAt: -1 });

        res.json({
            success: true,
            data: {
                banners
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get banner by ID
// @route   GET /api/banners/:id
// @access  Private (Admin)
const getBannerById = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        
        if (!banner) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy banner'
            });
        }

        res.json({
            success: true,
            data: {
                banner
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create banner
// @route   POST /api/banners
// @access  Private (Admin)
const createBanner = async (req, res) => {
    try {
        const {
            title,
            description,
            image,
            link,
            buttonText,
            order,
            isActive
        } = req.body;

        // Check if order already exists
        if (order) {
            const existingBanner = await Banner.findOne({ order });
            if (existingBanner) {
                return res.status(400).json({
                    success: false,
                    message: 'Thứ tự này đã được sử dụng'
                });
            }
        }

        const banner = await Banner.create({
            title,
            description,
            image,
            link,
            buttonText,
            order: order || await getNextOrder(),
            isActive: isActive !== undefined ? isActive : true
        });

        res.status(201).json({
            success: true,
            message: 'Tạo banner thành công',
            data: {
                banner
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update banner
// @route   PUT /api/banners/:id
// @access  Private (Admin)
const updateBanner = async (req, res) => {
    try {
        const {
            title,
            description,
            image,
            link,
            buttonText,
            order,
            isActive
        } = req.body;

        const banner = await Banner.findById(req.params.id);
        if (!banner) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy banner'
            });
        }

        // Check if order already exists (exclude current banner)
        if (order && order !== banner.order) {
            const existingBanner = await Banner.findOne({ 
                order, 
                _id: { $ne: req.params.id } 
            });
            if (existingBanner) {
                return res.status(400).json({
                    success: false,
                    message: 'Thứ tự này đã được sử dụng'
                });
            }
        }

        const updatedBanner = await Banner.findByIdAndUpdate(
            req.params.id,
            {
                title,
                description,
                image,
                link,
                buttonText,
                order,
                isActive
            },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Cập nhật banner thành công',
            data: {
                banner: updatedBanner
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete banner
// @route   DELETE /api/banners/:id
// @access  Private (Admin)
const deleteBanner = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        
        if (!banner) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy banner'
            });
        }

        await Banner.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Xóa banner thành công'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Toggle banner status
// @route   PUT /api/banners/:id/toggle
// @access  Private (Admin)
const toggleBannerStatus = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        
        if (!banner) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy banner'
            });
        }

        banner.isActive = !banner.isActive;
        await banner.save();

        res.json({
            success: true,
            message: `${banner.isActive ? 'Kích hoạt' : 'Ẩn'} banner thành công`,
            data: {
                banner
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Reorder banners
// @route   PUT /api/banners/reorder
// @access  Private (Admin)
const reorderBanners = async (req, res) => {
    try {
        const { banners } = req.body; // Array of { id, order }
        
        if (!Array.isArray(banners)) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu không hợp lệ'
            });
        }

        // Update order for each banner
        const updatePromises = banners.map(item => 
            Banner.findByIdAndUpdate(item.id, { order: item.order })
        );

        await Promise.all(updatePromises);

        // Get updated banners
        const updatedBanners = await Banner.find()
            .sort({ order: 1, createdAt: -1 });

        res.json({
            success: true,
            message: 'Sắp xếp banner thành công',
            data: {
                banners: updatedBanners
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Helper function to get next order number
const getNextOrder = async () => {
    const lastBanner = await Banner.findOne().sort({ order: -1 });
    return lastBanner ? lastBanner.order + 1 : 1;
};

module.exports = {
    getBanners,
    getBannerById,
    createBanner,
    updateBanner,
    deleteBanner,
    toggleBannerStatus,
    reorderBanners
};
