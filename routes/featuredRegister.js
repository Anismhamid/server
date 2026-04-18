const express = require('express');
const router = express.Router();

const FeaturedAd = require('../models/FeaturedAd');
const Posts = require('../models/post');
const auth = require('../middlewares/auth');

// buy promotion
router.post('/buy', auth, async (req, res) => {
    try {
        const { listingId, type, startDate, endDate } = req.body;

        // Check if listin exists
        const listing = await Posts.find({ listingId: listingId });
        if (!listing)
            return res.status(404).json({ message: 'Listing not found' });

        // التحقق من عدم وجود homepage مكرر نشط
        if (type === 'homepage') {
            const activeHomepage = await FeaturedAd.countDocuments({
                type: 'homepage',
                isActive: true,
                startDate: { $lte: new Date(endDate) },
                endDate: { $gte: new Date(startDate) },
            });

            if (activeHomepage >= 8) {
                return res
                    .status(400)
                    .json({ message: 'Maximum 8 homepage ads allowed' });
            }
        }

        const ad = new FeaturedAd({
            listingId,
            userId: req.payload._id,
            type,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            isActive: true,
        });

        await ad.save();

        res.json({ message: 'Featured Ad purchased successfully', ad });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/featured-ads/me
router.get('/me', auth, async (req, res) => {
    const userId = req.payload._id;
    try {
        const ads = await FeaturedAd.find({ userId })
            .populate('listingId')
            .sort({ createdAt: -1 });
        const activeCounts = { homepage: 0, top: 0, highlight: 0 };
        ads.forEach((ad) => {
            if (ad.isActive) {
                activeCounts[ad.type.toLowerCase()]++;
            }
        });

        res.status(200).json({ ads, activeCounts });
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

// GET /api/featured-ads/homepage
router.get('/homepage', async (req, res) => {
    try {
        const ads = await FeaturedAd.find({
            type: 'homepage',
            isActive: true,
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() },
        })
            .sort({ createdAt: -1 })
            .limit(100)
            .populate('listingId');

        res.json({ ads });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/featured-ads/delete
router.delete(`/delete/:adId`, auth, async (req, res) => {
    const { adId } = req.params;
    try {
        const ad = await FeaturedAd.findOneAndDelete({ _id: adId });
        if (!ad) return res.status(404).send('This listing is not found');

        res.status(200).send('success');
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

module.exports = router;
