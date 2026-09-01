const express = require('express');

const {
    createReport,
    checkUserReported,
    getMyReports,
    getAllReports,
    getReportById,
    getReportStats,
    updateReport,
    deleteReport,
} = require('../controllers/reportController');

const auth = require('../middlewares/auth');
const {
    requirePermission,
} = require('../middlewares/userPermissions');

const router = express.Router();

// =====================================================
// User
// =====================================================

router.post(
    '/',
    auth,
    createReport,
);

router.get(
    '/check/:type/:targetId',
    auth,
    checkUserReported,
);

router.get(
    '/my',
    auth,
    getMyReports,
);

// =====================================================
// Admin / Moderator - Reports Management
// =====================================================

router.get(
    '/stats',
    auth,
    requirePermission('canManageReports'),
    getReportStats,
);

router.get(
    '/',
    auth,
    requirePermission('canManageReports'),
    getAllReports,
);

router.get(
    '/:reportId',
    auth,
    requirePermission('canManageReports'),
    getReportById,
);

router.patch(
    '/:reportId',
    auth,
    requirePermission('canManageReports'),
    updateReport,
);

// =====================================================
// Admin - Delete Reports
// =====================================================

router.delete(
    '/:reportId',
    auth,
    requirePermission('canDeleteReports'),
    deleteReport,
);

module.exports = router;