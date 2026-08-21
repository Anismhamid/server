const User = require('../../models/User');

const roleType = {
    Admin: 'Admin',
    Moderator: 'Moderator',
    Client: 'Client',
};

const updateUserPermission = async (req, res) => {
    try {
        if (req.payload.role !== roleType.Admin) {
            return res.status(403).json({
                success: false,
                code: 'ADMIN_ONLY',
                message: 'Admins only',
            });
        }

        const { userId } = req.params;
        const { enabled } = req.body;

        if (userId === req.payload._id.toString()) {
            return res.status(400).json({
                success: false,
                code: 'CANNOT_CHANGE_SELF_PERMISSIONS',
                message: 'You cannot change your own permissions',
            });
        }

        if (typeof enabled !== 'boolean') {
            return res.status(400).json({
                success: false,
                code: 'INVALID_PERMISSION_VALUE',
                message: 'enabled must be a boolean',
            });
        }

        const permission = req.permission;

        const allowedPermissions = [
            'canLogin',
            'canCreatePosts',
            'canSendMessages',
            'canSendOffers',
            'canUseAccount',
            'canAccessExistingData',
        ];

        if (!allowedPermissions.includes(permission)) {
            return res.status(400).json({
                success: false,
                code: 'INVALID_PERMISSION',
                message: 'Invalid permission',
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    [`permissions.${permission}`]: enabled,
                },
            },
            {
                new: true,
                runValidators: true,
            },
        )
            .select('-password -__v')
            .lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                code: 'USER_NOT_FOUND',
                message: 'User not found',
            });
        }

        const io = req.app.get('io');

        io.emit('user:permissionChanged', {
            userId: user._id.toString(),
            permission,
            enabled,
        });

        return res.status(200).json({
            success: true,
            message: 'Permission updated successfully',
            permission,
            enabled,
            user,
        });
    } catch (error) {
        console.error('Permission update error:', error);

        return res.status(500).json({
            success: false,
            code: 'PERMISSION_UPDATE_ERROR',
            message: 'Internal server error',
        });
    }
};

module.exports = {
    updateUserPermission,
};