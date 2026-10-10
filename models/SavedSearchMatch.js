const mongoose = require('mongoose');

const savedSearchMatchSchema = new mongoose.Schema(
    {
        savedSearch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SavedSearch',
            required: true,
        },

        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Posts',
            required: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        notifiedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    },
);

savedSearchMatchSchema.index({ savedSearch: 1, post: 1 }, { unique: true });

module.exports = mongoose.model('SavedSearchMatch', savedSearchMatchSchema);
