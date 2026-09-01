const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['user', 'post', 'message', 'comment'],
            required: true,
            index: true,
        },

        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true,
        },

        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
            required: true,
            index: true,
        },

        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
            default: null,
        },

        reviewedAt: {
            type: Date,
            default: null,
        },

        reason: {
            type: String,
            enum: [
                'spam',
                'harassment',
                'inappropriate_content',
                'fake_account',
                'scam',
                'violence',
                'hate_speech',
                'nudity',
                'copyright',
                'other',
            ],
            required: true,
        },

        description: {
            type: String,
            maxlength: 500,
            trim: true,
        },

        status: {
            type: String,
            enum: ['pending', 'reviewing', 'resolved', 'rejected'],
            default: 'pending',
            index: true,
        },

        adminNote: {
            type: String,
            maxlength: 1000,
            trim: true,
        },

        action: {
            type: String,
            enum: [
                'warn',
                'block_user',
                'delete_post',
                'delete_message',
                'delete_comment',
                'ignore',
            ],
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

// نفس المستخدم لا يستطيع إرسال نفس البلاغ مرتين
reportSchema.index(
    {
        reportedBy: 1,
        type: 1,
        targetId: 1,
    },
    {
        unique: true,
    },
);

module.exports = mongoose.model('Report', reportSchema);
