// Authorize specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập để truy cập'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Vai trò ${req.user.role} không có quyền truy cập tài nguyên này`
            });
        }

        next();
    };
};

// Check if user is admin
const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Vui lòng đăng nhập để truy cập'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Chỉ admin mới có quyền truy cập'
        });
    }

    next();
};

// Check if user is staff or admin
const isStaffOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Vui lòng đăng nhập để truy cập'
        });
    }

    if (!['staff', 'admin'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'Chỉ staff hoặc admin mới có quyền truy cập'
        });
    }

    next();
};

// Check if user owns the resource or is admin/staff
const isOwnerOrStaff = (resourceUserField = 'user') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập để truy cập'
            });
        }

        // Admin and staff can access any resource
        if (['admin', 'staff'].includes(req.user.role)) {
            return next();
        }

        // For regular users, check ownership
        // This will be used in controllers where we have the resource
        req.checkOwnership = {
            userId: req.user._id,
            resourceUserField: resourceUserField
        };

        next();
    };
};

module.exports = {
    authorize,
    isAdmin,
    isStaffOrAdmin,
    isOwnerOrStaff
};
