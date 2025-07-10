const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');

// @desc    Get dashboard statistics
// @route   GET /api/statistics/dashboard
// @access  Private (Admin/Staff)
const getDashboardStats = async (req, res) => {
    try {
        // Basic counts
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalReviews = await Review.countDocuments();

        // Revenue statistics
        const revenueStats = await Order.aggregate([
            { $match: { status: 'delivered' } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalPrice' },
                    averageOrderValue: { $avg: '$totalPrice' }
                }
            }
        ]);

        const totalRevenue = revenueStats[0]?.totalRevenue || 0;
        const averageOrderValue = revenueStats[0]?.averageOrderValue || 0;

        // Order status distribution
        const orderStatusStats = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Recent orders (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentOrders = await Order.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });

        // New users (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const newUsers = await User.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        // Top selling products
        const topProducts = await Order.aggregate([
            { $match: { status: 'delivered' } },
            { $unwind: '$orderItems' },
            {
                $group: {
                    _id: '$orderItems.product',
                    totalSold: { $sum: '$orderItems.quantity' },
                    revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $project: {
                    name: '$product.name',
                    image: '$product.image',
                    totalSold: 1,
                    revenue: 1
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    totalProducts,
                    totalOrders,
                    totalReviews,
                    totalRevenue,
                    averageOrderValue,
                    recentOrders,
                    newUsers
                },
                orderStatusStats,
                topProducts
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get revenue statistics
// @route   GET /api/statistics/revenue
// @access  Private (Admin/Staff)
const getRevenueStats = async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;
        
        let groupBy, dateFormat;
        let startDate = new Date();
        
        switch (period) {
            case 'daily':
                groupBy = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' }
                };
                dateFormat = '%Y-%m-%d';
                startDate.setDate(startDate.getDate() - 30);
                break;
            case 'weekly':
                groupBy = {
                    year: { $year: '$createdAt' },
                    week: { $week: '$createdAt' }
                };
                dateFormat = '%Y-W%U';
                startDate.setDate(startDate.getDate() - 84); // 12 weeks
                break;
            case 'yearly':
                groupBy = { year: { $year: '$createdAt' } };
                dateFormat = '%Y';
                startDate.setFullYear(startDate.getFullYear() - 3);
                break;
            default: // monthly
                groupBy = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                };
                dateFormat = '%Y-%m';
                startDate.setMonth(startDate.getMonth() - 12);
        }

        const revenueData = await Order.aggregate([
            {
                $match: {
                    status: 'delivered',
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: groupBy,
                    revenue: { $sum: '$totalPrice' },
                    orders: { $sum: 1 },
                    averageOrderValue: { $avg: '$totalPrice' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
        ]);

        res.json({
            success: true,
            data: {
                period,
                revenue: revenueData
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get top products
// @route   GET /api/statistics/top-products
// @access  Private (Admin/Staff)
const getTopProducts = async (req, res) => {
    try {
        const { period = 'monthly', limit = 10 } = req.query;
        
        let startDate = new Date();
        switch (period) {
            case 'daily':
                startDate.setDate(startDate.getDate() - 1);
                break;
            case 'weekly':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'yearly':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            default: // monthly
                startDate.setMonth(startDate.getMonth() - 1);
        }

        const topProducts = await Order.aggregate([
            {
                $match: {
                    status: 'delivered',
                    createdAt: { $gte: startDate }
                }
            },
            { $unwind: '$orderItems' },
            {
                $group: {
                    _id: '$orderItems.product',
                    soldCount: { $sum: '$orderItems.quantity' },
                    revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } }
                }
            },
            { $sort: { soldCount: -1 } },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $project: {
                    name: '$product.name',
                    image: '$product.image',
                    price: '$product.price',
                    soldCount: 1,
                    revenue: 1
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                products: topProducts
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get category revenue
// @route   GET /api/statistics/category-revenue
// @access  Private (Admin/Staff)
const getCategoryRevenue = async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;
        
        let startDate = new Date();
        switch (period) {
            case 'daily':
                startDate.setDate(startDate.getDate() - 1);
                break;
            case 'weekly':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'yearly':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            default: // monthly
                startDate.setMonth(startDate.getMonth() - 1);
        }

        const categoryRevenue = await Order.aggregate([
            {
                $match: {
                    status: 'delivered',
                    createdAt: { $gte: startDate }
                }
            },
            { $unwind: '$orderItems' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'orderItems.product',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $group: {
                    _id: '$product.category',
                    revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { revenue: -1 } },
            {
                $project: {
                    category: '$_id',
                    revenue: 1,
                    orders: 1,
                    _id: 0
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                categories: categoryRevenue
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get new users statistics
// @route   GET /api/statistics/new-users
// @access  Private (Admin/Staff)
const getNewUsersStats = async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;
        
        let groupBy, startDate = new Date();
        
        switch (period) {
            case 'daily':
                groupBy = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' }
                };
                startDate.setDate(startDate.getDate() - 30);
                break;
            case 'weekly':
                groupBy = {
                    year: { $year: '$createdAt' },
                    week: { $week: '$createdAt' }
                };
                startDate.setDate(startDate.getDate() - 84);
                break;
            case 'yearly':
                groupBy = { year: { $year: '$createdAt' } };
                startDate.setFullYear(startDate.getFullYear() - 3);
                break;
            default: // monthly
                groupBy = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                };
                startDate.setMonth(startDate.getMonth() - 12);
        }

        const newUsers = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: groupBy,
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
        ]);

        res.json({
            success: true,
            data: {
                users: newUsers
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get order completion statistics
// @route   GET /api/statistics/order-completion
// @access  Private (Admin/Staff)
const getOrderCompletionStats = async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;
        
        let startDate = new Date();
        switch (period) {
            case 'daily':
                startDate.setDate(startDate.getDate() - 1);
                break;
            case 'weekly':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'yearly':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            default: // monthly
                startDate.setMonth(startDate.getMonth() - 1);
        }

        const completionStats = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const stats = {
            total: 0,
            completed: 0,
            cancelled: 0,
            pending: 0
        };

        completionStats.forEach(stat => {
            stats.total += stat.count;
            if (stat._id === 'delivered') {
                stats.completed = stat.count;
            } else if (stat._id === 'cancelled') {
                stats.cancelled = stat.count;
            } else {
                stats.pending += stat.count;
            }
        });

        res.json({
            success: true,
            data: {
                completion: stats
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getDashboardStats,
    getRevenueStats,
    getTopProducts,
    getCategoryRevenue,
    getNewUsersStats,
    getOrderCompletionStats
};
