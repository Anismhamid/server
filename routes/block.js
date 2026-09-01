const express = require('express');

const {
    blockUser,
    unblockUser,
    getBlockedUsers,
    isUserBlocked,
    getBlockers,
} = require('../controllers/blockController');

const auth = require('../middlewares/auth');
const {
    requirePermission,
    requireRole,
} = require('../middlewares/userPermissions');

const router = express.Router();

// =====================================================
// USER
// الحظر شخصي فقط
// =====================================================

// المستخدم يحظر مستخدمًا آخر لنفسه
router.post(
    '/',
    auth,
    blockUser,
);

// المستخدم يفك حظره بنفسه
router.delete(
    '/:userId',
    auth,
    unblockUser,
);

// المستخدم يرى قائمة الأشخاص الذين حظرهم
router.get(
    '/my',
    auth,
    getBlockedUsers,
);

// المستخدم يعرف هل قام هو بحظر شخص معين
router.get(
    '/check/:userId',
    auth,
    isUserBlocked,
);

// =====================================================
// ADMIN / MODERATOR
// =====================================================

// معرفة من قام بحظر مستخدم معين
router.get(
    '/blockers/:userId',
    auth,
    requirePermission('canManageReports'),
    requireRole('Admin', 'Moderator'),
    getBlockers,
);

module.exports = router;