const mongoose = require('mongoose');

const Block = require('../models/Block');
const User = require('../models/User');

// =====================================================
// Helpers
// =====================================================

const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

const getUserId = (req) => {
    return req.payload?._id || req.payload?.id;
};

// =====================================================
// POST /blocks
// Current user blocks another user
// =====================================================

const blockUser = async (req, res) => {
    try {
        // IMPORTANT:
        // blockerId ALWAYS comes from authenticated user.
        // Never trust blockerId from request body.
        const blockerId = getUserId(req);

        if (!blockerId) {
            return res.status(401).json({
                success: false,
                code: 'UNAUTHORIZED',
                message: 'Authentication required',
            });
        }

        const { userId, reason, expiresAt } = req.body || {};

        // =====================================================
        // Validate target user ID
        // =====================================================

        if (!userId || !isValidObjectId(userId)) {
            return res.status(400).json({
                success: false,
                code: 'INVALID_USER_ID',
                message: 'Invalid user ID',
            });
        }

        // =====================================================
        // Prevent self block
        // =====================================================

        if (String(blockerId) === String(userId)) {
            return res.status(400).json({
                success: false,
                code: 'CANNOT_BLOCK_SELF',
                message: 'You cannot block yourself',
            });
        }

        // =====================================================
        // Check target user
        // =====================================================

        const targetUser = await User.findById(userId)
            .select('_id name slug email image role accountStatus')
            .lean();

        if (!targetUser) {
            return res.status(404).json({
                success: false,
                code: 'USER_NOT_FOUND',
                message: 'User not found',
            });
        }

        // =====================================================
        // Validate expiration
        // =====================================================

        let expiration = null;
        let isPermanent = true;

        if (expiresAt !== undefined && expiresAt !== null) {
            const date = new Date(expiresAt);

            if (Number.isNaN(date.getTime())) {
                return res.status(400).json({
                    success: false,
                    code: 'INVALID_EXPIRATION_DATE',
                    message: 'Invalid expiration date',
                });
            }

            if (date <= new Date()) {
                return res.status(400).json({
                    success: false,
                    code: 'EXPIRATION_IN_PAST',
                    message: 'Expiration date must be in the future',
                });
            }

            expiration = date;
            isPermanent = false;
        }

        // =====================================================
        // Check existing block
        // =====================================================

        const existing = await Block.findOne({
            blockerId,
            blockedId: userId,
        });

        if (existing) {
            // -------------------------------------------------
            // Existing block expired
            // -------------------------------------------------

            if (existing.expiresAt && existing.expiresAt <= new Date()) {
                await Block.deleteOne({
                    _id: existing._id,
                });
            } else {
                return res.status(409).json({
                    success: false,
                    code: 'ALREADY_BLOCKED',
                    message: 'User is already blocked',
                    blocked: true,
                });
            }
        }

        // =====================================================
        // Create personal block
        // =====================================================

        const block = await Block.create({
            blockerId,
            blockedId: userId,
            reason:
                typeof reason === 'string' ? reason.trim().slice(0, 500) : '',
            expiresAt: expiration,
            isPermanent,
        });

        // =====================================================
        // Response
        // =====================================================

        return res.status(201).json({
            success: true,
            message: 'User blocked successfully',

            block: {
                _id: block._id,
                blockerId: block.blockerId,
                blockedId: block.blockedId,
                reason: block.reason,
                expiresAt: block.expiresAt,
                isPermanent: block.isPermanent,
                createdAt: block.createdAt,
            },

            user: {
                _id: targetUser._id,
                name: targetUser.name,
                slug: targetUser.slug,
                email: targetUser.email,
                image: targetUser.image,
                role: targetUser.role,
            },
        });
    } catch (error) {
        // MongoDB duplicate key
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                code: 'ALREADY_BLOCKED',
                message: 'User is already blocked',
                blocked: true,
            });
        }

        console.error('Block User Error:', error);

        return res.status(500).json({
            success: false,
            code: 'BLOCK_USER_ERROR',
            message: 'Failed to block user',
        });
    }
};

// =====================================================
// DELETE /blocks/:userId
// Current user unblocks another user
// =====================================================

const unblockUser = async (req, res) => {
    try {
        const blockerId = getUserId(req);

        if (!blockerId) {
            return res.status(401).json({
                success: false,
                code: 'UNAUTHORIZED',
                message: 'Authentication required',
            });
        }

        const { userId } = req.params;

        if (!isValidObjectId(userId)) {
            return res.status(400).json({
                success: false,
                code: 'INVALID_USER_ID',
                message: 'Invalid user ID',
            });
        }

        const result = await Block.findOneAndDelete({
            blockerId,
            blockedId: userId,
        });

        if (!result) {
            return res.status(404).json({
                success: false,
                code: 'BLOCK_NOT_FOUND',
                message: 'User is not blocked',
            });
        }

        return res.json({
            success: true,
            message: 'User unblocked successfully',
        });
    } catch (error) {
        console.error('Unblock User Error:', error);

        return res.status(500).json({
            success: false,
            code: 'UNBLOCK_USER_ERROR',
            message: 'Failed to unblock user',
        });
    }
};

// =====================================================
// GET /blocks/my
// Current user's blocked users
// =====================================================

const getBlockedUsers = async (req, res) => {
    try {
        const blockerId = getUserId(req);

        if (!blockerId) {
            return res.status(401).json({
                success: false,
                code: 'UNAUTHORIZED',
                message: 'Authentication required',
            });
        }

        const now = new Date();

        // =====================================================
        // Remove expired blocks belonging to current user
        // =====================================================

        await Block.deleteMany({
            blockerId,
            expiresAt: {
                $ne: null,
                $lte: now,
            },
        });

        // =====================================================
        // Get active blocks
        // =====================================================

        const blocks = await Block.find({
            blockerId,

            $or: [
                {
                    isPermanent: true,
                },
                {
                    expiresAt: null,
                },
                {
                    expiresAt: {
                        $gt: now,
                    },
                },
            ],
        })
            .populate({
                path: 'blockedId',
                select: 'name slug email image role',
            })
            .sort({
                createdAt: -1,
            })
            .lean();

        // =====================================================
        // Format response
        // =====================================================

        const result = blocks
            .filter((block) => block.blockedId)
            .map((block) => ({
                _id: block.blockedId._id,

                name: block.blockedId.name,

                slug: block.blockedId.slug,

                image: block.blockedId.image,

                email: block.blockedId.email,

                role: block.blockedId.role,

                blockedAt: block.createdAt,

                reason: block.reason,

                expiresAt: block.expiresAt,

                isPermanent: block.isPermanent,
            }));

        return res.json({
            success: true,
            blocks: result,
        });
    } catch (error) {
        console.error('Get Blocked Users Error:', error);

        return res.status(500).json({
            success: false,
            code: 'GET_BLOCKED_USERS_ERROR',
            message: 'Failed to get blocked users',
        });
    }
};

// =====================================================
// GET /blocks/check/:userId
// Has current user blocked target?
// =====================================================

const isUserBlocked = async (req, res) => {
    try {
        const blockerId = getUserId(req);

        if (!blockerId) {
            return res.status(401).json({
                success: false,
                code: 'UNAUTHORIZED',
                message: 'Authentication required',
            });
        }

        const { userId } = req.params;

        if (!isValidObjectId(userId)) {
            return res.status(400).json({
                success: false,
                code: 'INVALID_USER_ID',
                message: 'Invalid user ID',
            });
        }

        const now = new Date();

        const block = await Block.findOne({
            blockerId,
            blockedId: userId,

            $or: [
                {
                    isPermanent: true,
                },
                {
                    expiresAt: null,
                },
                {
                    expiresAt: {
                        $gt: now,
                    },
                },
            ],
        }).lean();

        return res.json({
            success: true,
            blocked: !!block,
        });
    } catch (error) {
        console.error('Check Block Error:', error);

        return res.status(500).json({
            success: false,
            code: 'CHECK_BLOCK_ERROR',
            message: 'Failed to check block status',
        });
    }
};

// =====================================================
// GET /blocks/blockers/:userId
// Admin / Moderator
// Who blocked this user?
// =====================================================

const getBlockers = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!isValidObjectId(userId)) {
            return res.status(400).json({
                success: false,
                code: 'INVALID_USER_ID',
                message: 'Invalid user ID',
            });
        }

        const now = new Date();

        const blocks = await Block.find({
            blockedId: userId,

            $or: [
                {
                    isPermanent: true,
                },
                {
                    expiresAt: null,
                },
                {
                    expiresAt: {
                        $gt: now,
                    },
                },
            ],
        })
            .populate({
                path: 'blockerId',
                select: 'name slug email image role',
            })
            .sort({
                createdAt: -1,
            })
            .lean();

        const result = blocks
            .filter((block) => block.blockerId)
            .map((block) => ({
                _id: block.blockerId._id,

                name: block.blockerId.name,

                slug: block.blockerId.slug,

                image: block.blockerId.image,

                email: block.blockerId.email,

                role: block.blockerId.role,

                blockedAt: block.createdAt,

                reason: block.reason,

                expiresAt: block.expiresAt,

                isPermanent: block.isPermanent,
            }));

        return res.json({
            success: true,
            blockers: result,
        });
    } catch (error) {
        console.error('Get Blockers Error:', error);

        return res.status(500).json({
            success: false,
            code: 'GET_BLOCKERS_ERROR',
            message: 'Failed to get blockers',
        });
    }
};

module.exports = {
    blockUser,
    unblockUser,
    getBlockedUsers,
    isUserBlocked,
    getBlockers,
};
