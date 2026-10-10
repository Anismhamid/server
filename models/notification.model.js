// models/notification.model.js

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        // =========================================================
        // RECIPIENT
        // =========================================================
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
            required: true,
            index: true,
        },

        // =========================================================
        // SENDER
        //
        // null = system notification
        // ObjectId = admin/moderator generated notification
        // =========================================================
        sentBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
            default: null,
            index: true,
        },

        // =========================================================
        // TYPE
        // =========================================================
        type: {
            type: String,

            enum: [
                'post_approved',
                'post_rejected',
                'post_pending_review',
                'saved_search_match',
                // Admin Center
                'admin',
            ],

            required: true,

            index: true,
        },

        // =========================================================
        // CONTENT
        // =========================================================
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },

        body: {
            type: String,
            default: '',
            trim: true,
            maxlength: 2000,
        },

        // =========================================================
        // EXTRA DATA
        //
        // Mixed allows future notification types:
        // postId, jobId, screen, action, etc.
        // =========================================================
        data: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },

        // =========================================================
        // READ STATUS
        // =========================================================
        readAt: {
            type: Date,
            default: null,
            index: true,
        },
    },

    {
        timestamps: true,
    },
);

// =============================================================
// USER NOTIFICATIONS
//
// Fast:
// GET /api/notifications
// GET /api/notifications/unread-count
// =============================================================
notificationSchema.index({
    user: 1,
    readAt: 1,
    createdAt: -1,
});

// =============================================================
// SENT NOTIFICATIONS
// =============================================================
notificationSchema.index({
    sentBy: 1,
    createdAt: -1,
});

// =============================================================
// PREVENT DUPLICATE POST NOTIFICATIONS
//
// Same:
// user + type + data.postId
//
// Only applies when postId exists.
// Admin notifications without postId are NOT affected.
// =============================================================
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
