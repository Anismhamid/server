const express = require('express');
const mongoose = require('mongoose');
const JobSeeker = require('../models/JobbSeeker');

const auth = require('../middlewares/auth');

const router = express.Router();

const POPULATE = { path: 'user', select: 'name image slug _id phone' };
const MAX_ACTIVE_PER_USER = 3;
const ADMIN_ROLES = ['Admin', 'Moderator'];

const WRITABLE = [
    'title', 'category', 'types', 'experienceLevel', 'region', 'location', 'remote',
    'expectedSalary', 'salaryPeriod', 'skills', 'languages', 'hebrewLevel',
    'availability', 'about', 'showPhone',
];

const pickWritable = (body) =>
    WRITABLE.reduce((acc, k) => {
        if (body[k] !== undefined) acc[k] = body[k];
        return acc;
    }, {});

const str = (v) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const uidOf = (req) => String(req.payload?._id);

// phone hidden unless the owner chose to show it
const serialize = (doc, { keepPhone = false } = {}) => {
    const o = doc.toObject();
    if (!keepPhone && !o.showPhone && o.user) delete o.user.phone;
    return o;
};

const handleError = (res, err) => {
    if (err.name === 'ValidationError' || err.name === 'CastError') {
        return res.status(400).json({ success: false, message: err.message });
    }
    console.error('jobSeekers route error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
};

const loadOwned = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).json({ success: false, message: 'Invalid id' });
        return null;
    }
    const doc = await JobSeeker.findById(req.params.id);
    if (!doc) {
        res.status(404).json({ success: false, message: 'Not found' });
        return null;
    }
    const isOwner = String(doc.user) === uidOf(req);
    if (!isOwner && !ADMIN_ROLES.includes(req.payload?.role)) {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return null;
    }
    return doc;
};

// ─── GET /api/job-seekers  (public search) ─────────────────
router.get('/', async (req, res) => {
    try {
        const { category, region, type, experienceLevel, hebrewLevel, remote, q } = req.query;
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));

        const filter = { active: true };
        if (str(category)) filter.category = str(category);
        if (str(region)) filter.region = str(region);
        if (str(type)) filter.types = str(type);
        if (str(experienceLevel)) filter.experienceLevel = str(experienceLevel);
        if (str(hebrewLevel)) filter.hebrewLevel = str(hebrewLevel);
        if (remote === 'true') filter.remote = true;

        const text = str(q);
        if (text) {
            const rx = new RegExp(escapeRegex(text), 'i');
            filter.$or = [{ title: rx }, { skills: rx }, { location: rx }, { about: rx }];
        }

        const [docs, total] = await Promise.all([
            JobSeeker.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate(POPULATE),
            JobSeeker.countDocuments(filter),
        ]);

        res.json({
            success: true,
            count: docs.length,
            seekers: docs.map((d) => serialize(d)),
            pagination: { total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) },
        });
    } catch (err) {
        handleError(res, err);
    }
});

// ─── GET /api/job-seekers/mine ─────────────────────────────
router.get('/mine', auth, async (req, res) => {
    try {
        const docs = await JobSeeker.find({ user: uidOf(req) })
            .sort({ createdAt: -1 })
            .populate(POPULATE);
        res.json({ success: true, seekers: docs.map((d) => serialize(d, { keepPhone: true })) });
    } catch (err) {
        handleError(res, err);
    }
});

// ─── GET /api/job-seekers/:id ──────────────────────────────
router.get('/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid id' });
        }
        const doc = await JobSeeker.findById(req.params.id).populate(POPULATE);
        if (!doc || !doc.active) {
            return res.status(404).json({ success: false, message: 'Not found' });
        }
        res.json({ success: true, seeker: serialize(doc) });
    } catch (err) {
        handleError(res, err);
    }
});

// ─── POST /api/job-seekers ─────────────────────────────────
router.post('/', auth, async (req, res) => {
    try {
        const activeCount = await JobSeeker.countDocuments({ user: uidOf(req), active: true });
        if (activeCount >= MAX_ACTIVE_PER_USER) {
            return res
                .status(429)
                .json({ success: false, message: `Max ${MAX_ACTIVE_PER_USER} active posts` });
        }

        const doc = await JobSeeker.create({ ...pickWritable(req.body), user: uidOf(req) });
        await doc.populate(POPULATE);
        res.status(201).json({ success: true, seeker: serialize(doc, { keepPhone: true }) });
    } catch (err) {
        handleError(res, err);
    }
});

// ─── PUT /api/job-seekers/:id ──────────────────────────────
router.put('/:id', auth, async (req, res) => {
    try {
        const doc = await loadOwned(req, res);
        if (!doc) return;

        doc.set(pickWritable(req.body));
        await doc.save();
        await doc.populate(POPULATE);
        res.json({ success: true, seeker: serialize(doc, { keepPhone: true }) });
    } catch (err) {
        handleError(res, err);
    }
});

// ─── PATCH /api/job-seekers/:id/toggle ─────────────────────
router.patch('/:id/toggle', auth, async (req, res) => {
    try {
        const doc = await loadOwned(req, res);
        if (!doc) return;

        if (!doc.active) {
            const activeCount = await JobSeeker.countDocuments({ user: doc.user, active: true });
            if (activeCount >= MAX_ACTIVE_PER_USER) {
                return res
                    .status(429)
                    .json({ success: false, message: `Max ${MAX_ACTIVE_PER_USER} active posts` });
            }
        }

        doc.active = !doc.active;
        await doc.save();
        res.json({ success: true, seeker: { _id: doc._id, active: doc.active } });
    } catch (err) {
        handleError(res, err);
    }
});

// ─── DELETE /api/job-seekers/:id ───────────────────────────
router.delete('/:id', auth, async (req, res) => {
    try {
        const doc = await loadOwned(req, res);
        if (!doc) return;

        await doc.deleteOne();
        res.json({ success: true });
    } catch (err) {
        handleError(res, err);
    }
});

module.exports = router;