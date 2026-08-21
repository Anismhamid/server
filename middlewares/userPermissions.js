const User = require('../models/User');

const requirePermission = (permission) => {
    return async (req, res, next) => {
        try {
            const user = await User.findById(req.payload._id).select(
                'permissions',
            );

            if (!user) {
                return res.status(404).json({
                    success: false,
                    code: 'USER_NOT_FOUND',
                    message: 'User not found',
                });
            }

            const hasPermission = user.permissions?.[permission] ?? true;

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    code: 'PERMISSION_DENIED',
                    message:
                        'You do not have permission to perform this action',
                });
            }

            next();
        } catch (error) {
            console.error('Permission middleware error:', error);

            return res.status(500).json({
                success: false,
                code: 'PERMISSION_CHECK_ERROR',
                message: 'Internal server error',
            });
        }
    };
};

const setPermission = (permission) => {
    return (req, res, next) => {
        req.permission = permission;
        next();
    };
};

module.exports = {
    requirePermission,
    setPermission,
};
