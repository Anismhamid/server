// models/notification.model.js

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
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
                ref: 'Posts',
                default: null,
            },

            category: {
                type: String,
                default: '',
            },

            subcategory: {
                type: String,
                default: '',
            },

            brand: {
                type: String,
                default: '',
            },

            productName: {
                type: String,
                default: '',
            },

            rejectionReason: {
                type: String,
                default: '',
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

/**
 * البحث السريع عن إشعارات المستخدم
 */
notificationSchema.index({
    user: 1,
    readAt: 1,
    createdAt: -1,
});

/**
 * منع إنشاء نفس إشعار الإعلان مرتين
 *
 * نفس:
 * user + type + postId
 *
 * لا يمكن أن يتكرر.
 */
notificationSchema.index(
    {
        user: 1,
        type: 1,
        'data.postId': 1,
    },
    {
        unique: true,
        partialFilterExpression: {
            'data.postId': {
                $exists: true,
                $ne: null,
            },
        },
    },
);

module.exports =
    mongoose.models.Notification ||
    mongoose.model('Notification', notificationSchema);