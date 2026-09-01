const mongoose = require('mongoose');

const Block = require('../models/Block');
const Message = require('../models/Message');
const Report = require('../models/Report');
const User = require('../models/User');
const Post = require('../models/post');

// =====================================================
// Constants
// =====================================================

const REPORT_TYPES = [
    'user',
    'post',
    'message',
    'comment',
];

const REPORT_STATUSES = [
    'pending',
    'reviewing',
    'resolved',
    'rejected',
];

const REPORT_ACTIONS = [
    'warn',
    'block_user',
    'delete_post',
    'delete_message',
    'delete_comment',
    'ignore',
];

// =====================================================
// Helpers
// =====================================================

const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

const getUserId = (req) => {
    return req?.payload?._id || null;
};

// =====================================================
// Validate target
// =====================================================

const targetExists = async (type, targetId) => {
    if (!isValidObjectId(targetId)) {
        return false;
    }

    switch (type) {
        case 'user':
            return !!(await User.exists({
                _id: targetId,
            }));

        case 'post':
            return !!(await Post.exists({
                _id: targetId,
            }));

        case 'message':
            return !!(await Message.exists({
                _id: targetId,
            }));

        case 'comment':
            // Comment model غير مربوط حالياً.
            // لا نعتمد على true حتى لا نقبل IDs غير موجودة.
            return false;

        default:
            return false;
    }
};

// =====================================================
// POST /reports
// Create report
// =====================================================

const createReport = async (req, res) => {
    try {
        const reportedBy = getUserId(req);

        if (!reportedBy) {
            return res.status(401).json({
                success: false,
                code: 'AUTHENTICATION_REQUIRED',
                message: 'Authentication required',
            });
        }

        const {
            type,
            targetId,
            reason,
            description,
        } = req.body || {};

        // -------------------------------------------------
        // Validate type
        // -------------------------------------------------

        if (!REPORT_TYPES.includes(type)) {
            return res.status(400).json({
                success: false,
                code: 'INVALID_REPORT_TYPE',
                message: 'Invalid report type',
            });
        }

        // -------------------------------------------------
        // Validate target ID
        // -------------------------------------------------

        if (!targetId || !isValidObjectId(targetId)) {
            return res.status(400).json({
                success: false,
                code: 'INVALID_TARGET_ID',
                message: 'Invalid target ID',
            });
        }

        // -------------------------------------------------
        // Prevent self report
        // -------------------------------------------------

        if (
            type === 'user' &&
            String(targetId) === String(reportedBy)
        ) {
            return res.status(400).json({
                success: false,
                code: 'SELF_REPORT_NOT_ALLOWED',
                message: 'You cannot report yourself',
            });
        }

        // -------------------------------------------------
        // Validate target
        // -------------------------------------------------

        const exists = await targetExists(
            type,
            targetId,
        );

        if (!exists) {
            return res.status(404).json({
                success: false,
                code: 'REPORT_TARGET_NOT_FOUND',
                message: 'Report target not found',
            });
        }

        // -------------------------------------------------
        // Prevent duplicate report
        // -------------------------------------------------

        const existingReport = await Report.findOne({
            reportedBy,
            type,
            targetId,
        });

        if (existingReport) {
            return res.status(409).json({
                success: false,
                code: 'REPORT_ALREADY_EXISTS',
                message: 'You have already reported this',
                reported: true,
                report: existingReport,
            });
        }

        // -------------------------------------------------
        // Create report
        // -------------------------------------------------

        const report = await Report.create({
            type,
            targetId,
            reportedBy,
            reason,
            description:
                typeof description === 'string'
                    ? description.trim().slice(0, 500)
                    : undefined,
            status: 'pending',
        });

        return res.status(201).json({
            success: true,
            message: 'Report created successfully',
            report,
        });
    } catch (error) {
        // Mongo duplicate index
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                code: 'REPORT_ALREADY_EXISTS',
                message: 'You have already reported this',
                reported: true,
            });
        }

        console.error(
            'Create Report Error:',
            error,
        );

        return res.status(500).json({
            success: false,
            code: 'REPORT_CREATE_ERROR',
            message: 'Failed to create report',
        });
    }
};

// =====================================================
// GET /reports/check/:type/:targetId
// =====================================================

const checkUserReported = async (req, res) => {
    try {
        const reportedBy = getUserId(req);

        if (!reportedBy) {
            return res.status(401).json({
                success: false,
                code: 'AUTHENTICATION_REQUIRED',
                message: 'Authentication required',
            });
        }

        const {
            type,
            targetId,
        } = req.params;

        if (!REPORT_TYPES.includes(type)) {
            return res.status(400).json({
                success: false,
                code: 'INVALID_REPORT_TYPE',
                message: 'Invalid report type',
            });
        }

        if (!isValidObjectId(targetId)) {
            return res.status(400).json({
                success: false,
                code: 'INVALID_TARGET_ID',
                message: 'Invalid target ID',
            });
        }

        const report = await Report.exists({
            reportedBy,
            type,
            targetId,
        });

        return res.json({
            success: true,
            reported: !!report,
        });
    } catch (error) {
        console.error(
            'Check Report Error:',
            error,
        );

        return res.status(500).json({
            success: false,
            code: 'REPORT_CHECK_ERROR',
            message: 'Failed to check report',
        });
    }
};

// =====================================================
// GET /reports/my
// =====================================================

const getMyReports = async (req, res) => {
    try {
        const reportedBy = getUserId(req);

        if (!reportedBy) {
            return res.status(401).json({
                success: false,
                code: 'AUTHENTICATION_REQUIRED',
                message: 'Authentication required',
            });
        }

        const reports = await Report.find({
            reportedBy,
        })
            .sort({
                createdAt: -1,
            })
            .lean();

        return res.json({
            success: true,
            reports,
        });
    } catch (error) {
        console.error(
            'Get My Reports Error:',
            error,
        );

        return res.status(500).json({
            success: false,
            code: 'GET_MY_REPORTS_ERROR',
            message: 'Failed to get reports',
        });
    }
};

// =====================================================
// GET /reports
// Admin / Moderator
// =====================================================

const getAllReports = async (req, res) => {
    try {
        const {
            status,
            type,
            page = 1,
            limit = 20,
            sort = 'newest',
        } = req.query;

        const currentPage = Math.max(
            Number(page) || 1,
            1,
        );

        const perPage = Math.min(
            Math.max(Number(limit) || 20, 1),
            100,
        );

        const filter = {};

        // -------------------------------------------------
        // Status filter
        // -------------------------------------------------

        if (status) {
            if (!REPORT_STATUSES.includes(status)) {
                return res.status(400).json({
                    success: false,
                    code: 'INVALID_REPORT_STATUS',
                    message: 'Invalid report status',
                });
            }

            filter.status = status;
        }

        // -------------------------------------------------
        // Type filter
        // -------------------------------------------------

        if (type) {
            if (!REPORT_TYPES.includes(type)) {
                return res.status(400).json({
                    success: false,
                    code: 'INVALID_REPORT_TYPE',
                    message: 'Invalid report type',
                });
            }

            filter.type = type;
        }

        // -------------------------------------------------
        // Sorting
        // -------------------------------------------------

        const sortOption =
            sort === 'oldest'
                ? { createdAt: 1 }
                : { createdAt: -1 };

        const skip =
            (currentPage - 1) * perPage;

        // -------------------------------------------------
        // Query
        // -------------------------------------------------

        const [
            reports,
            total,
        ] = await Promise.all([
            Report.find(filter)
                .populate({
                    path: 'reportedBy',
                    select:
                        'name slug email image role',
                })
                .populate({
                    path: 'reviewedBy',
                    select:
                        'name slug email image role',
                })
                .sort(sortOption)
                .skip(skip)
                .limit(perPage)
                .lean(),

            Report.countDocuments(filter),
        ]);

        return res.json({
            success: true,
            reports,
            total,
            page: currentPage,
            totalPages: Math.ceil(
                total / perPage,
            ),
        });
    } catch (error) {
        console.error(
            'Get All Reports Error:',
            error,
        );

        return res.status(500).json({
            success: false,
            code: 'GET_REPORTS_ERROR',
            message: 'Failed to get reports',
        });
    }
};

// =====================================================
// GET /reports/:reportId
// =====================================================

const getReportById = async (req, res) => {
    try {
        const { reportId } = req.params;

        if (!isValidObjectId(reportId)) {
            return res.status(400).json({
                success: false,
                code: 'INVALID_REPORT_ID',
                message: 'Invalid report ID',
            });
        }

        const report = await Report.findById(
            reportId,
        )
            .populate({
                path: 'reportedBy',
                select:
                    'name slug email image role',
            })
            .populate({
                path: 'reviewedBy',
                select:
                    'name slug email image role',
            })
            .lean();

        if (!report) {
            return res.status(404).json({
                success: false,
                code: 'REPORT_NOT_FOUND',
                message: 'Report not found',
            });
        }

        return res.json({
            success: true,
            report,
        });
    } catch (error) {
        console.error(
            'Get Report By ID Error:',
            error,
        );

        return res.status(500).json({
            success: false,
            code: 'GET_REPORT_ERROR',
            message: 'Failed to get report',
        });
    }
};

// =====================================================
// Execute Report Action
// =====================================================

const executeReportAction = async (
    report,
    req,
) => {
    switch (report.action) {
        // =================================================
        // WARN
        // =================================================

        case 'warn': {
            let userId = null;

            // -------------------------------------------------
            // Reported user
            // -------------------------------------------------

            if (report.type === 'user') {
                userId = report.targetId;
            }

            // -------------------------------------------------
            // Reported post
            // -------------------------------------------------

            else if (report.type === 'post') {
                const post =
                    await Post.findById(
                        report.targetId,
                    )
                        .select('seller')
                        .lean();

                if (!post) {
                    throw new Error(
                        'TARGET_POST_NOT_FOUND',
                    );
                }

                userId = post.seller;
            }

            // -------------------------------------------------
            // Reported message
            // -------------------------------------------------

            else if (
                report.type === 'message'
            ) {
                const message =
                    await Message.findById(
                        report.targetId,
                    )
                        .select('from')
                        .lean();

                if (!message) {
                    throw new Error(
                        'TARGET_MESSAGE_NOT_FOUND',
                    );
                }

                userId = message.from;
            }

            // -------------------------------------------------
            // Comment
            // -------------------------------------------------

            else if (
                report.type === 'comment'
            ) {
                throw new Error(
                    'COMMENT_MODEL_NOT_CONFIGURED',
                );
            }

            if (!userId) {
                throw new Error(
                    'WARN_TARGET_NOT_SUPPORTED',
                );
            }

            const user =
                await User.findByIdAndUpdate(
                    userId,
                    {
                        $inc: {
                            warningCount: 1,
                        },
                    },
                    {
                        new: true,
                    },
                )
                    .select(
                        '_id warningCount',
                    )
                    .lean();

            if (!user) {
                throw new Error(
                    'TARGET_USER_NOT_FOUND',
                );
            }

            return {
                type: 'warn',
                userId: user._id,
                warningCount:
                    user.warningCount,
            };
        }

        // =================================================
        // BLOCK USER
        // =================================================

        case 'block_user': {
            let userId = null;

            // -------------------------------------------------
            // Report user directly
            // -------------------------------------------------

            if (report.type === 'user') {
                userId = report.targetId;
            }

            // -------------------------------------------------
            // Report post owner
            // -------------------------------------------------

            else if (report.type === 'post') {
                const post =
                    await Post.findById(
                        report.targetId,
                    )
                        .select('seller')
                        .lean();

                if (!post) {
                    throw new Error(
                        'TARGET_POST_NOT_FOUND',
                    );
                }

                userId = post.seller;
            }

            // -------------------------------------------------
            // Report message sender
            // -------------------------------------------------

            else if (
                report.type === 'message'
            ) {
                const message =
                    await Message.findById(
                        report.targetId,
                    )
                        .select('from')
                        .lean();

                if (!message) {
                    throw new Error(
                        'TARGET_MESSAGE_NOT_FOUND',
                    );
                }

                userId = message.from;
            }

            else if (
                report.type === 'comment'
            ) {
                throw new Error(
                    'COMMENT_MODEL_NOT_CONFIGURED',
                );
            }

            if (!userId) {
                throw new Error(
                    'BLOCK_TARGET_NOT_SUPPORTED',
                );
            }

            const blockerId =
                getUserId(req);

            if (!blockerId) {
                throw new Error(
                    'AUTHENTICATION_REQUIRED',
                );
            }

            // -------------------------------------------------
            // Prevent self block
            // -------------------------------------------------

            if (
                String(blockerId) ===
                String(userId)
            ) {
                throw new Error(
                    'SELF_BLOCK_NOT_ALLOWED',
                );
            }

            // -------------------------------------------------
            // Check existing block
            // -------------------------------------------------

            const existingBlock =
                await Block.findOne({
                    blockerId,
                    blockedId: userId,
                });

            if (existingBlock) {
                return {
                    type: 'block_user',
                    userId,
                    alreadyBlocked: true,
                    blockId:
                        existingBlock._id,
                };
            }

            // -------------------------------------------------
            // Create block
            // -------------------------------------------------

            const block =
                await Block.create({
                    blockerId,
                    blockedId: userId,
                    reason:
                        'Blocked by moderation',
                    isPermanent: true,
                    expiresAt: null,
                });

            return {
                type: 'block_user',
                userId,
                blockId: block._id,
                alreadyBlocked: false,
            };
        }

        // =================================================
        // DELETE POST
        // =================================================

        case 'delete_post': {
            if (report.type !== 'post') {
                throw new Error(
                    'ACTION_NOT_SUPPORTED_FOR_REPORT_TYPE',
                );
            }

            const post =
                await Post.findByIdAndDelete(
                    report.targetId,
                );

            if (!post) {
                throw new Error(
                    'TARGET_POST_NOT_FOUND',
                );
            }

            return {
                type: 'delete_post',
                targetId:
                    report.targetId,
            };
        }

        // =================================================
        // DELETE MESSAGE
        // =================================================

        case 'delete_message': {
            if (
                report.type !== 'message'
            ) {
                throw new Error(
                    'ACTION_NOT_SUPPORTED_FOR_REPORT_TYPE',
                );
            }

            const message =
                await Message.findByIdAndDelete(
                    report.targetId,
                );

            if (!message) {
                throw new Error(
                    'TARGET_MESSAGE_NOT_FOUND',
                );
            }

            return {
                type: 'delete_message',
                targetId:
                    report.targetId,
            };
        }

        // =================================================
        // DELETE COMMENT
        // =================================================

        case 'delete_comment': {
            throw new Error(
                'COMMENT_MODEL_NOT_CONFIGURED',
            );
        }

        // =================================================
        // IGNORE
        // =================================================

        case 'ignore': {
            return {
                type: 'ignore',
            };
        }

        // =================================================
        // INVALID
        // =================================================

        default:
            throw new Error(
                'INVALID_REPORT_ACTION',
            );
    }
};

// =====================================================
// PATCH /reports/:reportId
// Admin / Moderator
// =====================================================

const updateReport = async (
    req,
    res,
) => {
    try {
        const { reportId } =
            req.params;

        const {
            status,
            adminNote,
            action,
        } = req.body || {};

        // -------------------------------------------------
        // Validate report ID
        // -------------------------------------------------

        if (!isValidObjectId(reportId)) {
            return res.status(400).json({
                success: false,
                code: 'INVALID_REPORT_ID',
                message:
                    'Invalid report ID',
            });
        }

        // -------------------------------------------------
        // Validate status
        // -------------------------------------------------

        if (
            status !== undefined &&
            !REPORT_STATUSES.includes(status)
        ) {
            return res.status(400).json({
                success: false,
                code: 'INVALID_REPORT_STATUS',
                message:
                    'Invalid report status',
            });
        }

        // -------------------------------------------------
        // Validate action
        // -------------------------------------------------

        if (
            action !== undefined &&
            !REPORT_ACTIONS.includes(action)
        ) {
            return res.status(400).json({
                success: false,
                code: 'INVALID_REPORT_ACTION',
                message:
                    'Invalid report action',
            });
        }

        // -------------------------------------------------
        // Find report
        // -------------------------------------------------

        const report =
            await Report.findById(
                reportId,
            );

        if (!report) {
            return res.status(404).json({
                success: false,
                code: 'REPORT_NOT_FOUND',
                message:
                    'Report not found',
            });
        }

        // -------------------------------------------------
        // Important:
        // Don't execute actions on closed reports
        // -------------------------------------------------

        if (
            action !== undefined &&
            ['resolved', 'rejected'].includes(
                report.status,
            )
        ) {
            return res.status(409).json({
                success: false,
                code: 'REPORT_ALREADY_CLOSED',
                message:
                    'This report is already closed',
            });
        }

        // -------------------------------------------------
        // Admin note
        // -------------------------------------------------

        if (
            adminNote !== undefined
        ) {
            report.adminNote =
                typeof adminNote ===
                'string'
                    ? adminNote
                          .trim()
                          .slice(0, 1000)
                    : '';
        }

        // -------------------------------------------------
        // Action
        // -------------------------------------------------

        let actionResult = null;

        if (action !== undefined) {
            // Set action temporarily
            // for executeReportAction
            report.action = action;

            actionResult =
                await executeReportAction(
                    report,
                    req,
                );

            // ---------------------------------------------
            // Every action closes report
            // ---------------------------------------------

            report.status =
                'resolved';
        }
        else if (
            status !== undefined
        ) {
            report.status = status;
        }

        // -------------------------------------------------
        // Review information
        // -------------------------------------------------

        if (
            ['reviewing', 'resolved', 'rejected'].includes(
                report.status,
            )
        ) {
            report.reviewedBy =
                getUserId(req);

            report.reviewedAt =
                new Date();
        }

        // -------------------------------------------------
        // Save
        // -------------------------------------------------

        await report.save();

        // -------------------------------------------------
        // Populate updated report
        // -------------------------------------------------

        const updatedReport =
            await Report.findById(
                report._id,
            )
                .populate({
                    path: 'reportedBy',
                    select:
                        'name slug email image role',
                })
                .populate({
                    path: 'reviewedBy',
                    select:
                        'name slug email image role',
                })
                .lean();

        return res.status(200).json({
            success: true,
            message:
                'Report updated successfully',
            report: updatedReport,
            actionResult,
        });
    } catch (error) {
        console.error(
            'Update Report Error:',
            error,
        );

        const knownErrors = {
            TARGET_POST_NOT_FOUND: {
                status: 404,
                code: 'TARGET_POST_NOT_FOUND',
                message: 'Post not found',
            },

            TARGET_MESSAGE_NOT_FOUND: {
                status: 404,
                code: 'TARGET_MESSAGE_NOT_FOUND',
                message:
                    'Message not found',
            },

            TARGET_USER_NOT_FOUND: {
                status: 404,
                code: 'TARGET_USER_NOT_FOUND',
                message:
                    'Target user not found',
            },

            WARN_TARGET_NOT_SUPPORTED: {
                status: 400,
                code: 'WARN_TARGET_NOT_SUPPORTED',
                message:
                    'Warning is not supported for this report type',
            },

            BLOCK_TARGET_NOT_SUPPORTED: {
                status: 400,
                code: 'BLOCK_TARGET_NOT_SUPPORTED',
                message:
                    'Blocking is not supported for this report type',
            },

            SELF_BLOCK_NOT_ALLOWED: {
                status: 400,
                code: 'SELF_BLOCK_NOT_ALLOWED',
                message:
                    'A user cannot block himself',
            },

            ACTION_NOT_SUPPORTED_FOR_REPORT_TYPE: {
                status: 400,
                code:
                    'ACTION_NOT_SUPPORTED_FOR_REPORT_TYPE',
                message:
                    'This action is not supported for this report type',
            },

            COMMENT_MODEL_NOT_CONFIGURED: {
                status: 501,
                code:
                    'COMMENT_MODEL_NOT_CONFIGURED',
                message:
                    'Comment model is not configured yet',
            },

            INVALID_REPORT_ACTION: {
                status: 400,
                code:
                    'INVALID_REPORT_ACTION',
                message:
                    'Invalid report action',
            },

            AUTHENTICATION_REQUIRED: {
                status: 401,
                code:
                    'AUTHENTICATION_REQUIRED',
                message:
                    'Authentication required',
            },
        };

        const known =
            knownErrors[error.message];

        if (known) {
            return res.status(
                known.status,
            ).json({
                success: false,
                code: known.code,
                message: known.message,
            });
        }

        return res.status(500).json({
            success: false,
            code:
                'REPORT_UPDATE_ERROR',
            message:
                'Failed to update report',
            error:
                process.env.NODE_ENV ===
                'development'
                    ? error.message
                    : undefined,
        });
    }
};

// =====================================================
// DELETE /reports/:reportId
// Admin
// =====================================================

const deleteReport = async (
    req,
    res,
) => {
    try {
        const { reportId } =
            req.params;

        if (!isValidObjectId(reportId)) {
            return res.status(400).json({
                success: false,
                code: 'INVALID_REPORT_ID',
                message:
                    'Invalid report ID',
            });
        }

        const report =
            await Report.findByIdAndDelete(
                reportId,
            );

        if (!report) {
            return res.status(404).json({
                success: false,
                code: 'REPORT_NOT_FOUND',
                message:
                    'Report not found',
            });
        }

        return res.json({
            success: true,
            message:
                'Report deleted successfully',
        });
    } catch (error) {
        console.error(
            'Delete Report Error:',
            error,
        );

        return res.status(500).json({
            success: false,
            code:
                'DELETE_REPORT_ERROR',
            message:
                'Failed to delete report',
        });
    }
};

// =====================================================
// GET /reports/stats
// =====================================================

const getReportStats = async (
    req,
    res,
) => {
    try {
        const [
            total,
            pending,
            reviewing,
            resolved,
            rejected,
        ] = await Promise.all([
            Report.countDocuments(),

            Report.countDocuments({
                status: 'pending',
            }),

            Report.countDocuments({
                status: 'reviewing',
            }),

            Report.countDocuments({
                status: 'resolved',
            }),

            Report.countDocuments({
                status: 'rejected',
            }),
        ]);

        const [
            byTypeResult,
            byReasonResult,
        ] = await Promise.all([
            Report.aggregate([
                {
                    $group: {
                        _id: '$type',
                        count: {
                            $sum: 1,
                        },
                    },
                },
            ]),

            Report.aggregate([
                {
                    $group: {
                        _id: '$reason',
                        count: {
                            $sum: 1,
                        },
                    },
                },
            ]),
        ]);

        const types = [
            'user',
            'post',
            'message',
            'comment',
        ];

        const reasons = [
            'spam',
            'harassment',
            'inappropriate_content',
            'fake_account',
            'scam',
            'violence',
            'hate_speech',
            'nudity',
            'copyright',
            'other',
        ];

        const byType = {};

        types.forEach((type) => {
            byType[type] = 0;
        });

        byTypeResult.forEach((item) => {
            if (
                item._id &&
                Object.prototype.hasOwnProperty.call(
                    byType,
                    item._id,
                )
            ) {
                byType[item._id] =
                    item.count;
            }
        });

        const byReason = {};

        reasons.forEach((reason) => {
            byReason[reason] = 0;
        });

        byReasonResult.forEach(
            (item) => {
                if (
                    item._id &&
                    Object.prototype.hasOwnProperty.call(
                        byReason,
                        item._id,
                    )
                ) {
                    byReason[item._id] =
                        item.count;
                }
            },
        );

        return res.json({
            success: true,
            total,
            pending,
            reviewing,
            resolved,
            rejected,
            byType,
            byReason,
        });
    } catch (error) {
        console.error(
            'Get Report Stats Error:',
            error,
        );

        return res.status(500).json({
            success: false,
            code:
                'REPORT_STATS_ERROR',
            message:
                'Failed to get report statistics',
        });
    }
};

// =====================================================
// Exports
// =====================================================

module.exports = {
    // User
    createReport,
    checkUserReported,
    getMyReports,

    // Admin / Moderator
    getAllReports,
    getReportById,
    getReportStats,
    updateReport,

    // Admin
    deleteReport,

    // Internal
    executeReportAction,
};