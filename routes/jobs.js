const express = require('express');
const mongoose = require('mongoose');

const Jobs = require('../models/Jobs');
const auth = require('../middlewares/auth')
const router = express.Router();

// =====================================================
// Helpers
// =====================================================

const populateSeller = {
    path: 'seller',
    select: 'name image slug _id',
};

// =====================================================
// GET /api/jobs
// Get all jobs
// =====================================================

router.get('/', async (req, res) => {
    try {
        const jobs = await Jobs.find()
            .populate(populateSeller)
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: jobs.length,
            jobs,
        });
    } catch (error) {
        console.error('Get jobs error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch jobs',
        });
    }
});

// =====================================================
// GET /api/jobs/search
// Search / filter jobs
// =====================================================

router.get('/search', async (req, res) => {
    try {
        const {
            type,
            experienceLevel,
            salaryMin,
            salaryMax,
            salaryPeriod,
            remote,
            location,
            industry,
            page = 1,
            limit = 20,
        } = req.query;

        const filter = {};

        if (type) {
            filter.type = type;
        }

        if (experienceLevel) {
            filter.experienceLevel = experienceLevel;
        }

        if (salaryPeriod) {
            filter.salaryPeriod = salaryPeriod;
        }

        if (remote !== undefined) {
            filter.remote = remote === 'true';
        }

        if (location) {
            filter.location = {
                $regex: String(location),
                $options: 'i',
            };
        }

        if (industry) {
            filter.industry = {
                $regex: String(industry),
                $options: 'i',
            };
        }

        const minSalary = Number(salaryMin);
        const maxSalary = Number(salaryMax);

        // الوظائف التي يتقاطع راتبها مع الحد الأدنى المطلوب
        if (
            salaryMin !== undefined &&
            Number.isFinite(minSalary)
        ) {
            filter.salaryMax = {
                $gte: minSalary,
            };
        }

        // الوظائف التي يبدأ راتبها ضمن الحد الأعلى المطلوب
        if (
            salaryMax !== undefined &&
            Number.isFinite(maxSalary)
        ) {
            filter.salaryMin = {
                ...(filter.salaryMin || {}),
                $lte: maxSalary,
            };
        }

        const pageNumber = Math.max(
            Number(page) || 1,
            1,
        );

        const limitNumber = Math.min(
            Math.max(Number(limit) || 20, 1),
            100,
        );

        const skip =
            (pageNumber - 1) * limitNumber;

        const [jobs, total] =
            await Promise.all([
                Jobs.find(filter)
                    .populate(populateSeller)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limitNumber),

                Jobs.countDocuments(filter),
            ]);

        return res.status(200).json({
            success: true,
            jobs,
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                pages: Math.ceil(
                    total / limitNumber,
                ),
            },
        });
    } catch (error) {
        console.error(
            'Search jobs error:',
            error,
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to search jobs',
        });
    }
});

// =====================================================
// GET /api/jobs/type/:type
// =====================================================

router.get('/type/:type', async (req, res) => {
    try {
        const jobs = await Jobs.find({
            type: req.params.type,
        })
            .populate(populateSeller)
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: jobs.length,
            jobs,
        });
    } catch (error) {
        console.error(
            'Get jobs by type error:',
            error,
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch jobs',
        });
    }
});

// =====================================================
// GET /api/jobs/:jobId
// Get single job
// =====================================================

router.get('/:jobId', async (req, res) => {
    try {
        const { jobId } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(jobId)
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid job ID',
            });
        }

        const job = await Jobs.findById(jobId)
            .populate(populateSeller);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found',
            });
        }

        return res.status(200).json({
            success: true,
            job,
        });
    } catch (error) {
        console.error(
            'Get job details error:',
            error,
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch job',
        });
    }
});

// =====================================================
// POST /api/jobs
// Create job
// =====================================================

router.post('/',auth, async (req, res) => {
    try {
        /*
         * مهم:
         * عدّل هذا حسب middleware الـ JWT الموجود عندك.
         *
         * نحن نفترض أن:
         * req.payload._id
         * يحتوي على ID المستخدم.
         */

        const sellerId = req.payload._id;

        if (!sellerId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
        }

        const job = await Jobs.create({
            ...req.body,
            seller: sellerId,
        });

        const populatedJob =
            await Jobs.findById(job._id)
                .populate(populateSeller);

        return res.status(201).json({
            success: true,
            message: 'Job created successfully',
            job: populatedJob,
        });
    } catch (error) {
        console.error(
            'Create job error:',
            error,
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to create job',
        });
    }
});

// =====================================================
// PATCH /api/jobs/:jobId
// Update job
// =====================================================

router.patch('/:jobId',auth, async (req, res) => {
    try {
        const { jobId } = req.params;
        const sellerId = req.payload._id;

        if (!sellerId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
        }

        if (
            !mongoose.Types.ObjectId.isValid(jobId)
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid job ID',
            });
        }

        const job = await Jobs.findById(jobId);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found',
            });
        }

        // فقط صاحب الوظيفة يستطيع تعديلها
        if (
            job.seller.toString() !==
            sellerId.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    'You are not allowed to update this job',
            });
        }

        /*
         * لا نسمح بتغيير seller من req.body
         */
        const {
            seller,
            _id,
            createdAt,
            updatedAt,
            ...updateData
        } = req.body;

        Object.assign(job, updateData);

        await job.save();

        const updatedJob =
            await Jobs.findById(job._id)
                .populate(populateSeller);

        return res.status(200).json({
            success: true,
            message: 'Job updated successfully',
            job: updatedJob,
        });
    } catch (error) {
        console.error(
            'Update job error:',
            error,
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to update job',
        });
    }
});

// =====================================================
// DELETE /api/jobs/:jobId
// Delete job
// =====================================================

router.delete('/:jobId',auth, async (req, res) => {
    try {
        const { jobId } = req.params;
        const sellerId = req.payload?._id;

        if (!sellerId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
        }

        if (
            !mongoose.Types.ObjectId.isValid(jobId)
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid job ID',
            });
        }

        const job = await Jobs.findById(jobId);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found',
            });
        }

        // فقط صاحب الوظيفة يستطيع حذفها
        if (
            job.seller.toString() !==
            sellerId.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    'You are not allowed to delete this job',
            });
        }

        await Jobs.findByIdAndDelete(jobId);

        return res.status(200).json({
            success: true,
            message: 'Job deleted successfully',
        });
    } catch (error) {
        console.error(
            'Delete job error:',
            error,
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to delete job',
        });
    }
});

module.exports = router;