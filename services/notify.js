// services/notify.js
// إشعار واحد بتلات قنوات: DB (يضل محفوظ) + Socket.IO (فوري) + FCM (لو التطبيق مسكّر).
// فشل أي قناة ما بيوقّف الباقي ولا بيكسر الـ request.
const Notification = require('../models/notification.model');

// ⚠️ عدّل هاد حسب مشروعك: خدمة FCM الحالية (بتجيب توكنات المستخدم وبتبعت).
// بدون try/catch لو الملف مش موجود السيرفر بينهار عند التشغيل.
let sendPushToUser = async () => {};
try {
    ({ sendPushToUser } = require('./push'));
} catch {
    console.warn('[notify] ./push not found — push notifications disabled');
}

// السيرفر بيعمل socket.join(userId) عند الاتصال، فاسم الـ room = id المستخدم نفسه.
const userRoom = (userId) => String(userId);

/**
 * @param {import('socket.io').Server} io   من req.app.get('io')
 * @param {string|ObjectId} userId
 * @param {{type: string, title: string, body?: string, postId?: string|ObjectId}} payload
 */
async function notifyUser(io, userId, { type, title, body = '', postId }) {
    const doc = await Notification.create({
        user: userId,
        type,
        title,
        body,
        data: { postId },
    });

    try {
        if (!io) throw new Error('io is undefined (req.app.get("io"))');
        const room = userRoom(userId);
        // تشخيص: 0 = صاحب الإعلان مش متصل حاليًا (أو مسجّل دخول من حساب تاني)
        const sockets = await io.in(room).fetchSockets();
        console.log(`[notify] ${type} → user ${room} | sockets: ${sockets.length}`);
        io.to(room).emit('notification:new', doc);
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