const { v2: cloudinary } = require('cloudinary');
const express = require('express');

const router = express.Router();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post('/delete', async (req, res) => {
    const { publicId } = req.body;

    if (!publicId) {
        return res.status(400).json({
            success: false,
            error: 'Missing publicId',
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
            error: err.message,
        });
    }
});

module.exports = router;