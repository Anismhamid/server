const express = require('express');

const router = express.Router();

const auth = require('../middlewares/auth');
const {
    requireRole,
} = require('../middlewares/userPermissions');

const Users = require('../models/User');
const Notification = require('../models/notification.model');

const {
    notifyUser,
} = require('../services/notify');

// ============================================================
// HELPERS
// ============================================================

const normalizeIds = (value) => {
    if (!Array.isArray(value)) {
        return [];
    }

    return [
        ...new Set(
            value
                .map((id) => String(id).trim())
                .filter(Boolean),
        ),
    ];
};

const buildData = (data) => {
    if (!data || typeof data !== 'object') {
        return {};
    }

    return data;
};

// ============================================================
// SEND ADMIN NOTIFICATION
//
// POST /api/admin/notifications/send
//
// Body:
//
// {
//     "target": "user",
//     "userIds": ["..."],
//     "title": "عنوان",
//     "body": "النص",
//     "data": {
//         "screen": "/jobs"
//     }
// }
//
// target:
// user
// users
// role
// all
//
// role:
// Client
// Admin
// Moderator
// delivery
// ============================================================

router.post(
    '/send',
    auth,
    requireRole('Admin', 'Moderator'),
    async (req, res) => {
        try {
            const {
                target = 'user',
                userId,
                userIds,
                role,
                title,
                body = '',
                data = {},
            } = req.body || {};

            // --------------------------------------------------------
            // VALIDATE CONTENT
            // --------------------------------------------------------

            const cleanTitle =
                String(title || '').trim();

            const cleanBody =
                String(body || '').trim();

            if (!cleanTitle) {
                return res.status(400).json({
                    success: false,
                    message:
                        'Notification title is required',
                });
            }

            if (cleanTitle.length > 200) {
                return res.status(400).json({
                    success: false,
                    message:
                        'Notification title cannot exceed 200 characters',
                });
            }

            if (cleanBody.length > 2000) {
                return res.status(400).json({
                    success: false,
                    message:
                        'Notification body cannot exceed 2000 characters',
                });
            }

            // --------------------------------------------------------
            // TARGET USERS
            // --------------------------------------------------------

            let usersQuery = {};

            switch (target) {
                // ====================================================
                // SINGLE USER
                // ====================================================

                case 'user': {
                    const id =
                        userId ||
                        userIds?.[0];

                    if (!id) {
                        return res.status(400).json({
                            success: false,
                            message:
                                'userId is required',
                        });
                    }

                    usersQuery = {
                        _id: id,

                        accountStatus: {
                            $ne: 'disabled',
                        },
                    };

                    break;
                }

                // ====================================================
                // MULTIPLE USERS
                // ====================================================

                case 'users': {
                    const ids =
                        normalizeIds(userIds);

                    if (!ids.length) {
                        return res.status(400).json({
                            success: false,
                            message:
                                'userIds must contain at least one user',
                        });
                    }

                    usersQuery = {
                        _id: {
                            $in: ids,
                        },

                        accountStatus: {
                            $ne: 'disabled',
                        },
                    };

                    break;
                }

                // ====================================================
                // ROLE
                // ====================================================

                case 'role': {
                    const allowedRoles = [
                        'Admin',
                        'Moderator',
                        'Client',
                        'delivery',
                    ];

                    if (
                        !allowedRoles.includes(
                            role,
                        )
                    ) {
                        return res.status(400).json({
                            success: false,
                            message:
                                'Invalid role',
                        });
                    }

                    usersQuery = {
                        role,

                        accountStatus: {
                            $ne: 'disabled',
                        },
                    };

                    break;
                }

                // ====================================================
                // ALL USERS
                // ====================================================

                case 'all': {
                    usersQuery = {
                        accountStatus: {
                            $ne: 'disabled',
                        },
                    };

                    break;
                }

                default:
                    return res.status(400).json({
                        success: false,
                        message:
                            'Invalid notification target',
                    });
            }

            // --------------------------------------------------------
            // IO
            // --------------------------------------------------------

            const io = req.app.get('io');

            // --------------------------------------------------------
            // SEND
            //
            // Cursor/batch style instead of loading every user
            // into memory.
            // --------------------------------------------------------

            const cursor =
                Users.find(usersQuery)
                    .select('_id')
                    .lean()
                    .cursor();

            let totalFound = 0;
            let sentCount = 0;
            let failedCount = 0;

            const BATCH_SIZE = 50;

            let batch = [];

            const processBatch =
                async (users) => {
                    if (!users.length) {
                        return;
                    }

                    const results =
                        await Promise.allSettled(
                            users.map((user) =>
                                notifyUser(
                                    io,
                                    user._id,
                                    {
                                        type: 'admin',

                                        title: cleanTitle,

                                        body: cleanBody,

                                        data: buildData(
                                            data,
                                        ),

                                        sentBy:
                                            req.payload
                                                ._id,
                                    },
                                ),
                            ),
                        );

                    for (const result of results) {
                        if (
                            result.status ===
                            'fulfilled'
                        ) {
                            if (result.value) {
                                sentCount++;
                            } else {
                                failedCount++;
                            }
                        } else {
                            failedCount++;
                        }
                    }
                };

            for await (const user of cursor) {
                totalFound++;

                batch.push(user);

                if (
                    batch.length >=
                    BATCH_SIZE
                ) {
                    await processBatch(
                        batch,
                    );

                    batch = [];
                }
            }

            if (batch.length) {
                await processBatch(
                    batch,
                );
            }

            // --------------------------------------------------------
            // RESPONSE
            // --------------------------------------------------------

            return res.status(200).json({
                success: true,

                message:
                    'Notification sent successfully',

                target,

                totalFound,

                sentCount,

                failedCount,
            });
        } catch (error) {
            console.error(
                '[admin-notifications] send failed:',
                error,
            );

            return res.status(500).json({
                success: false,
                message:
                    'Failed to send notification',
            });
        }
    },
);

// ============================================================
// SENT NOTIFICATIONS
//
// GET /api/admin/notifications/sent?page=1&limit=20
//
// Returns notifications generated by the logged-in admin.
// ============================================================

router.get(
    '/sent',
    auth,
    requireRole('Admin', 'Moderator'),
    async (req, res) => {
        try {
            const page = Math.max(
                Number.parseInt(
                    req.query.page,
                    10,
                ) || 1,
                1,
            );

            const limit = Math.min(
                Math.max(
                    Number.parseInt(
                        req.query.limit,
                        10,
                    ) || 20,
                    1,
                ),
                100,
            );

            const skip =
                (page - 1) * limit;

            const filter = {
                sentBy: req.payload._id,

                type: 'admin',
            };

            const [
                notifications,
                total,
            ] = await Promise.all([
                Notification.find(filter)
                    .populate({
                        path: 'user',
                        select:
                            '_id name email username slug',
                    })
                    .sort({
                        createdAt: -1,
                    })
                    .skip(skip)
                    .limit(limit)
                    .lean(),

                Notification.countDocuments(
                    filter,
                ),
            ]);

            return res.status(200).json({
                success: true,

                notifications,

                total,

                page,

                pages: Math.ceil(
                    total / limit,
                ),
            });
        } catch (error) {
            console.error(
                '[admin-notifications] sent failed:',
                error,
            );

            return res.status(500).json({
                success: false,
                message:
                    'Failed to fetch sent notifications',
            });
        }
    },
);

module.exports = router;