// controllers/postReview.js
const Post = require('../models/post.model'); // ⚠️ عدّل المسار/الاسم
const { notifyUser } = require('../services/notify');

/**
 * PATCH /posts/:id/review
 * body: { action: 'approve' | 'reject', reason?: string }
 * Route:
 *   router.patch('/:id/review', auth, requireRole('Admin', 'Moderator'), reviewPost);
 */
exports.reviewPost = async (req, res) => {
    try {
        const { action } = req.body;
        const reason = String(req.body.reason || '').trim();

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ message: 'action must be approve or reject' });
        }
        if (action === 'reject' && reason.length < 3) {
            return res.status(400).json({ message: 'سبب الرفض مطلوب' });
        }

        const isApprove = action === 'approve';

        // شرط status:'pending' = العملية atomic. لو مشرفين ضغطوا بنفس اللحظة،
        // واحد بس بينجح، فالمستخدم بيوصله إشعار واحد.
        const post = await Post.findOneAndUpdate(
            { _id: req.params.id, status: 'pending' },
            {
                $set: {
                    status: isApprove ? 'approved' : 'rejected',
                    rejectionReason: isApprove ? '' : reason,
                    reviewedBy: req.user._id, // ⚠️ حسب شكل req.user عندك
                    reviewedAt: new Date(),
                },
            },
            { new: true },
        );

        if (!post) {
            return res
                .status(409)
                .json({ message: 'الإعلان غير موجود أو تمت مراجعته مسبقًا' });
        }

        // ما نستنى الإشعار عشان نرد على المشرف
        const authorId = post.user_id; // ⚠️ اسم حقل صاحب الإعلان عندك
        notifyUser(authorId, {
            type: isApprove ? 'post_approved' : 'post_rejected',
            title: isApprove ? 'تم قبول إعلانك ✅' : 'تم رفض إعلانك',
            body: isApprove
                ? `إعلان "${post.product_name}" صار ظاهر للجميع.`
                : `إعلان "${post.product_name}" ما انقبل. السبب: ${reason}`,
            postId: post._id,
        }).catch((err) => console.error('[reviewPost] notify failed:', err));

        return res.json(post);
    } catch (err) {
        console.error('[reviewPost]', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

/* ────────────────────────────────────────────────────────────────────────────
   باقي التعديلات المطلوبة بالسيرفر (مش بهالملف):

   1) Post schema:
      status:          { type: String, enum: ['pending','approved','rejected'], default: 'pending', index: true },
      rejectionReason: { type: String, default: '' },
      reviewedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reviewedAt:      Date,

   2) عند إنشاء الإعلان (POST /posts): المشرف/المدير ينشر مباشرة
      const isStaff = ['Admin', 'Moderator'].includes(req.user.role);
      status: isStaff ? 'approved' : 'pending'

   3) ⚠️ الأهم: كل قوائم الإعلانات العامة (الهوم، الفئات، البحث، sitemap، الإعلانات المميزة)
      لازم تفلتر status: 'approved'. وصفحة "إعلاناتي" بتعرض كل الحالات لصاحبها.

   4) Migration لمرة وحدة، للإعلانات الموجودة، وإلا بتختفي كلها:
      db.posts.updateMany({ status: { $exists: false } }, { $set: { status: 'approved' } })

   5) (اختياري) إشعار للمشرفين بإعلان جديد بانتظار المراجعة:
      const staff = await User.find({ role: { $in: ['Admin','Moderator'] } }).select('_id');
      staff.forEach(s => notifyUser(s._id, { type: 'post_pending_review', title: 'إعلان جديد بانتظار المراجعة', body: post.product_name, postId: post._id }));
   ──────────────────────────────────────────────────────────────────────────── */