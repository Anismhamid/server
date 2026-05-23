// models/FeaturedAd.js
const mongoose = require('mongoose');

const featuredAdSchema = new mongoose.Schema(
    {
        listingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Posts',
            required: true,
            index: true,
        },
        paid: {
            type: Boolean,
            default: false,
        },
        stripeSessionId: {
            type: String,
            unique: true,
            sparse: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        type: {
            type: String,
            enum: ['highlight', 'top', 'homepage'],
            required: true,
        },

        startDate: {
            type: Date,
            required: true,
        },

        endDate: {
            type: Date,
            required: true,
            index: true,
        },

        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    {
        timestamps: true,
    },
);

featuredAdSchema.index({ type: 1, endDate: 1, isActive: 1 });
const featuredAd = mongoose.model('FeaturedAd', featuredAdSchema);
module.exports = featuredAd;
