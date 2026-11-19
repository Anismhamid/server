const User = require('../models/User');

/**
 * جلب بيانات المستخدم الحالية من قاعدة البيانات.
 * لا نعتمد على role أو permissions الموجودة داخل JWT.
 */
const getCurrentUser = async (req) => {
    if (!req.payload?._id) {
        return null;
    }

    // إعادة استخدام المستخدم إذا تم جلبه مسبقاً
    if (req.currentUser?._id?.toString() === req.payload._id.toString()) {
        return req.currentUser;
    }

    const user = await User.findById(req.payload._id).select(
        '_id role accountStatus permissions',
    );

    if (user) {
        req.currentUser = user;
    }

    return user;
};

/**
 * التحقق من أن الحساب مسموح له باستخدام النظام.
 */
const validateAccount = (user, res) => {
    if (user.accountStatus === 'disabled') {
        res.status(403).json({
            success: false,
            code: 'ACCOUNT_DISABLED',
            message: 'Account is disabled',
        });
        return false;
    }

    if (user.permissions?.canLogin === false) {
        res.status(403).json({
            success: false,
            code: 'LOGIN_DISABLED',
            message: 'Login permission is disabled',
        });
        return false;
    }

    if (user.permissions?.canUseAccount === false) {
        res.status(403).json({
            success: false,
            code: 'ACCOUNT_ACCESS_DISABLED',
            message: 'Account access is disabled',
        });
        return false;
    }

    return true;
};

/**
 * التحقق من صلاحية محددة.
 */
const requirePermission = (permission) => {
    return async (req, res, next) => {
        try {
            const user = await getCurrentUser(req);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    code: 'UNAUTHORIZED',
                    message: 'User not found or session invalid',
                });
            }

            if (!validateAccount(user, res)) {
                return;
            }

            const hasPermission =
                user.permissions?.[permission] === true;

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    code: 'PERMISSION_DENIED',
                    permission,
                    message: 'You do not have permission to perform this action',
                });
            }

            return next();
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

/**
 * التحقق من الدور الحالي من MongoDB.
 * ممنوع استخدام req.payload.role كبديل.
 */
const requireRole = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            const user = await getCurrentUser(req);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    code: 'UNAUTHORIZED',
                    message: 'User not found or session invalid',
                });
            }

            if (!validateAccount(user, res)) {
                return;
            }

            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({
                    success: false,
                    code: 'ROLE_NOT_ALLOWED',
                    message: 'Your role is not allowed to perform this action',
                });
            }

            return next();
        } catch (error) {
            console.error('Role middleware error:', error);

            return res.status(500).json({
                success: false,
                code: 'ROLE_CHECK_ERROR',
                message: 'Internal server error',
            });
        }
    };
};

/**
 * تحديد اسم الصلاحية المراد تعديلها.
 */
const setPermission = (permission) => {
    return (req, res, next) => {
        req.permission = permission;
        next();
    };
};

/**
 * التحقق من صلاحية الحساب للعمليات التي تتطلب تسجيل الدخول.
 * لا تشترط دوراً أو صلاحية إدارية.
 */
const requireActiveAccount = async (req, res, next) => {
    try {
        const user = await getCurrentUser(req);

        if (!user) {
            return res.status(401).json({
                success: false,
                code: 'UNAUTHORIZED',
                message: 'User not found or session invalid',
            });
        }

        if (!validateAccount(user, res)) {
            return;
        }

        return next();
    } catch (error) {
        console.error('Active account middleware error:', error);

        return res.status(500).json({
            success: false,
            code: 'ACCOUNT_CHECK_ERROR',
            message: 'Internal server error',
        });
    }
};

module.exports = {
    requirePermission,
    requireRole,
    setPermission,
    requireActiveAccount,
};