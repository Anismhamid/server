const Users = require('../models/User');

const requirePermission = (permission) => {
    return async (req, res, next) => {
        try {
            if (!req.payload?._id) {
                return res.status(401).json({
                    success: false,
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required',
                });
            }

            const user = await Users.findById(req.payload._id)
                .select('accountStatus permissions role')
                .lean();

            if (!user) {
                return res.status(401).json({
                    success: false,
                    code: 'USER_NOT_FOUND',
                    message: 'User not found',
                });
            }

            if (user.accountStatus === 'disabled') {
                return res.status(403).json({
                    success: false,
                    code: 'ACCOUNT_DISABLED',
                    message: 'Your account is disabled',
                });
            }

            if (user.permissions?.canUseAccount === false) {
                return res.status(403).json({
                    success: false,
                    code: 'ACCOUNT_USAGE_DISABLED',
                    message: 'You cannot use your account',
                });
            }

            if (user.permissions?.[permission] === false) {
                return res.status(403).json({
                    success: false,
                    code: 'PERMISSION_DENIED',
                    permission,
                    message: `Permission ${permission} is disabled`,
                });
            }

            next();
        } catch (error) {
            console.error('Permission middleware error:', error);

            return res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    };
};

module.exports = {
    requirePermission,
};
