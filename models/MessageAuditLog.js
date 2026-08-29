const mongoose = require('mongoose');

const messageAuditLogSchema = new mongoose.Schema(
    {
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
            required: true,
            index: true,
        },

        user1: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
            default: null,
            index: true,
        },

        user2: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
            default: null,
            index: true,
        },

        message: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
            default: null,
            index: true,
        },

        action: {
            type: String,
            enum: [
                'VIEW_MESSAGE',
                'VIEW_CONVERSATION',
            ],
            required: true,
            index: true,
        },

        reason: {
            type: String,
            required: true,
            trim: true,
            minlength: 5,
            maxlength: 1000,
        },

        ip: {
            type: String,
            default: null,
        },

        userAgent: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

// البحث في السجلات حسب التاريخ
messageAuditLogSchema.index({
    createdAt: -1,
});

// البحث عن Audit لمستخدمين معينين
messageAuditLogSchema.index({
    user1: 1,
    user2: 1,
    createdAt: -1,
});

const MessageAuditLog = mongoose.model(
    'MessageAuditLog',
    messageAuditLogSchema,
);

module.exports = MessageAuditLog;