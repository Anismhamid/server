// models/notification.model.js
// تخطّاه إذا عندك موديل إشعارات جاهز، بس تأكد إنه فيه type/title/body/data.postId/readAt.
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ['post_approved', 'post_rejected', 'post_pending_review'],
            required: true,
        },
        title: { type: String, required: true },
        body: { type: String, default: '' },
        data: {
            postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
        },
        readAt: { type: Date, default: null },
    },
    { timestamps: true },
);

notificationSchema.index({ user: 1, readAt: 1, createdAt: -1 });

module.exports =
    mongoose.models.Notification ||
    mongoose.model('Notification', notificationSchema);