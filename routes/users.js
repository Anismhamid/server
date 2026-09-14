const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Message = require('../models/Message');
const Posts = require('../models/post');
const Block = require('../models/Block');
const Jwt = require('jsonwebtoken');
const { compareSync, genSaltSync, hashSync } = require('bcryptjs');
const _ = require('lodash');
const auth = require('../middlewares/auth');
const { verifyGoogleToken } = require('../utils/googleAuth');
const { userSchema, loginSchema } = require('../schema/userSchema');
const completeUserSchema = require('../schema/completeUserSchema');
const editUserProfileSchema = require('../schema/editUserProfile');
const chalk = require('chalk');
const rateLimit = require('express-rate-limit');
const { setAuthCookie, clearAuthCookie } = require('../utils/authCookie');

const {
    requirePermission,
    setPermission,
} = require('../middlewares/userPermissions');

const {
    updateUserPermission,
} = require('../utils/permissionHandler/updateUserPermission');

const {
    forgotPassword,
    resetPassword,
} = require('../controllers/authController');

// ============================================================
// ERROR HELPERS — توحيد شكل الأخطاء
// ============================================================

const sendError = (res, status, code, message) => {
    return res.status(status).json({
        success: false,
        code,
        message,
    });
};

// users role
const roleType = {
    Admin: 'Admin',
    Moderator: 'Moderator',
    Client: 'Client',
};

// ============================================================
// TOKEN
// ============================================================

const generateToken = (user) => {
    return Jwt.sign(
        {
            _id: user._id,
            name: {
                first: user.name?.first,
                last: user.name?.last,
            },
            slug: user.slug,
            email: user.email,
            role: user.role,
            image: {
                url: user.image?.url,
            },
            phone: {
                phone_1: user.phone?.phone_1,
                phone_2: user.phone?.phone_2,
            },
            address: {
                city: user.address?.city,
                street: user.address?.street,
                houseNumber: user.address?.houseNumber,
            },

            // Online / Offline
            status: user.status,

            // حالة الحساب
            accountStatus: user.accountStatus,

            // صلاحيات الحساب
            permissions: {
                canLogin: user.permissions?.canLogin ?? true,
                canCreatePosts: user.permissions?.canCreatePosts ?? true,
                canSendMessages: user.permissions?.canSendMessages ?? true,
                canSendOffers: user.permissions?.canSendOffers ?? true,
                canUseAccount: user.permissions?.canUseAccount ?? true,
                canAccessExistingData:
                    user.permissions?.canAccessExistingData ?? true,
            },
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '7d',
            algorithm: 'HS256',
        },
    );
};

// ============================================================
// RATE LIMITERS
// ============================================================

const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        code: 'RATE_LIMITED',
        message: 'Too many requests, try again later',
    },
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
        success: false,
        code: 'RATE_LIMITED',
        message: 'Too many login attempts, try again later',
    },
});

// ============================================================
// PASSWORD RESET
// ============================================================

router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password/:token', resetPassword);

// ============================================================
// PUSH TOKENS
// ============================================================

// Save FCM push token
router.patch('/push-token', auth, async (req, res) => {
    try {
        const { pushToken } = req.body;

        if (
            !pushToken ||
            typeof pushToken !== 'string' ||
            pushToken.trim().length === 0
        ) {
            return sendError(
                res,
                400,
                'INVALID_PUSH_TOKEN',
                'Valid push token is required',
            );
        }

        if (pushToken.length < 20) {
            return sendError(
                res,
                400,
                'INVALID_PUSH_TOKEN',
                'Invalid push token format',
            );
        }

        const user = await User.findByIdAndUpdate(
            req.payload._id,
            {
                $addToSet: { pushTokens: pushToken.trim() },
            },
            { new: true },
        );

        if (!user) {
            return sendError(res, 404, 'USER_NOT_FOUND', 'User not found');
        }

        console.info('Push token updated:', {
            userId: req.payload._id,
            email: user.email,
            totalTokens: user.pushTokens.length,
        });

        return res.json({
            success: true,
            message: 'Push token saved successfully',
        });
    } catch (error) {
        console.error('Error saving push token:', {
            userId: req.payload._id,
            error: error.message,
        });

        if (error.name === 'CastError') {
            return sendError(res, 400, 'INVALID_USER_ID', 'Invalid user ID');
        }

        return sendError(
            res,
            500,
            'PUSH_TOKEN_SAVE_ERROR',
            'Failed to save push token',
        );
    }
});

router.delete('/push-token', auth, async (req, res) => {
    try {
        const user = await User.findById(req.payload._id).select('-password');

        if (!user) {
            return sendError(res, 404, 'USER_NOT_FOUND', 'User not found');
        }

        user.pushTokens = [];

        await user.save();

        return res.json({
            success: true,
            message: 'Push token removed',
        });
    } catch (error) {
        console.error('Remove push token error:', error);

        return sendError(
            res,
            500,
            'PUSH_TOKEN_REMOVE_ERROR',
            'Failed to remove push token',
        );
    }
});

// ============================================================
// REGISTER
// ============================================================

router.post('/', async (req, res) => {
    try {
        // validate the body
        const { error } = userSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: false,
        });

        if (error) {
            return res.status(400).json({
                success: false,
                code: 'VALIDATION_ERROR',
                message: error.details.map((d) => d.message).join(', '),
            });
        }

        // check email
        let user = await User.findOne({ email: req.body.email }).select(
            '-password',
        );
        if (user) {
            return sendError(res, 409, 'EMAIL_EXISTS', 'Email already exists');
        }

        // check slug (منع race condition)
        if (req.body.slug) {
            const existingSlug = await User.findOne({
                slug: req.body.slug,
            }).select('_id');

            if (existingSlug) {
                return sendError(
                    res,
                    409,
                    'SLUG_EXISTS',
                    'Username already taken',
                );
            }
        }

        user = new User({
            ...req.body,

            registeredAt: new Date(),

            status: true,

            accountStatus: 'active',

            permissions: {
                canLogin: true,
                canCreatePosts: true,
                canSendMessages: true,
                canSendOffers: true,
                canUseAccount: true,
                canAccessExistingData: true,
            },
        });

        const salt = genSaltSync(10);
        user.password = hashSync(user.password, salt);

        await user.save();

        // socket
        const io = req.app.get('io');
        if (io) {
            io.emit('user:registered', {
                userId: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        }

        // create token
        const token = generateToken(user);
        setAuthCookie(res, token);

        return res.status(201).json({
            success: true,
            message: 'Account created successfully',
        });
    } catch (error) {
        console.error('Register error:', error);

        // منع race condition على unique slug
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0];

            if (field === 'slug') {
                return sendError(
                    res,
                    409,
                    'SLUG_EXISTS',
                    'Username already taken',
                );
            }

            if (field === 'email') {
                return sendError(
                    res,
                    409,
                    'EMAIL_EXISTS',
                    'Email already exists',
                );
            }
        }

        return sendError(res, 500, 'REGISTER_ERROR', 'Internal server error');
    }
});

// ============================================================
// LOGIN
// ============================================================

router.post('/login', loginLimiter, async (req, res) => {
    try {
        const { error } = loginSchema.validate(req.body);

        if (error) {
            return sendError(
                res,
                400,
                'VALIDATION_ERROR',
                error.details[0].message,
            );
        }

        const user = await User.findOne({
            email: req.body.email,
        });

        if (!user) {
            return sendError(
                res,
                400,
                'INVALID_CREDENTIALS',
                'Invalid email or password',
            );
        }

        if (
            user.accountStatus === 'disabled' ||
            user.permissions?.canLogin === false
        ) {
            return sendError(
                res,
                403,
                'LOGIN_DISABLED',
                'Login is disabled for this account',
            );
        }

        if (!user.password) {
            return sendError(
                res,
                400,
                'NO_PASSWORD',
                'This account has no password',
            );
        }

        const isValid = compareSync(req.body.password, user.password);

        if (!isValid) {
            return sendError(
                res,
                400,
                'INVALID_CREDENTIALS',
                'Invalid email or password',
            );
        }

        // حماية activity
        if (!Array.isArray(user.activity)) {
            user.activity = [];
        }

        user.activity.push(new Date().toLocaleString());
        user.status = true;

        await user.save();

        // io
        const io = req.app.get('io');
        if (io) {
            io.emit('user:newUserLoggedIn', {
                userId: user._id,
                email: user.email,
                role: user.role,
                status: user.status,
            });

            io.emit('user:statusChanged', {
                userId: user._id.toString(),
                status: user.status,
            });
        }

        const token = generateToken(user);
        setAuthCookie(res, token);

        return res.status(200).json({
            success: true,
            message: 'Login successful',
        });
    } catch (error) {
        console.error('Login error:', error);

        return sendError(res, 500, 'LOGIN_ERROR', 'Internal server error');
    }
});

// ============================================================
// GOOGLE OAUTH
// ============================================================

router.get('/google/verify/:id', async (req, res) => {
    try {
        const user = await User.findOne({ googleId: req.params.id }).select(
            '_id',
        );
        return res.send({ exists: Boolean(user) });
    } catch (error) {
        console.error('Google verify error:', error);
        return res.send({ exists: false });
    }
});

function generateSlug(first, last) {
    const safeFirst = (first || 'user').toLowerCase();
    const safeLast = (last || '').toLowerCase();
    return `${safeFirst}-${safeLast}-${Date.now()}`.replace(/-+/g, '-');
}

router.post('/google', async (req, res) => {
    try {
        const io = req.app.get('io');

        const { credentialToken } = req.body;
        if (!credentialToken) {
            return sendError(res, 400, 'MISSING_GOOGLE_TOKEN', 'Missing token');
        }

        const payload = await verifyGoogleToken(credentialToken);

        if (!payload || !payload.sub || !payload.email) {
            return sendError(
                res,
                400,
                'INVALID_GOOGLE_PAYLOAD',
                'Invalid Google payload',
            );
        }

        if (payload.email_verified !== true) {
            return sendError(
                res,
                401,
                'EMAIL_NOT_VERIFIED',
                'Google email is not verified',
            );
        }

        // check if user exists
        let user = await User.findOne({ email: payload.email });

        if (user) {
            if (
                user.accountStatus === 'disabled' ||
                user.permissions?.canLogin === false
            ) {
                return sendError(
                    res,
                    403,
                    'LOGIN_DISABLED',
                    'Login is disabled for this account',
                );
            }

            if (!user.googleId) {
                user.googleId = payload.sub;
            }

            if (!Array.isArray(user.activity)) {
                user.activity = [];
            }

            user.activity.push(new Date().toLocaleString('he-IL'));

            user.status = true;

            await user.save();

            const token = generateToken(user);

            if (io) {
                io.emit('user:newUserLoggedIn', {
                    userId: user._id,
                    email: user.email,
                    role: user.role,
                    slug: user.slug,
                    status: user.status,
                });

                io.emit('user:statusChanged', {
                    userId: user._id.toString(),
                    status: user.status,
                });
            }

            setAuthCookie(res, token);

            return res.status(200).json({
                success: true,
                message: 'Login successful',
            });
        }

        // --- null-safe access ---
        const phoneFromClient = req.body.phone || {};
        const addressFromClient = req.body.address || {};

        // slug: نستخدم slug من العميل إذا أُرسل، وإلا نولّد واحداً
        const requestedSlug =
            typeof addressFromClient.slug === 'string' &&
            addressFromClient.slug.trim().length >= 3
                ? addressFromClient.slug.trim().toLowerCase()
                : null;

        let finalSlug = requestedSlug;

        if (finalSlug) {
            const slugTaken = await User.findOne({ slug: finalSlug }).select(
                '_id',
            );
            if (slugTaken) finalSlug = null;
        }

        if (!finalSlug) {
            finalSlug = generateSlug(payload.given_name, payload.family_name);
        }

        user = new User({
            name: {
                first: payload.given_name || 'Google',
                last: payload.family_name || 'User',
            },
            phone: {
                phone_1: phoneFromClient.phone_1 || '',
                phone_2: phoneFromClient.phone_2 || '',
            },
            address: {
                city: addressFromClient.city || '',
                street: addressFromClient.street || '',
                houseNumber: addressFromClient.houseNumber || '',
            },
            email: payload.email,
            password: hashSync(payload.sub, 10),
            image: {
                url: payload.picture || '',
                alt: `${payload.given_name || ''} ${
                    payload.family_name || ''
                }`.trim(),
            },
            role: 'Client',
            activity: [new Date().toLocaleString('he-IL')],
            registeredAt: new Date(),
            googleId: payload.sub,
            status: true,

            accountStatus: 'active',

            permissions: {
                canLogin: true,
                canCreatePosts: true,
                canSendMessages: true,
                canSendOffers: true,
                canUseAccount: true,
                canAccessExistingData: true,
            },
            slug: finalSlug,
        });

        await user.save();

        if (io) {
            io.emit('user:registered', {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                slug: user.slug,
            });
        }

        const token = generateToken(user);
        setAuthCookie(res, token);

        return res.status(201).json({
            success: true,
            message: 'Account created successfully',
        });
    } catch (error) {
        console.error('Google auth error:', error);

        if (error.code === 11000) {
            return sendError(res, 409, 'SLUG_EXISTS', 'Username already taken');
        }

        return sendError(
            res,
            500,
            'GOOGLE_AUTH_ERROR',
            'Internal server error',
        );
    }
});

// ============================================================
// GET CURRENT USER
// ⚠️ يجب أن يكون قبل /:userId
// ============================================================

router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.payload._id)
            .select('-password')
            .lean();

        if (!user) {
            return sendError(res, 404, 'USER_NOT_FOUND', 'User not found');
        }

        if (
            user.accountStatus === 'disabled' ||
            user.permissions?.canLogin === false
        ) {
            return sendError(
                res,
                403,
                'ACCOUNT_DISABLED',
                'Account is disabled',
            );
        }

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error('Get current user error:', error);

        return sendError(
            res,
            500,
            'CURRENT_USER_ERROR',
            'Internal server error',
        );
    }
});

// ============================================================
// GET ALL USERS (Admin / Moderator)
// ============================================================

router.get('/', auth, requirePermission('canUseAccount'), async (req, res) => {
    try {
        if (
            req.payload.role !== roleType.Admin &&
            req.payload.role !== roleType.Moderator
        ) {
            return sendError(
                res,
                403,
                'USERS_MANAGEMENT_ACCESS_DENIED',
                'Only admins and moderators can access users',
            );
        }

        const users = await User.find().select('-password').lean();

        if (!users.length) {
            return sendError(res, 404, 'NO_USERS', 'No users found yet');
        }

        return res.status(200).json(users);
    } catch (error) {
        console.error('Get users error:', error);

        return sendError(res, 500, 'GET_USERS_ERROR', 'Internal server error');
    }
});

// ============================================================
// PUBLIC CUSTOMER ROUTES
// ============================================================

router.get('/customer/:slug', async (req, res) => {
    try {
        const { slug } = req.params;

        const user = await User.findOne({ slug }).select('-password');
        if (!user) {
            return sendError(res, 404, 'USER_NOT_FOUND', 'User not found');
        }

        return res.status(200).send(user);
    } catch (error) {
        console.error('Customer profile error:', error);
        return sendError(
            res,
            500,
            'CUSTOMER_PROFILE_ERROR',
            'Internal server error',
        );
    }
});

router.get('/customer/:slug/posts', async (req, res) => {
    try {
        const { slug } = req.params;

        const user = await User.findOne({ slug }).select('_id');

        if (!user) {
            return sendError(res, 404, 'USER_NOT_FOUND', 'User not found');
        }

        const posts = await Posts.find({
            seller: user._id,
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: posts.length,
            posts,
        });
    } catch (error) {
        console.error('Customer posts error:', error);

        return sendError(
            res,
            500,
            'CUSTOMER_POSTS_ERROR',
            'Internal server error',
        );
    }
});

// ============================================================
// CHECK SLUG AVAILABILITY
// ============================================================

router.get('/check-slug/:slug', async (req, res) => {
    try {
        const { slug } = req.params;

        if (!/^[a-z0-9-]+$/.test(slug)) {
            return res.status(400).json({
                available: false,
                message: 'تنسيق اسم المستخدم غير صالح',
            });
        }

        if (slug.length < 3 || slug.length > 30) {
            return res.status(400).json({
                available: false,
                message: 'يجب أن يكون طول اسم المستخدم بين 3 و 30 حرفاً',
            });
        }

        const existingUser = await User.findOne({ slug }).select('_id');

        return res.status(200).json({
            available: !existingUser,
            message: existingUser ? 'اسم المستخدم محجوز' : 'اسم المستخدم متاح',
        });
    } catch (error) {
        console.error('Error checking slug:', error);

        return res.status(500).json({
            available: false,
            message: 'حدث خطأ أثناء التحقق من اسم المستخدم',
        });
    }
});

// ============================================================
// GET SINGLE USER
// ============================================================

router.get(
    '/:userId',
    auth,
    requirePermission('canUseAccount'),
    async (req, res) => {
        try {
            const { role, _id } = req.payload;
            const { userId } = req.params;

            if (
                _id !== userId &&
                role !== roleType.Admin &&
                role !== roleType.Moderator
            ) {
                return sendError(
                    res,
                    401,
                    'ACCESS_DENIED',
                    'You do not have permission to access this resource',
                );
            }

            const user = await User.findById(userId).select('-password');
            if (!user) {
                return sendError(res, 404, 'USER_NOT_FOUND', 'User not found');
            }

            return res.status(200).send(user);
        } catch (error) {
            console.error('Get user error:', error);

            return sendError(
                res,
                500,
                'GET_USER_ERROR',
                'Internal server error',
            );
        }
    },
);

// ============================================================
// UPDATE USER ROLE (Admin only)
// ⚠️ الآن يعتمد على userId بدلاً من userEmail
// ============================================================

router.patch(
    '/role/:userId',
    auth,
    requirePermission('canUseAccount'),
    async (req, res) => {
        try {
            if (req.payload.role !== roleType.Admin) {
                return sendError(
                    res,
                    403,
                    'ADMIN_ONLY',
                    'Access denied. Admins only',
                );
            }

            const { userId } = req.params;
            const { role } = req.body;

            if (
                ![roleType.Admin, roleType.Moderator, roleType.Client].includes(
                    role,
                )
            ) {
                return sendError(
                    res,
                    400,
                    'INVALID_ROLE',
                    'Invalid role value',
                );
            }

            const user = await User.findByIdAndUpdate(
                userId,
                { role },
                { new: true, runValidators: true },
            )
                .select('-password')
                .lean();

            if (!user) {
                return sendError(res, 404, 'USER_NOT_FOUND', 'User not found');
            }

            const io = req.app.get('io');
            if (io) {
                io.emit('user:roleChanged', {
                    userId: user._id.toString(),
                    role: user.role,
                });
            }

            return res.status(200).send(user);
        } catch (error) {
            console.error('Role update error:', error);

            return sendError(
                res,
                500,
                'ROLE_UPDATE_ERROR',
                'Internal server error',
            );
        }
    },
);

// ============================================================
// COMPLETE USER DATA
// ============================================================

router.patch(
    '/compleate/:userId',
    auth,
    requirePermission('canUseAccount'),
    async (req, res) => {
        try {
            const { error } = completeUserSchema.validate(req.body);
            if (error) {
                return sendError(
                    res,
                    400,
                    'VALIDATION_ERROR',
                    error.details[0].message,
                );
            }

            const isAdmin = req.payload.role === roleType.Admin;
            const isSelf = req.params.userId === req.payload._id;

            if (!isAdmin && !isSelf) {
                return sendError(res, 403, 'FORBIDDEN', 'Forbidden');
            }

            const updateData = {
                phone: {
                    phone_1: req.body.phone?.phone_1 || '',
                    phone_2: req.body.phone?.phone_2 || '',
                },
                image: {
                    url: req.body.image?.url || '',
                },
                address: {
                    city: req.body.address?.city || '',
                    street: req.body.address?.street || '',
                    houseNumber: req.body.address?.houseNumber || '',
                },
                gender: req.body.gender || '',
            };

            const user = await User.findByIdAndUpdate(
                req.params.userId,
                updateData,
                { new: true },
            )
                .select('-password -__v')
                .lean();

            if (!user) {
                return sendError(res, 404, 'USER_NOT_FOUND', 'User not found');
            }

            return res.status(200).send(user);
        } catch (error) {
            console.error('Complete profile error:', error);

            return sendError(
                res,
                500,
                'COMPLETE_PROFILE_ERROR',
                'Internal server error',
            );
        }
    },
);

// ============================================================
// EDIT USER PROFILE
// ============================================================

router.patch(
    '/edit-user/:userId',
    auth,
    requirePermission('canUseAccount'),
    async (req, res) => {
        try {
            const isSelf = req.params.userId === req.payload._id.toString();
            const isAdmin = req.payload.role === roleType.Admin;

            const { error } = editUserProfileSchema.validate(req.body);
            if (error) {
                return sendError(
                    res,
                    400,
                    'VALIDATION_ERROR',
                    error.details[0].message,
                );
            }

            if (!isAdmin && !isSelf) {
                return sendError(res, 403, 'FORBIDDEN', 'Forbidden');
            }

            const userExists = await User.findById(req.params.userId);
            if (!userExists) {
                return sendError(res, 404, 'USER_NOT_FOUND', 'User not found');
            }

            const updateData = {
                name: {
                    first: req.body.name?.first || '',
                    last: req.body.name?.last || '',
                },
                phone: {
                    phone_1: req.body.phone?.phone_1 || '',
                    phone_2: req.body.phone?.phone_2 || '',
                },
                image: {
                    url: req.body.image?.url || '',
                    alt: req.body.image?.alt || '',
                },
                address: {
                    city: req.body.address?.city || '',
                    street: req.body.address?.street || '',
                    houseNumber: req.body.address?.houseNumber || '',
                },
                gender: req.body.gender || '',
            };

            const user = await User.findByIdAndUpdate(
                req.params.userId,
                updateData,
                { new: true },
            )
                .select('-password -__v')
                .lean();

            // ✅ إصلاح: return قبل 500
            if (!user) {
                return sendError(
                    res,
                    500,
                    'EDIT_PROFILE_ERROR',
                    'Failed to update profile',
                );
            }

            return res.status(200).send(user);
        } catch (error) {
            console.error('Edit profile error:', error);

            return sendError(
                res,
                500,
                'EDIT_PROFILE_ERROR',
                'Internal server error',
            );
        }
    },
);

// ============================================================
// CHANGE PASSWORD
// ============================================================

router.patch(
    '/password/:userId',
    auth,
    requirePermission('canUseAccount'),
    async (req, res) => {
        try {
            const { userId } = req.params;
            const { newPassword } = req.body;
            const isAdmin = req.payload.role === roleType.Admin;
            const isSelf = req.payload._id === userId;

            if (!newPassword || newPassword.length < 6) {
                return sendError(
                    res,
                    400,
                    'WEAK_PASSWORD',
                    'Password must contain at least 6 characters',
                );
            }

            const user = await User.findById(userId);
            if (!user) {
                return sendError(res, 404, 'USER_NOT_FOUND', 'User not found');
            }

            if (!isAdmin && !isSelf) {
                return sendError(
                    res,
                    403,
                    'FORBIDDEN',
                    'No permission to change password',
                );
            }

            user.password = hashSync(newPassword, 10);
            await user.save();

            return res.status(200).json({
                success: true,
                message: 'Password updated successfully',
            });
        } catch (err) {
            console.error('Change password error:', err);

            return sendError(
                res,
                500,
                'PASSWORD_UPDATE_ERROR',
                'Internal server error',
            );
        }
    },
);

// ============================================================
// DELETE FULL ACCOUNT
// ============================================================

router.delete(
    '/:userId',
    auth,
    requirePermission('canUseAccount'),
    async (req, res) => {
        try {
            const isAdmin = req.payload.role === roleType.Admin;
            const isSelf = req.payload._id === req.params.userId;

            if (!isAdmin && !isSelf) {
                return sendError(
                    res,
                    401,
                    'UNAUTHORIZED',
                    'Unauthorized, Cannot make this change',
                );
            }

            const userId = req.params.userId;

            const user = await User.findById(userId);
            if (!user) {
                return sendError(res, 404, 'USER_NOT_FOUND', 'User not found');
            }

            // 1. messages
            const deletedMessages = await Message.deleteMany({
                $or: [{ from: userId }, { to: userId }],
            });

            // 2. posts
            const deletedPosts = await Posts.deleteMany({
                seller: userId,
            });

            // 3. blocks
            const deletedBlocks = await Block.deleteMany({
                $or: [{ blockerId: userId }, { blockedId: userId }],
            });

            // 4. user
            await User.findByIdAndDelete(userId);

            // logout cookie if self
            if (isSelf) {
                clearAuthCookie(res);
            }

            return res.status(200).json({
                success: true,
                message:
                    'User account, messages, posts and blocks deleted successfully',
                deletedMessages: deletedMessages.deletedCount,
                deletedPosts: deletedPosts.deletedCount,
                deletedBlocks: deletedBlocks.deletedCount,
            });
        } catch (error) {
            console.error('Delete account error:', error);

            return sendError(
                res,
                500,
                'DELETE_ACCOUNT_ERROR',
                'Internal server error',
            );
        }
    },
);

// ============================================================
// UPDATE STATUS (online / offline)
// ============================================================

router.patch(
    '/status/:userId',
    auth,
    requirePermission('canUseAccount'),
    async (req, res) => {
        try {
            const io = req.app.get('io');
            const { userId } = req.params;
            const { status } = req.body;

            // authorization: self or admin
            const isSelf = req.payload._id === userId;
            const isAdmin = req.payload.role === roleType.Admin;

            if (!isSelf && !isAdmin) {
                return sendError(
                    res,
                    403,
                    'FORBIDDEN',
                    'You cannot change this user status',
                );
            }

            if (typeof status !== 'boolean') {
                return sendError(
                    res,
                    400,
                    'INVALID_STATUS',
                    'Status must be boolean',
                );
            }

            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { status },
                { new: true },
            )
                .select('-password')
                .lean();

            // ✅ إصلاح: null check قبل الوصول إلى name
            if (!updatedUser) {
                return sendError(res, 404, 'USER_NOT_FOUND', 'User not found');
            }

            console.log(
                chalk.red(
                    `user-${updatedUser.name?.first} to-${updatedUser.status}`,
                ),
            );

            if (io) {
                io.emit('user:statusChanged', {
                    userId: updatedUser._id.toString(),
                    status: updatedUser.status,
                });
            }

            return res.status(200).send(updatedUser);
        } catch (error) {
            console.error('Status update error:', error);

            return sendError(
                res,
                500,
                'STATUS_UPDATE_ERROR',
                'Internal server error',
            );
        }
    },
);

// ============================================================
// ACCOUNT STATUS (Admin only)
// ============================================================

router.patch('/account-status/:userId', auth, async (req, res) => {
    try {
        if (req.payload.role !== roleType.Admin) {
            return sendError(res, 403, 'ADMIN_ONLY', 'Admins only');
        }

        const { userId } = req.params;
        const { accountStatus } = req.body;

        if (!['active', 'disabled'].includes(accountStatus)) {
            return sendError(
                res,
                400,
                'INVALID_ACCOUNT_STATUS',
                'Invalid account status',
            );
        }

        // لا تسمح للـ Admin بتعطيل نفسه
        if (userId === req.payload._id.toString()) {
            return sendError(
                res,
                400,
                'CANNOT_DISABLE_SELF',
                'You cannot disable your own account',
            );
        }

        const user = await User.findByIdAndUpdate(
            userId,
            {
                $set: { accountStatus },
            },
            {
                new: true,
                runValidators: true,
            },
        )
            .select('-password')
            .lean();

        if (!user) {
            return sendError(res, 404, 'USER_NOT_FOUND', 'User not found');
        }

        const io = req.app.get('io');

        if (io) {
            io.emit('user:accountStatusChanged', {
                userId: user._id.toString(),
                accountStatus: user.accountStatus,
            });
        }

        // إذا تم التعطيل → اجعله offline
        if (accountStatus === 'disabled') {
            await User.findByIdAndUpdate(userId, {
                $set: { status: false },
            });

            if (io) {
                io.emit('user:statusChanged', {
                    userId: user._id.toString(),
                    status: false,
                });
            }
        }

        return res.status(200).json({
            success: true,
            message:
                accountStatus === 'disabled'
                    ? 'Account disabled successfully'
                    : 'Account activated successfully',
            user,
        });
    } catch (error) {
        console.error('Account status update error:', error);

        return sendError(
            res,
            500,
            'ACCOUNT_STATUS_UPDATE_ERROR',
            'Internal server error',
        );
    }
});

// ============================================================
// PERMISSIONS (Admin only, one route per permission)
// ============================================================

router.patch(
    '/permissions/:userId/login',
    auth,
    setPermission('canLogin'),
    updateUserPermission,
);

router.patch(
    '/permissions/:userId/create-posts',
    auth,
    setPermission('canCreatePosts'),
    updateUserPermission,
);

router.patch(
    '/permissions/:userId/messages',
    auth,
    setPermission('canSendMessages'),
    updateUserPermission,
);

router.patch(
    '/permissions/:userId/offers',
    auth,
    setPermission('canSendOffers'),
    updateUserPermission,
);

router.patch(
    '/permissions/:userId/use-account',
    auth,
    setPermission('canUseAccount'),
    updateUserPermission,
);

router.patch(
    '/permissions/:userId/access-existing-data',
    auth,
    setPermission('canAccessExistingData'),
    updateUserPermission,
);

// ============================================================
// LOGOUT
// ✅ الآن يحوّل المستخدم offline إن كان التوكن صالحاً
// ============================================================

router.post('/logout', async (req, res) => {
    try {
        const token = req.cookies?.safqa_token;

        if (token && process.env.JWT_SECRET) {
            try {
                const decoded = Jwt.verify(token, process.env.JWT_SECRET);

                const io = req.app.get('io');

                const user = await User.findByIdAndUpdate(
                    decoded._id,
                    { status: false },
                    { new: true },
                )
                    .select('-password')
                    .lean();

                if (user && io) {
                    io.emit('user:statusChanged', {
                        userId: user._id.toString(),
                        status: false,
                    });
                }
            } catch (verifyError) {
                console.warn('Logout: token invalid, clearing cookie anyway');
            }
        }

        clearAuthCookie(res);

        return res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error) {
        console.error('Logout error:', error);

        clearAuthCookie(res);

        return res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    }
});

module.exports = router;
