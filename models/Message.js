const mongoose = require("mongoose")
const messageSchema = new mongoose.Schema(
    {
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
            required: true,
        },
        to: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
            required: true,
        },
        message: {
            type: String,
            maxlength: 1000,
            default: '',
        },
        warning: { type: Boolean, default: false },
        isImportant: { type: Boolean, default: false },

        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
            default: null,
        },

        fileUrl: String,
        fileType: String,

        status: {
            type: String,
            enum: ['pending', 'sent', 'delivered', 'seen'],
            default: 'pending',
        },

        roomId: {
            type: String,
            required: true,
        },
    },
    { timestamps: true },
);

// indexes (optimized)
messageSchema.index({ roomId: 1, createdAt: -1 });
messageSchema.index({ to: 1, status: 1 });

module.exports = mongoose.model('Message', messageSchema);
