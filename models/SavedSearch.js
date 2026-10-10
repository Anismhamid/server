const mongoose = require('mongoose');

const savedSearchSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        keyword: {
            type: String,
            trim: true,
            maxlength: 100,
            default: '',
        },

        category: {
            type: String,
            trim: true,
            default: '',
        },

        subCategory: {
            type: String,
            trim: true,
            default: '',
        },

        minPrice: {
            type: Number,
            min: 0,
            default: null,
        },

        maxPrice: {
            type: Number,
            min: 0,
            default: null,
        },

        location: {
            type: String,
            trim: true,
            maxlength: 100,
            default: '',
        },

        notificationsEnabled: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    },
);

savedSearchSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('SavedSearch', savedSearchSchema);
