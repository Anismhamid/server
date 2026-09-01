const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema(
    {
        // المستخدم الذي قام بالحظر
        blockerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
            required: true,
            index: true,
        },

        // المستخدم الذي تم حظره
        blockedId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
            required: true,
            index: true,
        },

        reason: {
            type: String,
            maxlength: 500,
            trim: true,
            default: '',
        },

        expiresAt: {
            type: Date,
            default: null,
        },

        isPermanent: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    },
);

// =====================================================
// Prevent self block
// =====================================================

blockSchema.pre('validate', function (next) {
    if (String(this.blockerId) === String(this.blockedId)) {
        return next(
            new Error('A user cannot block himself'),
        );
    }

    next();
});

// =====================================================
// One block per user pair
// =====================================================

blockSchema.index(
    {
        blockerId: 1,
        blockedId: 1,
    },
    {
        unique: true,
    },
);

// =====================================================
// Fast lookup: who blocked this user?
// =====================================================

blockSchema.index({
    blockedId: 1,
    expiresAt: 1,
});

// =====================================================
// Fast lookup: user's active blocks
// =====================================================

blockSchema.index({
    blockerId: 1,
    expiresAt: 1,
});

const Block = mongoose.model('Block', blockSchema);

module.exports = Block;