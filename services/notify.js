// services/notify.js
// إشعار واحد بتلات قنوات: DB (يضل محفوظ) + Socket.IO (فوري) + FCM (لو التطبيق مسكّر).
// فشل أي قناة ما بيوقّف الباقي ولا بيكسر الـ request.
const Notification = require('../models/notification.model');

// ⚠️ عدّل هدول الاثنين حسب مشروعك:
const { getIO } = require('../socket'); // الدالة اللي بترجّع instance تبع Socket.IO
const { sendPushToUser } = require('./push'); // خدمة FCM الحالية (بتجيب توكنات المستخدم)

// اسم الـ room اللي بينضم له المستخدم عند الاتصال (عدّله إذا مختلف)
const userRoom = (userId) => `user:${userId}`;

/**
 * @param {string|ObjectId} userId
 * @param {{type: string, title: string, body?: string, postId?: string|ObjectId}} payload
 */
async function notifyUser(userId, { type, title, body = '', postId }) {
    const doc = await Notification.create({
        user: userId,
        type,
        title,
        body,
        data: { postId },
    });

    try {
        getIO().to(userRoom(userId)).emit('notification:new', doc);
    } catch (err) {
        console.error('[notify] socket emit failed:', err.message);
    }

    try {
        await sendPushToUser(userId, {
            title,
            body,
            data: {
                type,
                notificationId: String(doc._id),
                postId: postId ? String(postId) : '',
            },
        });
    } catch (err) {
        console.error('[notify] push failed:', err.message);
    }

    return doc;
}

module.exports = { notifyUser };