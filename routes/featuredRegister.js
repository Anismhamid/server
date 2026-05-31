// routes/featuredRegister.js

const express = require('express');
const router = express.Router();
const Stripe = require('stripe');

const FeaturedAd = require('../models/FeaturedAd');
const Posts = require('../models/post');
const auth = require('../middlewares/auth');
const cron = require('node-cron');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// buy promotion
// router.post('/buy', auth, async (req, res) => {
//     try {
//         const { listingId, type, startDate, endDate } = req.body;

//         const listing = await Posts.findById(listingId);

//         if (!listing) {
//             return res.status(404).json({
//                 message: 'Listing not found',
//             });
//         }

//         const prices = {
//             highlight: 10,
//             top: 25,
//             homepage: 50,
//         };

//         if (!prices[type]) {
//             return res.status(400).json({
//                 message: 'Invalid promotion type',
//             });
//         }

//         const session = await stripe.checkout.sessions.create({
//             payment_method_types: ['card'],
//             mode: 'payment',

//             success_url: `${process.env.CLIENT_URL}/payment/success`,

//             cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,

//             metadata: {
//                 userId: req.payload._id.toString(),
//                 listingId,
//                 type,
//                 startDate,
//                 endDate,
//                 session_id: '{CHECKOUT_SESSION_ID}',
//             },

//             payment_intent_data: {
//                 metadata: {
//                     session_id: '{CHECKOUT_SESSION_ID}',
//                 },
//             },

//             line_items: [
//                 {
//                     price_data: {
//                         currency: 'ils',
//                         product_data: {
//                             name: `Featured Ad ${type}`,
//                         },
//                         unit_amount: prices[type] * 100,
//                     },
//                     quantity: 1,
//                 },
//             ],
//         });

//         res.json({
//             url: session.url,
//         });
//     } catch (err) {
//         console.error(err);

//         res.status(500).json({
//             message: 'Payment failed',
//             error: err.message,
//         });
//     }
// });

router.post('/buy', auth, async (req, res) => {
    try {
        console.log('=== BUY ROUTE ===');

        // Extract user ID (your existing code)
        let userId = null;
        if (req.payload) {
            userId = req.payload._id || req.payload.id || req.payload.userId;
            if (userId && typeof userId === 'object' && userId.$oid) {
                userId = userId.$oid;
            }
            if (userId && userId.toString) {
                userId = userId.toString();
            }
        }

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const { listingId, type, startDate, endDate } = req.body;

        // Validate
        const listing = await Posts.findById(listingId);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        const prices = {
            highlight: 10,
            top: 25,
            homepage: 50,
        };

        if (!prices[type]) {
            return res.status(400).json({ message: 'Invalid promotion type' });
        }

        // Create Stripe session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
            metadata: {
                userId: userId,
                listingId: listingId,
                type: type,
                startDate: startDate,
                endDate: endDate,
            },
            // THIS IS THE KEY FIX - metadata needs to be in payment_intent_data
            payment_intent_data: {
                metadata: {
                    userId: userId,
                    listingId: listingId,
                    type: type,
                    startDate: startDate,
                    endDate: endDate,
                },
            },
            line_items: [
                {
                    price_data: {
                        currency: 'ils',
                        product_data: {
                            name: `Featured Ad - ${type}`,
                            description: `Promote "${listing.product_name || listing.title}"`,
                        },
                        unit_amount: prices[type] * 100,
                    },
                    quantity: 1,
                },
            ],
        });

        console.log('Session created:', session.id);

        res.json({
            url: session.url,
            sessionId: session.id,
        });
    } catch (err) {
        console.error('Payment error:', err);
        res.status(500).json({ message: 'Payment failed', error: err.message });
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
            .populate({
                path: 'listingId',
                select: 'product_name category location price image seller sale discount in_stock brand',
            });

        res.json({ ads });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/featured-ads/highlight
router.get('/highlight', async (req, res) => {
    try {
        const ads = await FeaturedAd.find({
            type: 'highlight',
            isActive: true,
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() },
        })
            .sort({ createdAt: -1 })
            .limit(100)
            .populate({
                path: 'listingId',
                select: 'product_name category location price image seller sale discount in_stock brand',
            });

        res.json({ ads });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/featured-ads/top
router.get('/top', async (req, res) => {
    try {
        const ads = await FeaturedAd.find({
            type: 'top',
            isActive: true,
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() },
        })
            .sort({ createdAt: -1 })
            .limit(100)
            .populate({
                path: 'listingId',
                select: 'product_name category location price image seller sale discount in_stock brand',
            });

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
        const ad = await FeaturedAd.findOneAndDelete({
            _id: adId,
            userId: req.payload._id,
        });

        if (!ad) {
            return res.status(404).json({
                message: 'Ad not found or unauthorized',
            });
        }

        res.status(200).send('success');
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

router.post(
    '/test-webhook',
    express.raw({ type: 'application/json' }),
    (req, res) => {
        console.log('=== TEST WEBHOOK RECEIVED ===');
        console.log('Headers:', req.headers);
        console.log('Body:', req.body?.toString().substring(0, 200));
        console.log('Stripe Signature:', req.headers['stripe-signature']);

        res.json({
            message: 'Webhook test endpoint working',
            headers: req.headers,
            bodyLength: req.body?.length,
        });
    },
);

router.get('/verify-session', async (req, res) => {
    const { session_id } = req.query;
    if (!session_id) {
        return res.status(400).json({ error: 'Missing session_id' });
    }
    try {
        const session = await stripe.checkout.sessions.retrieve(session_id);
        res.json({
            payment_status: session.payment_status,
            customer_email: session.customer_details?.email,
            amount_total: session.amount_total,
        });
    } catch (err) {
        res.status(500).json({ error: 'Invalid session' });
    }
});

module.exports = router;
