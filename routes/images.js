const { v2: cloudinary } = require('cloudinary');
const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');

const auth = require('../middlewares/auth');

const router = express.Router();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * POST /images/sign
 * يرجّع توقيع رفع، والمسار والـ tags بيتحددوا من المستخدم المسجّل مش من الـ client
 */
router.post('/sign', auth, (req, res) => {
    try {
        const userId = String(req.user.id || req.user._id);
        const isProfile = req.body.type === 'profile';
        const adId =
            typeof req.body.adId === 'string' &&
            /^[a-zA-Z0-9_-]+$/.test(req.body.adId)
                ? req.body.adId
                : undefined;

        const timestamp = Math.round(Date.now() / 1000);

        const params = isProfile
            ? {
                  timestamp,
                  public_id: `users/${userId}/profile/avatar`,
                  asset_folder: `users/${userId}/profile`,
                  tags: `user_${userId},profile`,
                  overwrite: true,
                  invalidate: true,
              }
            : {
                  timestamp,
                  public_id: `users/${userId}/${crypto.randomUUID()}`,
                  asset_folder: adId
                      ? `users/${userId}/ads/${adId}`
                      : `users/${userId}/ads`,
                  tags: `user_${userId}`,
              };

        const signature = cloudinary.utils.api_sign_request(
            params,
            process.env.CLOUDINARY_API_SECRET,
        );

        return res.json({
            signature,
            apiKey: process.env.CLOUDINARY_API_KEY,
            params,
        });
    } catch (err) {
        console.error('Cloudinary sign error:', err);
        return res
            .status(500)
            .json({ success: false, error: 'Failed to sign upload' });
    }
});


router.patch('/me/image', auth, async (req, res) => {
    try {
        const userId = String(req.payload.id || req.payload._id);
        const { url, alt } = req.body;

        if (typeof url !== 'string') {
            return res.status(400).json({ success: false, error: 'Invalid url' });
        }

        // لازم الرابط يكون من حساب Cloudinary تبعك ولمجلد هالمستخدم
        const allowedPrefix = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`;

        if (!url.startsWith(allowedPrefix) || !url.includes(`/users/${userId}/`)) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            {
                image: {
                    url,
                    alt: typeof alt === 'string' ? alt.slice(0, 100) : '',
                },
            },
            { new: true },
        );

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        return res.json({ success: true, image: user.image });
    } catch (err) {
        console.error('Update image error:', err);
        return res.status(500).json({ success: false, error: 'Failed to update image' });
    }
});

/**
 * POST /images/delete
 * بيحذف بس صور المستخدم نفسه
 */
router.post('/delete', auth, async (req, res) => {
    const { publicId } = req.body;
    const userId = String(req.payload.id || req.payload._id);

    if (!publicId || typeof publicId !== 'string') {
        return res.status(400).json({
            success: false,
            error: 'Missing publicId',
        });
    }

    // الصور الجديدة بتبدأ بـ users/{userId}/
    if (!publicId.startsWith(`users/${userId}/`)) {
        return res.status(403).json({
            success: false,
            error: 'Forbidden',
        });
    }

    try {
        const result = await cloudinary.uploader.destroy(publicId);

        return res.json({
            success: true,
            result,
        });
    } catch (err) {
        console.error('Cloudinary delete error:', err);

        return res.status(500).json({
            success: false,
            error: 'Failed to delete image',
        });
    }
});

module.exports = router;
