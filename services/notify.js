// services/notify.js

const Notification = require('../models/notification.model');

// -----------------------------------------------------------------------------
// FCM
// -----------------------------------------------------------------------------

let sendPushToUser = async () => {};

try {
    ({ sendPushToUser } = require('./push'));

    console.log('[notify] FCM push service loaded');
} catch (error) {
    console.warn(
        '[notify] ./push not found — push notifications disabled',
    );
}

// -----------------------------------------------------------------------------
// Socket.IO user room
// -----------------------------------------------------------------------------

const userRoom = (userId) => String(userId);

// -----------------------------------------------------------------------------
// notifyUser
//
// Sends notification through:
// 1. MongoDB
// 2. Socket.IO
// 3. FCM
//
// Failure of Socket or FCM does NOT break the HTTP request.
// -----------------------------------------------------------------------------

async function notifyUser(
    io,
    userId,
    {
        type,
        title,
        body = '',
        postId = null,
    },
) {
    if (!userId) {
        console.error('[notify] Cannot notify without userId');
        return null;
    }

    if (!type) {
        console.error('[notify] Cannot notify without type');
        return null;
    }

    if (!title) {
        console.error('[notify] Cannot notify without title');
        return null;
    }

    // -------------------------------------------------------------------------
    // 1. Save notification in MongoDB
    // -------------------------------------------------------------------------

    let notification;

    try {
        notification = await Notification.create({
            user: userId,
            type,
            title,
            body,
            data: {
                postId: postId || null,
            },
        });

        console.log(
            `[notify] DB notification created: ${notification._id}`,
        );
    } catch (error) {
        console.error(
            '[notify] DB notification failed:',
            error,
        );

        // إذا فشل DB لا نكمل لأن الإشعار الأساسي لم يُحفظ
        return null;
    }

    // -------------------------------------------------------------------------
    // 2. Socket.IO
    // -------------------------------------------------------------------------

    try {
        if (!io) {
            throw new Error(
                'io is undefined (req.app.get("io"))',
            );
        }

        const room = userRoom(userId);

        const sockets = await io.in(room).fetchSockets();

        console.log(
            `[notify] ${type} → user ${room} | sockets: ${sockets.length}`,
        );

        io.to(room).emit(
            'notification:new',
            notification.toObject(),
        );
    } catch (error) {
        console.error(
            '[notify] socket emit failed:',
            error.message,
        );
    }

    // -------------------------------------------------------------------------
    // 3. Firebase Cloud Messaging
    // -------------------------------------------------------------------------

    try {
        await sendPushToUser(userId, {
            title,
            body,

            data: {
                type,
                notificationId: String(notification._id),
                postId: postId
                    ? String(postId)
                    : '',
            },
        });

        console.log(
            `[notify] FCM sent → user ${userId}`,
        );
    } catch (error) {
        console.error(
            '[notify] push failed:',
            error.message,
        );
    }

    return notification;
}

module.exports = {
    notifyUser,
};