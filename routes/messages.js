const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const Users = require('../models/User');
const Message = require('../models/Message');
const MessageAuditLog = require('../models/MessageAuditLog');

const { body, validationResult } = require('express-validator');

const firebase = require('../config/firebase');

const { requirePermission ,requireRole} = require('../middlewares/userPermissions');

// ======================================================
// Message Permissions
// ======================================================

const messagePermissions = {
    Client: ['Client', 'Admin', 'Moderator'],

    Moderator: ['Client', 'Admin', 'Moderator'],

    Admin: ['Client', 'Moderator', 'Admin'],
};

function canSendMessage(fromRole, toRole) {
    return messagePermissions[fromRole]?.includes(toRole) || false;
}

// ======================================================
// Helpers
// ======================================================

function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];

    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    return req.socket?.remoteAddress || null;
}

function getRoomId(userA, userB) {
    return [userA.toString(), userB.toString()].sort().join('_');
}

// ======================================================
// Send Message
// ======================================================

router.post(
    '/',
    auth,
    requirePermission('canUseAccount'),
    requirePermission('canSendMessages'),

    [
        body('toUserId')
            .notEmpty()
            .isString()
            .withMessage('Recipient ID is required'),

        body('message')
            .notEmpty()
            .isString()
            .isLength({
                min: 1,
                max: 1000,
            })
            .withMessage('Message must be between 1-1000 characters'),

        body('warning').optional().isBoolean(),

        body('isImportant').optional().isBoolean(),

        body('replyTo').optional().isString(),
    ],

    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array(),
                });
            }

            const {
                toUserId,
                message,
                warning = false,
                isImportant = false,
                replyTo,
            } = req.body;

            const fromUserId = req.payload._id;
            const fromRole = req.payload.role;

            // ==================================================
            // 1. Cannot message yourself
            // ==================================================

            if (fromUserId.toString() === toUserId.toString()) {
                return res.status(400).json({
                    success: false,
                    code: 'CANNOT_MESSAGE_SELF',
                    message: 'Cannot message yourself',
                });
            }

            // ==================================================
            // 2. Get sender
            // ==================================================

            const fromUser = await Users.findById(fromUserId)
                .select(
                    'role accountStatus permissions pushTokens name email image status slug',
                )
                .lean();

            if (!fromUser) {
                return res.status(401).json({
                    success: false,
                    code: 'SENDER_NOT_FOUND',
                    message: 'Sender account not found',
                });
            }

            // ==================================================
            // 3. Sender account status
            // ==================================================

            if (fromUser.accountStatus === 'disabled') {
                return res.status(403).json({
                    success: false,
                    code: 'ACCOUNT_DISABLED',
                    message: 'Your account is disabled',
                });
            }

            // ==================================================
            // 4. Sender can use account
            // ==================================================

            if (fromUser.permissions?.canUseAccount === false) {
                return res.status(403).json({
                    success: false,
                    code: 'ACCOUNT_USAGE_DISABLED',
                    message: 'You cannot use your account',
                });
            }

            // ==================================================
            // 5. Sender can send messages
            // ==================================================

            if (fromUser.permissions?.canSendMessages === false) {
                return res.status(403).json({
                    success: false,
                    code: 'MESSAGES_DISABLED',
                    message: 'You cannot send messages',
                });
            }

            // ==================================================
            // 6. Get recipient
            // ==================================================

            const toUser = await Users.findById(toUserId)
                .select(
                    'role accountStatus permissions pushTokens name email image status slug',
                )
                .lean();

            if (!toUser) {
                return res.status(404).json({
                    success: false,
                    code: 'RECIPIENT_NOT_FOUND',
                    message: 'Recipient not found',
                });
            }

            // ==================================================
            // 7. Recipient account status
            // ==================================================

            if (toUser.accountStatus === 'disabled') {
                return res.status(403).json({
                    success: false,
                    code: 'RECIPIENT_ACCOUNT_DISABLED',
                    message: 'Recipient account is disabled',
                });
            }

            // ==================================================
            // 8. Recipient can use account
            // ==================================================

            if (toUser.permissions?.canUseAccount === false) {
                return res.status(403).json({
                    success: false,
                    code: 'RECIPIENT_ACCOUNT_USAGE_DISABLED',
                    message: 'Recipient cannot use the account',
                });
            }

            // ==================================================
            // 9. Recipient can receive messages
            // ==================================================

            if (toUser.permissions?.canSendMessages === false) {
                return res.status(403).json({
                    success: false,
                    code: 'RECIPIENT_MESSAGES_DISABLED',
                    message: 'Recipient cannot receive messages',
                });
            }

            // ==================================================
            // 10. Role permission
            // ==================================================

            if (!canSendMessage(fromRole, toUser.role)) {
                return res.status(403).json({
                    success: false,
                    code: 'ROLE_MESSAGE_NOT_ALLOWED',
                    message: `Not allowed to send messages to ${toUser.role}`,
                });
            }

            // ==================================================
            // 11. Room ID
            // ==================================================

            const roomId = getRoomId(fromUserId, toUserId);

            // ==================================================
            // 12. Create message
            // ==================================================

            const newMessage = new Message({
                from: fromUserId,

                to: toUserId,

                message,

                warning,

                isImportant,

                replyTo: replyTo || null,

                roomId,

                status: 'delivered',
            });

            await newMessage.save();

            // ==================================================
            // 13. Populate message
            // ==================================================

            const populatedMessage = await Message.findById(newMessage._id)
                .populate(
                    'from',
                    'name email role image status slug accountStatus',
                )
                .populate(
                    'to',
                    'name email role image status slug accountStatus',
                )
                .populate('replyTo', 'message from to');

            // ==================================================
            // 14. Firebase Push Notification
            // ==================================================

            if (toUser.pushTokens?.length > 0) {
                try {
                    const response =
                        await firebase.messaging.sendEachForMulticast({
                            tokens: toUser.pushTokens,

                            notification: {
                                title: `رسالة من ${fromUser.name.first}`,
                                body: message,
                            },

                            data: {
                                type: 'chat',
                                messageId: String(newMessage._id),
                                senderId: String(fromUserId),
                            },

                            android: {
                                priority: 'high',

                                notification: {
                                    channelId: 'chat',
                                    sound: 'notification',
                                },
                            },
                        });

                    console.log(
                        'FCM sent:',
                        response.successCount,
                        '/',
                        toUser.pushTokens.length,
                    );

                    // ==========================================
                    // Remove invalid tokens
                    // ==========================================

                    const invalidTokens = [];

                    response.responses.forEach((result, index) => {
                        if (!result.success) {
                            const errorCode = result.error?.code;

                            if (
                                errorCode ===
                                    'messaging/registration-token-not-registered' ||
                                errorCode ===
                                    'messaging/invalid-registration-token'
                            ) {
                                invalidTokens.push(toUser.pushTokens[index]);
                            }
                        }
                    });

                    if (invalidTokens.length > 0) {
                        await Users.findByIdAndUpdate(toUserId, {
                            $pull: {
                                pushTokens: {
                                    $in: invalidTokens,
                                },
                            },
                        });

                        console.log(
                            'Removed invalid tokens:',
                            invalidTokens.length,
                        );
                    }
                } catch (error) {
                    console.error('FCM send error:', error.message);
                }
            }

            // ==================================================
            // 15. Socket.IO
            // ==================================================

            const io = req.app.get('io');

            const connectedUsers = req.app.get('connectedUsers');

            // ==================================================
            // Recipient sockets
            // ==================================================

            (connectedUsers.get(toUserId.toString()) || []).forEach(
                (socketId) => {
                    io.to(socketId).emit('message:received', populatedMessage);
                },
            );

            // ==================================================
            // Sender sockets
            // ==================================================

            (connectedUsers.get(fromUserId.toString()) || []).forEach(
                (socketId) => {
                    io.to(socketId).emit('message:sent', populatedMessage);
                },
            );

            // ==================================================
            // 16. Unread count
            // ==================================================

            const unreadCount = await Message.countDocuments({
                to: toUserId,
                status: {
                    $ne: 'seen',
                },
            });

            (connectedUsers.get(toUserId.toString()) || []).forEach(
                (socketId) => {
                    io.to(socketId).emit('message:unreadCount', {
                        userId: fromUserId.toString(),

                        count: unreadCount,
                    });
                },
            );

            // ==================================================
            // 17. Response
            // ==================================================

            return res.status(201).json({
                success: true,
                message: populatedMessage,
            });
        } catch (err) {
            console.error('Send message error:', err);

            return res.status(500).json({
                success: false,
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to send message',
            });
        }
    },
);

// ======================================================
// Get Conversation
// ======================================================

router.get(
    '/conversation/:otherUserId',
    auth,
    requirePermission('canUseAccount'),
    requirePermission('canSendMessages'),

    async (req, res) => {
        try {
            const userId = req.payload._id;

            const otherUserId = req.params.otherUserId;

            const limit = parseInt(req.query.limit) || 20;

            const skip = parseInt(req.query.skip) || 0;

            const roomId = getRoomId(userId, otherUserId);

            const messages = await Message.find({
                roomId,
            })
                .sort({
                    createdAt: -1,
                })
                .skip(skip)
                .limit(limit)
                .populate('from', 'name image slug')
                .populate('to', 'name image slug')
                .lean();

            const unreadCount = await Message.countDocuments({
                to: userId,
                status: {
                    $ne: 'seen',
                },
            });

            const chronologicalMessages = messages.reverse();

            return res.json({
                messages: chronologicalMessages,

                hasMore: messages.length === limit,

                unreadCount,
            });
        } catch (err) {
            console.error('Get conversation error:', err);

            return res.status(500).json({
                success: false,
                message: 'Failed to get conversation',
            });
        }
    },
);

// ======================================================
// Mark Messages As Seen
// ======================================================

router.patch(
    '/mark-as-seen/:fromUserId',
    auth,
    requirePermission('canUseAccount'),
    requirePermission('canSendMessages'),

    async (req, res) => {
        try {
            const toUserId = req.payload._id;

            const fromUserId = req.params.fromUserId;

            await Message.updateMany(
                {
                    to: toUserId,

                    from: fromUserId,

                    status: {
                        $ne: 'seen',
                    },
                },
                {
                    $set: {
                        status: 'seen',
                    },
                },
            );

            const io = req.app.get('io');

            const connectedUsers = req.app.get('connectedUsers');

            const seenData = {
                from: toUserId,
                to: fromUserId,
            };

            // Notify sender
            (connectedUsers.get(fromUserId.toString()) || []).forEach((id) => {
                io.to(id).emit('message:seen', {
                    from: seenData,
                });
            });

            // Notify current user
            (connectedUsers.get(toUserId.toString()) || []).forEach((id) => {
                io.to(id).emit('message:seen', seenData);
            });

            return res.sendStatus(200);
        } catch (err) {
            console.error('Mark as seen error:', err);

            return res.status(500).json({
                success: false,
                message: 'Error updating status',
            });
        }
    },
);

// ======================================================
// Get All Conversations
// ======================================================

router.get(
    '/conversations',
    auth,
    requirePermission('canUseAccount'),
    requirePermission('canSendMessages'),

    async (req, res) => {
        try {
            if (!req.payload || !req.payload._id) {
                return res.status(401).json({
                    message: 'Unauthorized',
                });
            }

            const userId = req.payload._id.toString();

            const messages = await Message.find({
                $or: [
                    {
                        from: userId,
                    },
                    {
                        to: userId,
                    },
                ],
            })
                .sort({
                    createdAt: -1,
                })
                .populate('from', 'name email role image status slug')
                .populate('to', 'name email role image status slug');

            const conversationsMap = {};

            messages.forEach((msg) => {
                if (!msg.from || !msg.to) {
                    return;
                }

                const otherUser =
                    msg.from._id.toString() === userId ? msg.to : msg.from;

                const otherId = otherUser._id.toString();

                if (!conversationsMap[otherId]) {
                    conversationsMap[otherId] = {
                        user: otherUser,

                        lastMessage: msg,

                        unreadCount:
                            msg.to._id.toString() === userId &&
                            msg.status !== 'seen'
                                ? 1
                                : 0,
                    };
                } else {
                    if (
                        msg.createdAt >
                        conversationsMap[otherId].lastMessage.createdAt
                    ) {
                        conversationsMap[otherId].lastMessage = msg;
                    }

                    if (
                        msg.to._id.toString() === userId &&
                        msg.status !== 'seen'
                    ) {
                        conversationsMap[otherId].unreadCount += 1;
                    }
                }
            });

            return res.json({
                conversations: Object.values(conversationsMap),
            });
        } catch (err) {
            console.error('Conversations error:', err);

            return res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    },
);

// ======================================================
// ADMIN - VIEW ANY CONVERSATION
// ======================================================
//
// POST
// /api/messages/admin/conversation
//
// Body:
//
// {
//     "user1Id": "...",
//     "user2Id": "...",
//     "reason": "Investigation of reported fraud"
// }
//
// Requires:
// canUseAccount
// canViewMessages
//
// ======================================================

router.post(
    '/admin/conversation',
    auth,
    requirePermission('canUseAccount'),
    requirePermission('canViewMessages'),
    requireRole('Admin', 'Moderator'),
    [
        body('user1Id')
            .notEmpty()
            .isString()
            .withMessage('First user ID is required'),

        body('user2Id')
            .notEmpty()
            .isString()
            .withMessage('Second user ID is required'),

        body('reason')
            .trim()
            .notEmpty()
            .isString()
            .isLength({
                min: 5,
                max: 1000,
            })
            .withMessage('A valid reason is required'),
    ],

    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array(),
                });
            }

            const { user1Id, user2Id, reason } = req.body;

            const adminId = req.payload._id;

            // ==================================================
            // Cannot use same user
            // ==================================================

            if (user1Id.toString() === user2Id.toString()) {
                return res.status(400).json({
                    success: false,
                    code: 'SAME_USERS',
                    message: 'Users must be different',
                });
            }

            // ==================================================
            // Cannot investigate own conversation
            // ==================================================

            if (
                adminId.toString() === user1Id.toString() ||
                adminId.toString() === user2Id.toString()
            ) {
                return res.status(400).json({
                    success: false,
                    code: 'INVALID_INVESTIGATION',
                    message:
                        'You cannot use this endpoint for your own conversation',
                });
            }

            // ==================================================
            // Verify users
            // ==================================================

            const users = await Users.find({
                _id: {
                    $in: [user1Id, user2Id],
                },
            })
                .select('_id name email role image status slug accountStatus')
                .lean();

            if (users.length !== 2) {
                return res.status(404).json({
                    success: false,
                    code: 'USERS_NOT_FOUND',
                    message: 'One or more users were not found',
                });
            }

            // ==================================================
            // Room ID
            // ==================================================

            const roomId = getRoomId(user1Id, user2Id);

            // ==================================================
            // Get conversation
            // ==================================================

            const messages = await Message.find({
                roomId,
            })
                .sort({
                    createdAt: 1,
                })
                .populate(
                    'from',
                    'name email role image status slug accountStatus',
                )
                .populate(
                    'to',
                    'name email role image status slug accountStatus',
                )
                .populate('replyTo', 'message from to createdAt')
                .lean();

            // ==================================================
            // Audit Log
            // ==================================================

            await MessageAuditLog.create({
                admin: adminId,

                user1: user1Id,

                user2: user2Id,

                message: null,

                action: 'VIEW_CONVERSATION',

                reason,

                ip: getClientIp(req),

                userAgent: req.headers['user-agent'] || null,
            });

            // ==================================================
            // Response
            // ==================================================

            return res.status(200).json({
                success: true,

                roomId,

                users,

                messages,

                totalMessages: messages.length,
            });
        } catch (error) {
            console.error('Admin view any conversation error:', error);

            return res.status(500).json({
                success: false,
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to retrieve conversation',
            });
        }
    },
);

// ======================================================
// Delete Message
// ======================================================

router.delete(
    '/:messageId',
    auth,
    requirePermission('canUseAccount'),
    requirePermission('canSendMessages'),

    async (req, res) => {
        try {
            const { messageId } = req.params;

            const { _id: userId } = req.payload;

            const deletedMessage = await Message.findOneAndDelete({
                _id: messageId,
                from: userId,
            });

            if (!deletedMessage) {
                return res.status(404).json({
                    success: false,
                    message: 'Message not found or access denied',
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Message deleted successfully',
            });
        } catch (error) {
            console.error('Delete message error:', error);

            return res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    },
);

// ======================================================
// ADMIN - VIEW ONE MESSAGE
// ======================================================
//
// POST
// /api/messages/admin/view/:messageId
//
// Body:
// {
//     "reason": "User reported fraudulent activity"
// }
//
// Requires:
// canUseAccount
// canViewMessages
//
// ======================================================

router.post(
    '/admin/view/:messageId',
    auth,
    requirePermission('canUseAccount'),
    requirePermission('canViewMessages'),
    requireRole('Admin', 'Moderator'),

    [
        body('reason')
            .trim()
            .notEmpty()
            .isString()
            .isLength({
                min: 5,
                max: 1000,
            })
            .withMessage('A valid reason is required'),
    ],

    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array(),
                });
            }

            const { messageId } = req.params;

            const { reason } = req.body;

            // ==================================================
            // Get message
            // ==================================================

            const message = await Message.findById(messageId)
                .populate(
                    'from',
                    'name email role image status slug accountStatus',
                )
                .populate(
                    'to',
                    'name email role image status slug accountStatus',
                )
                .populate('replyTo', 'message from to createdAt')
                .lean();

            if (!message) {
                return res.status(404).json({
                    success: false,
                    code: 'MESSAGE_NOT_FOUND',
                    message: 'Message not found',
                });
            }

            // ==================================================
            // Audit Log
            // ==================================================

            await MessageAuditLog.create({
                admin: req.payload._id,

                user1: message.from?._id || message.from,

                user2: message.to?._id || message.to,

                message: message._id,

                action: 'VIEW_MESSAGE',

                reason,

                ip: getClientIp(req),

                userAgent: req.headers['user-agent'] || null,
            });

            // ==================================================
            // Return message
            // ==================================================

            return res.status(200).json({
                success: true,

                message,
            });
        } catch (error) {
            console.error('Admin view message error:', error);

            return res.status(500).json({
                success: false,
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to retrieve message',
            });
        }
    },
);

// ======================================================
// ADMIN - SEARCH USERS
// ======================================================

router.get(
    '/admin/users/search',
    auth,
    requirePermission('canUseAccount'),
    requirePermission('canViewMessages'),
    requireRole('Admin', 'Moderator'),

    async (req, res) => {
        try {
            const search = String(req.query.search || '').trim();

            if (search.length < 2) {
                return res.json({
                    success: true,
                    users: [],
                });
            }

            const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            const regex = new RegExp(escapedSearch, 'i');

            const users = await Users.find({
                $or: [
                    {
                        email: regex,
                    },
                    {
                        'name.first': regex,
                    },
                    {
                        'name.last': regex,
                    },
                    {
                        slug: regex,
                    },
                ],
            })
                .select('_id name email role image status slug accountStatus')
                .limit(20)
                .lean();

            return res.status(200).json({
                success: true,
                users,
            });
        } catch (error) {
            console.error('Admin user search error:', error);

            return res.status(500).json({
                success: false,
                code: 'USER_SEARCH_ERROR',
                message: 'Failed to search users',
            });
        }
    },
);

// ======================================================
// ADMIN - GET MESSAGE AUDIT LOGS
// ======================================================
//
// POST/GET depending on your admin UI.
// This route lets authorized admins see who accessed
// messages.
//
// ======================================================

router.get(
    '/admin/audit-logs',
    auth,
    requirePermission('canUseAccount'),
    requirePermission('canViewMessageAuditLogs'),
    requireRole('Admin'),

    async (req, res) => {
        try {
            const limit = Math.min(parseInt(req.query.limit) || 50, 100);

            const skip = parseInt(req.query.skip) || 0;

            const logs = await MessageAuditLog.find()
                .sort({
                    createdAt: -1,
                })
                .skip(skip)
                .limit(limit)
                .populate('admin', 'name email role image slug')
                .populate('message', 'from to roomId createdAt')
                .lean();

            return res.status(200).json({
                success: true,

                logs,

                hasMore: logs.length === limit,
            });
        } catch (error) {
            console.error('Audit logs error:', error);

            return res.status(500).json({
                success: false,
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to retrieve audit logs',
            });
        }
    },
);

module.exports = router;
