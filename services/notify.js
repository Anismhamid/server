const Notification = require('../models/notification.model');

let sendPushToUser = async () => {};

try {
    ({ sendPushToUser } = require('./push'));

    console.log('[notify] FCM push service loaded');
} catch (error) {
    console.warn(
        '[notify] ./push not found — push notifications disabled',
    );
}

const userRoom = (userId) => String(userId);

async function notifyUser(
    io,
    userId,
    {
        type,
        title,
        body = '',
        postId = null,
        data = {},
        sentBy = null,
    },
) {
    // =========================================================
    // VALIDATION
    // =========================================================

    if (!userId) {
        console.error(
            '[notify] Cannot notify without userId',
        );

        return null;
    }

    if (!type) {
        console.error(
            '[notify] Cannot notify without type',
        );

        return null;
    }

    if (!title) {
        console.error(
            '[notify] Cannot notify without title',
        );

        return null;
    }

    // =========================================================
    // DATA
    // =========================================================

    const notificationData = {
        postId: postId
            ? String(postId)
            : null,

        ...data,
    };

    let notification;

    // =========================================================
    // CREATE DATABASE NOTIFICATION
    // =========================================================

    try {
        notification = await Notification.create({
            user: userId,

            sentBy: sentBy || null,

            type,

            title,

            body,

            data: notificationData,
        });

        console.log(
            `[notify] DB notification created: ${notification._id}`,
        );
    } catch (error) {
        // -----------------------------------------------------
        // MongoDB duplicate key
        // -----------------------------------------------------

        if (error?.code === 11000) {
            console.log(
                '[notify] Duplicate notification ignored:',
                {
                    userId: String(userId),

                    type,

                    postId: postId
                        ? String(postId)
                        : null,
                },
            );

            return null;
        }

        console.error(
            '[notify] DB notification failed:',
            error,
        );

        return null;
    }

    // =========================================================
    // SOCKET.IO
    // =========================================================

    try {
        if (!io) {
            throw new Error('io is undefined');
        }

        const room = userRoom(userId);

        const sockets = await io
            .in(room)
            .fetchSockets();

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

    // =========================================================
    // FCM
    // =========================================================

    try {
        const pushData = {
            type: String(type),

            notificationId: String(
                notification._id,
            ),

            postId: postId
                ? String(postId)
                : '',

            ...Object.fromEntries(
                Object.entries(data).map(
                    ([key, value]) => [
                        key,
                        value == null
                            ? ''
                            : String(value),
                    ],
                ),
            ),
        };

        await sendPushToUser(
            userId,
            {
                title,
                body,
                data: pushData,
            },
        );

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