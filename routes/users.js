const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Message = require('../models/Message');
const Posts = require('../models/post');
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

// users role
const roleType = {
    Admin: 'Admin',
    Moderator: 'Moderator',
    Client: 'Client',
};

// for generating token
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

            // Online / Offline فقط
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

const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // 5 محاولات كل 15 دقيقة لكل IP
    message: { message: 'Too many requests, try again later' },
});

router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Save FCM push token
router.patch('/push-token', auth, async (req, res) => {
    try {
        const { pushToken } = req.body;

        // Validate input
        if (
            !pushToken ||
            typeof pushToken !== 'string' ||
            pushToken.trim().length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: 'Valid push token is required',
            });
        }

        // Optional: Validate token format
        if (pushToken.length < 20) {
            return res.status(400).json({
                success: false,
                message: 'Invalid push token format',
            });
        }

        const user = await User.findByIdAndUpdate(
            req.payload._id,
            {
                $addToSet: { pushTokens: pushToken.trim() },
            },
            { new: true },
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Log without exposing sensitive data
        console.info('Push token updated:', {
            userId: req.payload._id,
            email: user.email,
            totalTokens: user.pushTokens.length,
        });

        res.json({
            success: true,
            message: 'Push token saved successfully',
        });
    } catch (error) {
        console.error('Error saving push token:', {
            userId: req.payload._id,
            error: error.message,
        });

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID',
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to save push token',
        });
    }
});

router.delete('/push-token', auth, async (req, res) => {
    try {
        const user = await User.findById(req.payload._id).select('-password');

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
            });
        }

        user.pushTokens = [];

        await user.save();

        return res.json({
            message: 'Push token removed',
        });
    } catch (error) {
        console.error('Remove push token error:', error);

        return res.status(500).json({
            message: error.message,
        });
    }
});

// ----- רישום משתמש -----

// Register new user
router.post('/', async (req, res) => {
    try {
        // validate the body
        const { error } = userSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: false,
        });
        if (error) {
            return res.status(400).json({
                code: 'VALIDATION_ERROR',
                message: error.details.map((d) => d.message).join(', '),
            });
        }

        // check if user exists
        let user = await User.findOne({ email: req.body.email }).select(
            '-password',
        );
        if (user)
            return res.status(409).json({
                code: 'EMAIL_EXISTS',
                message: 'Email already exists',
            });

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

        const io = req.app.get('io');
        io.emit('user:registered', {
            userId: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });

        // creatre token
        const token = generateToken(user);

        // return the token
        res.status(200).send(token);
    } catch (error) {
        res.status(500).send(error);
    }
});

// ----- התחברות -----

router.post('/login', async (req, res) => {
    try {
        const { error } = loginSchema.validate(req.body);

        if (error) {
            return res.status(400).send(error.details[0].message);
        }

        const user = await User.findOne({
            email: req.body.email,
        });

        if (!user) {
            return res.status(400).send('invalid email or password');
        }

        if (
            user.accountStatus === 'disabled' ||
            user.permissions?.canLogin === false
        ) {
            return res.status(403).json({
                code: 'LOGIN_DISABLED',
                message: 'Login is disabled for this account',
            });
        }

        if (!user.password) {
            return res.status(400).send('This account has no password');
        }

        const isValid = compareSync(req.body.password, user.password);

        if (!isValid) {
            return res.status(400).send('invalid email or password');
        }

        // حماية activity
        if (!Array.isArray(user.activity)) {
            user.activity = [];
        }

        user.activity.push(new Date().toLocaleString());

        user.status = true;

        await user.save();

        // حماية io
        const io = req.app.get('io');

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

        const token = generateToken(user);

        res.status(200).send(token);
    } catch (error) {
        console.error('LOGIN ERROR:');
        console.error(error);

        res.status(500).send(error.message);
    }
});

// ----- Google OAuth -----

// check if google user exists returns true - false
router.get('/google/verify/:id', async (req, res) => {
    const user = await User.findOne({ googleId: req.params.id });
    if (user) return res.send({ exists: true });
    res.send({ exists: false });
});

function generateSlug(first, last) {
    return `${first.toLowerCase()}-${last.toLowerCase()}-${Date.now()}`;
}

// register or login the new google user into database or login
router.post('/google', async (req, res) => {
    try {
        const io = req.app.get('io');

        const { credentialToken } = req.body;
        if (!credentialToken) return res.status(400).send('Missing token');

        const payload = await verifyGoogleToken(credentialToken);

        if (!payload || !payload.sub || !payload.email) {
            return res.status(400).json({
                code: 'INVALID_GOOGLE_PAYLOAD',
                message: 'Invalid Google payload',
            });
        }

        if (payload.email_verified !== true) {
            return res.status(401).json({
                code: 'EMAIL_NOT_VERIFIED',
                message: 'Google email is not verified',
            });
        }
        // check if user exists

        let user = await User.findOne({ email: payload.email });

        if (user) {
            if (
                user.accountStatus === 'disabled' ||
                user.permissions?.canLogin === false
            ) {
                return res.status(403).json({
                    code: 'LOGIN_DISABLED',
                    message: 'Login is disabled for this account',
                });
            }

            user.activity.push(new Date().toLocaleString('he-IL'));
            user.status = true;

            await user.save();

            const token = generateToken(user);

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

            return res.status(200).send(token);
        }

        // if user not exist create a new one from payload and save the new user
        user = new User({
            name: {
                first: payload.given_name || 'Google',
                last: payload.family_name || 'User',
            },
            phone: {
                phone_1: req.body.phone.phone_1 || '',
                phone_2: req.body.phone.phone_2 || '',
            },
            address: {
                city: req.body.address.city || '',
                street: req.body.address.street || '',
                houseNumber: req.body.address.houseNumber || '',
            },
            email: payload.email,
            password: hashSync(payload.sub, 10),
            image: {
                url: payload.picture,
                alt: `${payload.given_name} ${payload.family_name}`,
            },
            role: 'Client',
            activity: [new Date().toLocaleString('he-IL')],
            registeredAt: new Date().toLocaleString('he-IL'),
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
            slug: generateSlug(payload.given_name, payload.family_name),
        });

        await user.save();

        io.emit('user:registered', {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            slug: user.slug,
        });

        const token = generateToken(user);

        res.status(201).send(token);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: error.message,
            // error:"Internal server error"
        });
    }
});

// ----- משתמשים -----

// get all users (Admin / moderators)
router.get('/', auth, requirePermission('canUseAccount'), async (req, res) => {
    try {
        if (
            req.payload.role !== roleType.Admin &&
            req.payload.role !== roleType.Moderator
        ) {
            return res.status(403).json({
                success: false,
                code: 'USERS_MANAGEMENT_ACCESS_DENIED',
                message: 'Only admins and moderators can access users',
            });
        }

        const users = await User.find().select('-password').lean();

        if (!users.length) {
            return res.status(404).json({
                success: false,
                message: 'No users found yet',
            });
        }

        return res.status(200).json(users);
    } catch (error) {
        console.error('Get users error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});

// Get single user (Admin or Moderator or oner user only)
router.get(
    '/:userId',
    auth,
    requirePermission('canUseAccount'),
    async (req, res) => {
        try {
            const { role, _id } = req.payload;
            const { userId } = req.params;

            //	check if user have permission to get the user by id
            if (
                _id !== userId &&
                role !== roleType.Admin &&
                role !== roleType.Moderator
            )
                return res.status(401).send({
                    error: 'You do not have permission to access this resource',
                });

            const user = await User.findById(userId).select('-password');
            if (!user)
                return res.status(404).send({ message: 'user Not Found' });

            res.status(200).send(user);
        } catch (error) {
            res.status(500).send('Internal server error');
        }
    },
);

router.get('/customer/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        console.log('SLUG PARAM:', slug);

        const user = await User.findOne({ slug }).select('-password');
        if (!user) return res.status(404).send({ message: 'user Not Found' });

        res.status(200).send(user);
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.get('/customer/:slug/posts', async (req, res) => {
    try {
        const { slug } = req.params;

        console.log('🔎 CUSTOMER POSTS SLUG:', slug);

        const user = await User.findOne({ slug }).select('_id');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        console.log('👤 USER ID:', user._id);

        const posts = await Posts.find({
            seller: user._id,
        }).sort({ createdAt: -1 });

        console.log('📦 POSTS FOUND:', posts.length);

        return res.status(200).json({
            success: true,
            count: posts.length,
            posts,
        });
    } catch (error) {
        console.error('❌ CUSTOMER POSTS ERROR:', error);

        return res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Internal server error',
        });
    }
});

// Update user role (Admin only)
router.patch(
    '/role/:userEmail',
    auth,
    requirePermission('canUseAccount'),
    async (req, res) => {
        try {
            // Check permission
            if (req.payload.role !== roleType.Admin)
                return res
                    .status(401)
                    .send({ error: 'Access denied. Admins only' });

            const user = await User.findOneAndUpdate(
                { email: req.params.userEmail },
                { role: req.body.role },
                { new: true },
            );

            // Check if user exists
            if (!user) {
                return res.status(404).send({ message: 'User not found' });
            }

            res.status(200).send(user);
        } catch (error) {
            res.status(500).send(error.message);
        }
    },
);

// compleate user data
router.patch(
    '/compleate/:userId',
    auth,
    requirePermission('canUseAccount'),
    async (req, res) => {
        try {
            // validate body
            const { error } = completeUserSchema.validate(req.body);
            if (error) return res.status(400).send(error.details[0].message);

            const isAdmin = req.payload.role === roleType.Admin;
            const isSelf = req.params.userId === req.payload._id;

            // Check permission
            if (!isAdmin && !isSelf) return res.status(401).send('Forbidden');

            const updateData = {
                phone: {
                    phone_1: req.body.phone.phone_1,
                    phone_2: req.body.phone.phone_2,
                },
                image: {
                    url: req.body.image.url,
                },

                address: {
                    city: req.body.address.city,
                    street: req.body.address.street,
                    houseNumber: req.body.address.houseNumber,
                },
                gender: req.body.gender,
            };
            const user = await User.findByIdAndUpdate(
                req.params.userId,
                updateData,
                {
                    new: true,
                },
            )
                .select('-password,-_v')
                .lean();

            // Check if user exists
            if (!user) {
                return res.status(404).send('User not found');
            }

            res.status(200).send(user);
        } catch (error) {
            res.status(500).send(error.message);
        }
    },
);

// Edit user profile
router.patch(
    '/edit-user/:userId',
    auth,
    requirePermission('canUseAccount'),
    async (req, res) => {
        try {
            // Check if IDs match
            const isSelf = req.params.userId === req.payload._id.toString();
            const isAdmin = req.payload.role === roleType.Admin;

            // validate body
            const { error } = editUserProfileSchema.validate(req.body);
            if (error) return res.status(400).send(error.details[0].message);

            // Check permission
            if (!isAdmin && !isSelf) {
                return res.status(403).send('Forbidden');
            }

            // Check if user exists
            const userExists = await User.findById(req.params.userId);

            if (!userExists) {
                return res.status(404).send('User not found');
            }

            const updateData = {
                name: {
                    first: req.body.name.first,
                    last: req.body.name.last,
                },
                phone: {
                    phone_1: req.body.phone.phone_1,
                    phone_2: req.body.phone.phone_2,
                },
                image: {
                    url: req.body.image.url,
                    alt: req.body.image.alt,
                },
                address: {
                    city: req.body.address.city,
                    street: req.body.address.street,
                    houseNumber: req.body.address.houseNumber,
                },
                gender: req.body.gender || '',
            };

            const user = await User.findByIdAndUpdate(
                req.params.userId,
                updateData,
                {
                    new: true,
                },
            )
                .select('-password -__v')
                .lean();

            // Check if user exists
            if (!user) {
                res.status(500).json({
                    message: error.message,
                    stack:
                        process.env.NODE_ENV === 'development'
                            ? error.stack
                            : undefined,
                });
            }

            res.status(200).send(user);
        } catch (error) {
            res.status(500).send(error.message);
        }
    },
);

// change password
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
                return res.status(400).send({
                    message: 'Password must contain at least 6 characters',
                });
            }

            const user = await User.findById(userId);
            if (!user)
                return res.status(404).send({ message: 'User not found' });

            if (!isAdmin && !isSelf) {
                return res
                    .status(403)
                    .send({ error: 'No permission to change password' });
            }

            user.password = hashSync(newPassword, 10);
            await user.save();

            res.status(200).send({ success: 'Password updated successfully' });
        } catch (err) {
            res.status(500).send({ error: 'Internal server error' });
        }
    },
);

// Delete full account
router.delete(
    '/:userId',
    auth,
    requirePermission('canUseAccount'),
    async (req, res) => {
        try {
            const isAdmin = req.payload.role === roleType.Admin;
            const isSelf = req.payload._id === req.params.userId;

            if (!isAdmin && !isSelf) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized, Cannot make this change',
                });
            }

            const userId = req.params.userId;

            // ==========================================
            // 1. التأكد أن المستخدم موجود
            // ==========================================

            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
            }

            // ==========================================
            // 2. حذف جميع الرسائل
            // ==========================================

            const deletedMessages = await Message.deleteMany({
                $or: [{ from: userId }, { to: userId }],
            });

            // ==========================================
            // 3. حذف جميع Posts الخاصة بالمستخدم
            // ==========================================

            const deletedPosts = await Posts.deleteMany({
                seller: userId,
            });

            // ==========================================
            // 4. حذف الحساب
            // ==========================================

            await User.findByIdAndDelete(userId);

            // ==========================================
            // 5. Response
            // ==========================================

            return res.status(200).json({
                success: true,
                message:
                    'User account, messages and posts deleted successfully',

                deletedMessages: deletedMessages.deletedCount,
                deletedPosts: deletedPosts.deletedCount,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    },
);

// update user status online | ofline
router.patch(
    '/status/:userId',
    auth,
    requirePermission('canUseAccount'),
    async (req, res) => {
        try {
            const io = req.app.get('io');

            const updatedUser = await User.findByIdAndUpdate(
                req.params.userId,
                { status: req.body.status },
                { new: true },
            );
            console.log(
                chalk.red(
                    `user-${updatedUser.name.first} to-${updatedUser.status}`,
                ),
            );

            if (!updatedUser) {
                return res.status(404).send('User not found');
            }

            io.emit('user:statusChanged', {
                userId: updatedUser._id,
                status: updatedUser.status,
            });

            res.status(200).send(updatedUser);
        } catch (error) {
            console.error('Status update error:', error);
            res.status(500).send('Internal server error');
        }
    },
);

router.get('/check-slug/:slug', async (req, res) => {
    try {
        const { slug } = req.params;

        // التحقق من الصيغة
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

        // التحقق من وجود slug في قاعدة البيانات
        const existingUser = await User.findOne({ slug });

        return res.status(200).json({
            available: !existingUser,
            message: existingUser ? 'اسم المستخدم محجوز' : 'اسم المستخدم متاح',
        });
    } catch (error) {
        console.error('Error checking slug:', error);
        res.status(500).json({
            available: false,
            message: 'حدث خطأ أثناء التحقق من اسم المستخدم',
        });
    }
});

router.patch('/account-status/:userId', auth, async (req, res) => {
    try {
        if (req.payload.role !== roleType.Admin) {
            return res.status(403).json({
                success: false,
                code: 'ADMIN_ONLY',
                message: 'Admins only',
            });
        }

        const { userId } = req.params;
        const { accountStatus } = req.body;

        if (!['active', 'disabled'].includes(accountStatus)) {
            return res.status(400).json({
                success: false,
                code: 'INVALID_ACCOUNT_STATUS',
                message: 'Invalid account status',
            });
        }

        /*
         * لا تسمح للـ Admin بتعطيل نفسه
         */
        if (userId === req.payload._id.toString()) {
            return res.status(400).json({
                success: false,
                code: 'CANNOT_DISABLE_SELF',
                message: 'You cannot disable your own account',
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    accountStatus,
                },
            },
            {
                new: true,
                runValidators: true,
            },
        )
            .select('-password')
            .lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                code: 'USER_NOT_FOUND',
                message: 'User not found',
            });
        }

        const io = req.app.get('io');

        io.emit('user:accountStatusChanged', {
            userId: user._id.toString(),
            accountStatus: user.accountStatus,
        });

        /*
         * إذا تم تعطيل الحساب:
         * نقطع حالة Online أيضًا.
         */
        if (accountStatus === 'disabled') {
            await User.findByIdAndUpdate(userId, {
                $set: {
                    status: false,
                },
            });

            io.emit('user:statusChanged', {
                userId: user._id.toString(),
                status: false,
            });
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

        return res.status(500).json({
            success: false,
            code: 'ACCOUNT_STATUS_UPDATE_ERROR',
            message: 'Internal server error',
        });
    }
});

// router.patch('/permissions/:userId', auth, async (req, res) => {
//     try {
//         if (req.payload.role !== roleType.Admin) {
//             return res.status(403).json({
//                 success: false,
//                 code: 'ADMIN_ONLY',
//                 message: 'Admins only',
//             });
//         }

//         const { userId } = req.params;

//         if (userId === req.payload._id.toString()) {
//             return res.status(400).json({
//                 success: false,
//                 code: 'CANNOT_CHANGE_SELF_PERMISSIONS',
//                 message: 'You cannot change your own permissions',
//             });
//         }

//         const allowedPermissions = [
//             'canLogin',
//             'canCreatePosts',
//             'canSendMessages',
//             'canSendOffers',
//             'canUseAccount',
//             'canAccessExistingData',
//         ];

//         const updates = {};

//         for (const permission of allowedPermissions) {
//             if (typeof req.body[permission] === 'boolean') {
//                 updates[`permissions.${permission}`] = req.body[permission];
//             }
//         }

//         if (Object.keys(updates).length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 code: 'NO_VALID_PERMISSIONS',
//                 message: 'No valid permissions provided',
//             });
//         }

//         const user = await User.findByIdAndUpdate(
//             userId,
//             {
//                 $set: updates,
//             },
//             {
//                 new: true,
//                 runValidators: true,
//             },
//         )
//             .select('-password')
//             .lean();

//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 code: 'USER_NOT_FOUND',
//                 message: 'User not found',
//             });
//         }

//         const io = req.app.get('io');

//         io.emit('user:permissionsChanged', {
//             userId: user._id.toString(),
//             permissions: user.permissions,
//         });

//         return res.status(200).json({
//             success: true,
//             message: 'Permissions updated successfully',
//             user,
//         });
//     } catch (error) {
//         console.error('Permission update error:', error);

//         return res.status(500).json({
//             success: false,
//             code: 'PERMISSION_UPDATE_ERROR',
//             message: 'Internal server error',
//         });
//     }
// });

// router.patch('/permissions/:userId', auth, updateUserPermission);

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

module.exports = router;
