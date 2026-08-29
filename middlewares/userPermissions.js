const User = require('../models/User');

const requirePermission = (permission) => {
    return async (req, res, next) => {
        try {
            if (!req.payload?._id) {
                return res.status(401).json({
                    success: false,
                    code: 'UNAUTHORIZED',
                    message: 'Unauthorized',
                });
            }

            const user = await User.findById(req.payload._id).select(
                'permissions role accountStatus',
            );

            if (!user) {
                return res.status(404).json({
                    success: false,
                    code: 'USER_NOT_FOUND',
                    message: 'User not found',
                });
            }

            if (user.accountStatus === 'disabled') {
                return res.status(403).json({
                    success: false,
                    code: 'ACCOUNT_DISABLED',
                    message: 'Account is disabled',
                });
            }

            const hasPermission = user.permissions?.[permission] === true;

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    code: 'PERMISSION_DENIED',
                    permission,
                    message:
                        'You do not have permission to perform this action',
                });
            }

            req.currentUser = user;

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

const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        const role = req.currentUser?.role || req.payload?.role;

        if (!allowedRoles.includes(role)) {
            return res.status(403).json({
                success: false,
                code: 'ROLE_NOT_ALLOWED',
                message: 'Your role is not allowed to perform this action',
            });
        }

        next();
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
    requireRole,
    setPermission,
};
