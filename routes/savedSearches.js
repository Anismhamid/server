
const express = require('express');
const mongoose = require('mongoose');

const auth = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/userPermissions');

const SavedSearch = require('../models/SavedSearch');

const router = express.Router();

router.use(auth, requirePermission('canUseAccount'));

const getUserId = (req) => req.payload._id;

const validateSearch = (body, partial = false) => {
    const errors = [];

    if (!partial && !String(body.name || '').trim()) {
        errors.push('Search name is required');
    }

    for (const field of ['name', 'keyword', 'category', 'subCategory', 'location']) {
        if (
            body[field] !== undefined &&
            typeof body[field] !== 'string'
        ) {
            errors.push(`${field} must be a string`);
        }
    }

    for (const field of ['minPrice', 'maxPrice']) {
        if (body[field] !== undefined && body[field] !== null) {
            const value = Number(body[field]);

            if (!Number.isFinite(value) || value < 0) {
                errors.push(`${field} must be a non-negative number`);
            }
        }
    }

    if (
        body.minPrice != null &&
        body.maxPrice != null &&
        Number(body.minPrice) > Number(body.maxPrice)
    ) {
        errors.push('minPrice cannot exceed maxPrice');
    }

    if (
        body.notificationsEnabled !== undefined &&
        typeof body.notificationsEnabled !== 'boolean'
    ) {
        errors.push('notificationsEnabled must be a boolean');
    }

    return errors;
};

const editableFields = [
    'name',
    'keyword',
    'category',
    'subCategory',
    'minPrice',
    'maxPrice',
    'location',
    'notificationsEnabled',
];

const pickFields = (body) =>
    Object.fromEntries(
        editableFields
            .filter((field) =>
                Object.prototype.hasOwnProperty.call(body, field),
            )
            .map((field) => [field, body[field]]),
    );

// GET /api/saved-searches
router.get('/', async (req, res) => {
    try {
        const savedSearches = await SavedSearch.find({
            user: getUserId(req),
        })
            .sort({ createdAt: -1 })
            .lean();

        return res.json({ savedSearches });
    } catch (error) {
        console.error('[saved-searches] list:', error);
        return res.status(500).json({
            message: 'Failed to load saved searches',
        });
    }
});

// POST /api/saved-searches
router.post('/', async (req, res) => {
    try {
        const errors = validateSearch(req.body);

        if (errors.length) {
            return res.status(400).json({
                message: 'Invalid search',
                errors,
            });
        }

        const data = pickFields(req.body);

        if (
            data.minPrice != null &&
            data.maxPrice != null &&
            Number(data.minPrice) > Number(data.maxPrice)
        ) {
            return res.status(400).json({
                message: 'minPrice cannot exceed maxPrice',
            });
        }

        const savedSearch = await SavedSearch.create({
            ...data,
            user: getUserId(req),
        });

        return res.status(201).json(savedSearch);
    } catch (error) {
        console.error('[saved-searches] create:', error);
        return res.status(500).json({
            message: 'Failed to save search',
        });
    }
});

// PATCH /api/saved-searches/:id
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: 'Invalid search ID',
            });
        }

        const errors = validateSearch(req.body, true);

        if (errors.length) {
            return res.status(400).json({
                message: 'Invalid search',
                errors,
            });
        }

        const updates = pickFields(req.body);

        if (!Object.keys(updates).length) {
            return res.status(400).json({
                message: 'No valid fields provided',
            });
        }

        const current = await SavedSearch.findOne({
            _id: id,
            user: getUserId(req),
        });

        if (!current) {
            return res.status(404).json({
                message: 'Saved search not found',
            });
        }

        const minPrice =
            updates.minPrice !== undefined
                ? updates.minPrice
                : current.minPrice;

        const maxPrice =
            updates.maxPrice !== undefined
                ? updates.maxPrice
                : current.maxPrice;

        if (
            minPrice != null &&
            maxPrice != null &&
            Number(minPrice) > Number(maxPrice)
        ) {
            return res.status(400).json({
                message: 'minPrice cannot exceed maxPrice',
            });
        }

        Object.assign(current, updates);
        await current.save();

        return res.json(current);
    } catch (error) {
        console.error('[saved-searches] update:', error);
        return res.status(500).json({
            message: 'Failed to update saved search',
        });
    }
});

// DELETE /api/saved-searches/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: 'Invalid search ID',
            });
        }

        const deleted = await SavedSearch.findOneAndDelete({
            _id: id,
            user: getUserId(req),
        });

        if (!deleted) {
            return res.status(404).json({
                message: 'Saved search not found',
            });
        }

        return res.json({
            message: 'Saved search deleted successfully',
        });
    } catch (error) {
        console.error('[saved-searches] delete:', error);
        return res.status(500).json({
            message: 'Failed to delete saved search',
        });
    }
});

module.exports = router;
