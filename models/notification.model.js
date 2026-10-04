// models/notification.model.js

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
            enum: [
                'post_approved',
                'post_rejected',
                'post_pending_review',
            ],
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        body: {
            type: String,
            default: '',
            trim: true,
        },

        data: {
            postId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Post',
                default: null,
            },
        },

        readAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

// للاستعلام عن إشعارات المستخدم بسرعة
notificationSchema.index({
    user: 1,
    readAt: 1,
    createdAt: -1,
});

module.exports =
    mongoose.models.Notification ||
    mongoose.model('Notification', notificationSchema);