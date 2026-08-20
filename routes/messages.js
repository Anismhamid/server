const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Users = require('../models/User');
const Message = require('../models/Message');
const { body, validationResult } = require('express-validator');
const firebase = require('../config/firebase');
const { requirePermission } = require('../middlewares/userPermissions');
// Permissions
const messagePermissions = {
    Client: ['Client', 'Admin', 'Moderator'],
    Moderator: ['Client', 'Admin', 'Moderator'],
    Admin: ['Client', 'Moderator', 'Admin'],
};

function canSendMessage(fromRole, toRole) {
    return messagePermissions[fromRole]?.includes(toRole) || false;
}

// ====== Send Message ======
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
            .isLength({ min: 1, max: 1000 })
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

            // ==========================================
            // 1. منع إرسال رسالة للنفس
            // ==========================================

            if (fromUserId.toString() === toUserId.toString()) {
                return res.status(400).json({
                    success: false,
                    code: 'CANNOT_MESSAGE_SELF',
                    message: 'Cannot message yourself',
                });
            }

            // ==========================================
            // 2. جلب المرسل من DB
            // ==========================================

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

            // ==========================================
            // 3. التحقق من حالة حساب المرسل
            // ==========================================

            if (fromUser.accountStatus === 'disabled') {
                return res.status(403).json({
                    success: false,
                    code: 'ACCOUNT_DISABLED',
                    message: 'Your account is disabled',
                });
            }

            // ==========================================
            // 4. التحقق من صلاحية استخدام الحساب
            // ==========================================

            if (fromUser.permissions?.canUseAccount === false) {
                return res.status(403).json({
                    success: false,
                    code: 'ACCOUNT_USAGE_DISABLED',
                    message: 'You cannot use your account',
                });
            }

            // ==========================================
            // 5. التحقق من صلاحية إرسال الرسائل
            // ==========================================

            if (fromUser.permissions?.canSendMessages === false) {
                return res.status(403).json({
                    success: false,
                    code: 'MESSAGES_DISABLED',
                    message: 'You cannot send messages',
                });
            }

            // ==========================================
            // 6. جلب المستلم
            // ==========================================

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

            // ==========================================
            // 7. التحقق من حالة حساب المستلم
            // ==========================================

            if (toUser.accountStatus === 'disabled') {
                return res.status(403).json({
                    success: false,
                    code: 'RECIPIENT_ACCOUNT_DISABLED',
                    message: 'Recipient account is disabled',
                });
            }

            // ==========================================
            // 8. هل المستلم يستطيع استخدام حسابه؟
            // ==========================================

            if (toUser.permissions?.canUseAccount === false) {
                return res.status(403).json({
                    success: false,
                    code: 'RECIPIENT_ACCOUNT_USAGE_DISABLED',
                    message: 'Recipient cannot use the account',
                });
            }

            // ==========================================
            // 9. هل المستلم يستطيع استقبال الرسائل؟
            // ==========================================

            if (toUser.permissions?.canSendMessages === false) {
                return res.status(403).json({
                    success: false,
                    code: 'RECIPIENT_MESSAGES_DISABLED',
                    message: 'Recipient cannot receive messages',
                });
            }

            // ==========================================
            // 10. التحقق من صلاحية التواصل بين الأدوار
            // ==========================================

            if (!canSendMessage(fromRole, toUser.role)) {
                return res.status(403).json({
                    success: false,
                    code: 'ROLE_MESSAGE_NOT_ALLOWED',
                    message: `Not allowed to send messages to ${toUser.role}`,
                });
            }

            // ==========================================
            // 11. Room ID
            // ==========================================

            const roomId = [fromUserId.toString(), toUserId.toString()]
                .sort()
                .join('_');

            // ==========================================
            // 12. إنشاء الرسالة
            // ==========================================

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

            // ==========================================
            // 13. Populate
            // ==========================================

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

            // ==========================================
            // 14. FCM Push Notification
            // ==========================================

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

                    // حذف التوكنات غير الصالحة

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
                                invalidTokens.push(
                                    toUser.pushTokens[index],
                                );
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
                    console.error(
                        'FCM send error:',
                        error.message,
                    );
                }
            }

            // ==========================================
            // 15. Socket.IO
            // ==========================================

            const io = req.app.get('io');
            const connectedUsers = req.app.get('connectedUsers');

            // Recipient sockets

            (
                connectedUsers.get(toUserId.toString()) || []
            ).forEach((socketId) => {
                io.to(socketId).emit(
                    'message:received',
                    populatedMessage,
                );
            });

            // Sender sockets

            (
                connectedUsers.get(fromUserId.toString()) || []
            ).forEach((socketId) => {
                io.to(socketId).emit(
                    'message:sent',
                    populatedMessage,
                );
            });

            // ==========================================
            // 16. Unread count
            // ==========================================

            const unreadCount = await Message.countDocuments({
                to: toUserId,
                status: { $ne: 'seen' },
            });

            (
                connectedUsers.get(toUserId.toString()) || []
            ).forEach((socketId) => {
                io.to(socketId).emit(
                    'message:unreadCount',
                    {
                        userId: fromUserId.toString(),
                        count: unreadCount,
                    },
                );
            });

            // ==========================================
            // 17. Response
            // ==========================================

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

// ====== Get Conversation ======
router.get(
    '/conversation/:otherUserId',
    auth,
    requirePermission('canUseAccount'),
    async (req, res) => {
        try {
            const userId = req.payload._id;
            const otherUserId = req.params.otherUserId;
            const limit = parseInt(req.query.limit) || 20;
            const skip = parseInt(req.query.skip) || 0;

            const roomId = [userId, otherUserId].sort().join('_');

            const messages = await Message.find({ roomId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('from', 'name image slug')
                .populate('to', 'name image slug')
                .lean();
            // .populate("replyTo", "message from to");

            const unreadCount = await Message.countDocuments({
                to: userId,
                status: { $ne: 'seen' },
            });

            const chronologicalMessages = messages.reverse();

            res.json({
                messages: chronologicalMessages,
                hasMore: messages.length === limit,
                unreadCount,
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Failed to get conversation');
        }
    },
);
// ====== Mark as Seen ======

router.patch(
    '/mark-as-seen/:fromUserId',
    auth,
    requirePermission('canUseAccount'),
    async (req, res) => {
        try {
            const toUserId = req.payload._id; // The person currently reading
            const fromUserId = req.params.fromUserId; // The person who sent the messages

            // Update only messages sent TO me from THIS user that aren't seen yet
            await Message.updateMany(
                { to: toUserId, from: fromUserId, status: { $ne: 'seen' } },
                { $set: { status: 'seen' } },
            );

            // Notify the sender via Socket
            const io = req.app.get('io');
            const connectedUsers = req.app.get('connectedUsers');

            const seenData = {
                from: toUserId, // من قرأ الرسائل (المستخدم الحالي)
                to: fromUserId, // إلى من تم إرسال الرسائل (المستخدم الآخر)
            };

            (connectedUsers.get(fromUserId) || []).forEach((id) =>
                io.to(id).emit('message:seen', { from: seenData }),
            );

            (connectedUsers.get(toUserId) || []).forEach((id) =>
                io.to(id).emit('message:seen', seenData),
            );

            res.sendStatus(200);
        } catch (err) {
            res.status(500).send('Error updating status');
        }
    },
);

// ====== Get All Conversations ======
router.get(
    '/conversations',
    auth,
    requirePermission('canUseAccount'),
    async (req, res) => {
        try {
            if (!req.payload || !req.payload._id) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const userId = req.payload._id.toString();

            const messages = await Message.find({
                $or: [{ from: userId }, { to: userId }],
            })
                .sort({ createdAt: -1 })
                .populate('from', 'name email role image status slug')
                .populate('to', 'name email role image status slug');

            const conversationsMap = {};

            messages.forEach((msg) => {
                if (!msg.from || !msg.to) return;

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

            res.json({ conversations: Object.values(conversationsMap) });
        } catch (err) {
            console.error('Conversations error:', err);
            res.status(500).json({ message: err.message });
        }
    },
);

// ====== Delete one message from user woner ======
router.delete(
    '/:messageId',
    auth,
    requirePermission('canUseAccount'),
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

module.exports = router;
