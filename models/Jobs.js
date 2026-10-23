const mongoose = require('mongoose');
const { JOB_CATEGORIES } = require('../config/jobCategories');

const jobsSchema = new mongoose.Schema(
    {
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
            required: true,
        },

        type: {
            type: String,
            enum: ['full_time', 'part_time', 'temporary', 'remote', 'daily', 'internship'],
            required: true,
        },

        jobTitle: { type: String, required: true, trim: true, minlength: 2, maxlength: 150 },

        // NEW: قسم الوظيفة (قديمة بدون قسم تضل شغّالة)
        category: { type: String, enum: JOB_CATEGORIES, index: true },

        companyName: { type: String, trim: true, maxlength: 150 },
        industry: { type: String, trim: true, maxlength: 100 },

        experienceLevel: {
            type: String,
            enum: ['no_experience', 'entry', 'mid', 'senior', 'manager'],
        },

        salaryMin: { type: Number, min: 0 },

        salaryMax: {
            type: Number,
            min: 0,
            validate: {
                validator: function (value) {
                    if (value == null || this.salaryMin == null) return true;
                    return value >= this.salaryMin;
                },
                message: 'salaryMax must be greater than or equal to salaryMin',
            },
        },

        salaryPeriod: { type: String, enum: ['hourly', 'daily', 'monthly', 'yearly'] },

        location: { type: String, trim: true, maxlength: 150 },
        remote: { type: Boolean, default: false },

        requirements: [{ type: String, trim: true, maxlength: 300 }],
        benefits: [{ type: String, trim: true, maxlength: 300 }],
    },
    { timestamps: true },
);

jobsSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model('Jobs', jobsSchema);