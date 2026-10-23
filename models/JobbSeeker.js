const mongoose = require('mongoose');
const {
    JOB_CATEGORIES,
    JOB_REGIONS,
    JOB_TYPES,
    EXPERIENCE_LEVELS,
    SALARY_PERIODS,
    HEBREW_LEVELS,
    AVAILABILITIES,
    SEEKER_LANGUAGES,
} = require('../config/jobCategories');

const { Schema } = mongoose;

const jobSeekerSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'Users', required: true, index: true },

        title: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
        category: { type: String, enum: JOB_CATEGORIES, required: true },

        types: {
            type: [{ type: String, enum: JOB_TYPES }],
            validate: [(v) => v.length > 0 && v.length <= JOB_TYPES.length, 'types required'],
        },
        experienceLevel: { type: String, enum: EXPERIENCE_LEVELS },

        region: { type: String, enum: JOB_REGIONS },
        location: { type: String, trim: true, maxlength: 80 },
        remote: { type: Boolean, default: false },

        expectedSalary: { type: Number, min: 0, max: 10000000 },
        salaryPeriod: { type: String, enum: SALARY_PERIODS },

        skills: {
            type: [{ type: String, trim: true, maxlength: 40 }],
            validate: [(v) => v.length <= 15, 'max 15 skills'],
        },
        languages: [{ type: String, enum: SEEKER_LANGUAGES }],
        hebrewLevel: { type: String, enum: HEBREW_LEVELS, default: 'none' },
        availability: { type: String, enum: AVAILABILITIES, default: 'flexible' },

        about: { type: String, trim: true, maxlength: 1000 },

        showPhone: { type: Boolean, default: true },
        active: { type: Boolean, default: true },
    },
    { timestamps: true },
);

jobSeekerSchema.index({ active: 1, category: 1, region: 1, createdAt: -1 });

module.exports = mongoose.model('JobSeeker', jobSeekerSchema);