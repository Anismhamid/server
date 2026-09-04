const Block = require('../models/Block');

const isBlockActive = (block) => {
    if (!block) return false;

    if (block.isPermanent) {
        return true;
    }

    if (!block.expiresAt) {
        return true;
    }

    return new Date(block.expiresAt) > new Date();
};

const checkBlockBetweenUsers = async (userId1, userId2) => {
    const block = await Block.findOne({
        $or: [
            {
                blockerId: userId1,
                blockedId: userId2,
            },
            {
                blockerId: userId2,
                blockedId: userId1,
            },
        ],
    });

    return isBlockActive(block);
};

const preventBlockedInteraction = async (req, res, next) => {
    try {
        const currentUserId = req.payload._id;

        const targetUserId =
            req.params.userId ||
            req.body.userId ||
            req.body.receiverId ||
            req.body.sellerId;

        if (!targetUserId) {
            return next();
        }

        const blocked = await checkBlockBetweenUsers(
            currentUserId,
            targetUserId,
        );

        if (blocked) {
            return res.status(403).json({
                success: false,
                code: 'USER_BLOCKED',
                message: 'Interaction with this user is blocked',
            });
        }

        next();
    } catch (error) {
        console.error('Block middleware error:', error);

        return res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Failed to check block status',
        });
    }
};

module.exports = {
    checkBlockBetweenUsers,
    preventBlockedInteraction,
};