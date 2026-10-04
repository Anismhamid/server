// routes/posts.review.js
// ⚠️ مش ملف جديد تركّبه: انسخ الـ handlers الاثنين وبدّل بيهم /:postId/approve و /:postId/reject
// داخل ملف الـ routes الحالي. وأضف فوق الملف:
//     const { notifyUser } = require('../services/notify');
//
// القيم عندك: pending | accepted | rejected  (مو approved).

// ─── APPROVE ────────────────────────────────────────────────────────────────
router.patch(
    '/:postId/approve',
    auth,
    requireRole('Admin', 'Moderator'),
    async (req, res) => {
        try {
            // 'before' عشان نعرف الحالة السابقة: لو كان accepted أصلًا ما نبعت إشعار مكرر
            const before = await Posts.findByIdAndUpdate(
                req.params.postId,
                {
                    $set: {
                        status: 'accepted',
                        rejectionReason: '',
                        reviewedBy: req.payload._id,
                        reviewedAt: new Date(),
                    },
                },
                { returnDocument: 'before', runValidators: true },
            ).lean();

            if (!before) {
                return res.status(404).json({ message: 'Post not found' });
            }

            const post = { ...before, status: 'accepted' };

            if (before.status !== 'accepted') {
                invalidateSitemapCache();

                const io = req.app.get('io');

                // إشعار لصاحب الإعلان (seller هون ObjectId لأنه lean)
                notifyUser(io, post.seller, {
                    type: 'post_approved',
                    title: 'تم قبول إعلانك ✅',
                    body: `إعلان "${post.product_name}" صار ظاهر للجميع.`,
                    postId: post._id,
                }).catch((err) =>
                    console.error('[approve] notify failed:', err),
                );

                // الكلاينت (useSocketEvents) بيسمع على 'product:new' مو 'post:new'.
                // هلأ بنبعته بعد القبول بس، مو عند الإنشاء.
                io?.emit('product:new', post);
            }

            return res.status(200).json({
                message: 'Post approved successfully',
                post,
            });
        } catch (error) {
            console.error('Approve post error:', error);
            return res.status(500).json({ message: 'Failed to approve post' });
        }
    },
);

// ─── REJECT ─────────────────────────────────────────────────────────────────
// body (اختياري): { reason: string }
router.patch(
    '/:postId/reject',
    auth,
    requireRole('Admin', 'Moderator'),
    async (req, res) => {
        try {
            const reason = String(req.body?.reason || '').trim();

            const before = await Posts.findByIdAndUpdate(
                req.params.postId,
                {
                    $set: {
                        status: 'rejected',
                        rejectionReason: reason,
                        reviewedBy: req.payload._id,
                        reviewedAt: new Date(),
                    },
                },
                { returnDocument: 'before', runValidators: true },
            ).lean();

            if (!before) {
                return res.status(404).json({ message: 'Post not found' });
            }

            const post = { ...before, status: 'rejected' };

            if (before.status !== 'rejected') {
                invalidateSitemapCache();

                notifyUser(req.app.get('io'), post.seller, {
                    type: 'post_rejected',
                    title: 'تم رفض إعلانك',
                    body: reason
                        ? `إعلان "${post.product_name}" ما انقبل. السبب: ${reason}`
                        : `إعلان "${post.product_name}" ما انقبل. تواصل مع الدعم لمعرفة السبب.`,
                    postId: post._id,
                }).catch((err) =>
                    console.error('[reject] notify failed:', err),
                );
            }

            return res.status(200).json({
                message: 'Post rejected successfully',
                post,
            });
        } catch (error) {
            console.error('Reject post error:', error);
            return res.status(500).json({ message: 'Failed to reject post' });
        }
    },
);