const User = require('../models/User');
const { notifyUser } = require('./notify');

async function notifyAdminsAndModerators(
    io,
    post,
) {
    if (!post?._id) {
        console.error(
            '[admin-notify] Post ID is missing',
        );

        return;
    }

    try {
        const admins =
            await User.find({
                role: {
                    $in: [
                        'Admin',
                        'Moderator',
                    ],
                },

                accountStatus: {
                    $ne: 'disabled',
                },
            })
                .select('_id role')
                .lean();

        console.log(
            `[admin-notify] Found ${admins.length} admins/moderators`,
        );

        if (!admins.length) {
            return;
        }

        await Promise.allSettled(
            admins.map((admin) =>
                notifyUser(
                    io,
                    admin._id,
                    {
                        type:
                            'post_pending_review',

                        title:
                            'إعلان جديد بانتظار المراجعة 🔔',

                        body: `إعلان "${post.product_name}" جديد ويحتاج إلى موافقتك.`,

                        postId: post._id,

                        data: {
                            category:
                                post.category || '',

                            subcategory:
                                post.subcategory ||
                                '',

                            brand:
                                post.brand || '',

                            productName:
                                post.product_name ||
                                '',
                        },
                    },
                ),
            ),
        );
    } catch (error) {
        console.error(
            '[admin-notify] Failed:',
            error,
        );
    }
}

module.exports = {
    notifyAdminsAndModerators,
};