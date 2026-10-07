const express = require('express');

const router = express.Router();

const auth = require('../middlewares/auth');

const Notification = require('../models/notification.model');

// ============================================================
// GET USER NOTIFICATIONS
// GET /api/notifications?page=1&limit=20
// ============================================================

router.get('/', auth, async (req, res) => {
    try {
        const userId = req.payload._id;

        const page = Math.max(
            Number.parseInt(req.query.page, 10) || 1,
            1,
        );

        const limit = Math.min(
            Math.max(
                Number.parseInt(req.query.limit, 10) || 20,
                1,
            ),
            100,
        );

        const skip = (page - 1) * limit;

        const [notifications, total, unreadCount] =
            await Promise.all([
                Notification.find({
                    user: userId,
                })
                    .sort({
                        createdAt: -1,
                    })
                    .skip(skip)
                    .limit(limit)
                    .lean(),

                Notification.countDocuments({
                    user: userId,
                }),

                Notification.countDocuments({
                    user: userId,
                    readAt: null,
                }),
            ]);

        return res.status(200).json({
            success: true,

            notifications,

            unreadCount,

            total,

            page,

            pages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error(
            '[notifications] GET failed:',
            error,
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications',
        });
    }
});

// ============================================================
// GET UNREAD COUNT
// GET /api/notifications/unread-count
// ============================================================

router.get(
    '/unread-count',
    auth,
    async (req, res) => {
        try {
            const unreadCount =
                await Notification.countDocuments({
                    user: req.payload._id,
                    readAt: null,
                });

            return res.status(200).json({
                success: true,
                unreadCount,
            });
        } catch (error) {
            console.error(
                '[notifications] unread-count failed:',
                error,
            );

            return res.status(500).json({
                success: false,
                message:
                    'Failed to fetch unread count',
            });
        }
    },
);

// ============================================================
// MARK ONE AS READ
// PATCH /api/notifications/:notificationId/read
// ============================================================

router.patch(
    '/:notificationId/read',
    auth,
    async (req, res) => {
        try {
            const {
                notificationId,
            } = req.params;

            const notification =
                await Notification.findOneAndUpdate(
                    {
                        _id: notificationId,

                        user: req.payload._id,

                        readAt: null,
                    },

                    {
                        $set: {
                            readAt: new Date(),
                        },
                    },

                    {
                        new: true,
                    },
                ).lean();

            if (!notification) {
                return res.status(404).json({
                    success: false,
                    message:
                        'Notification not found',
                });
            }

            return res.status(200).json({
                success: true,

                notification,
            });
        } catch (error) {
            console.error(
                '[notifications] mark read failed:',
                error,
            );

            return res.status(500).json({
                success: false,
                message:
                    'Failed to mark notification as read',
            });
        }
    },
);

// ============================================================
// MARK ALL AS READ
// PATCH /api/notifications/read-all
// ============================================================

router.patch(
    '/read-all',
    auth,
    async (req, res) => {
        try {
            const result =
                await Notification.updateMany(
                    {
                        user: req.payload._id,

                        readAt: null,
                    },

                    {
                        $set: {
                            readAt: new Date(),
                        },
                    },
                );

            return res.status(200).json({
                success: true,

                modifiedCount:
                    result.modifiedCount || 0,
            });
        } catch (error) {
            console.error(
                '[notifications] read-all failed:',
                error,
            );

            return res.status(500).json({
                success: false,
                message:
                    'Failed to mark notifications as read',
            });
        }
    },
);

module.exports = router;