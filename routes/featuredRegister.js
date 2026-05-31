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
router.post('/buy', auth, async (req, res) => {
    try {
        console.log('=== BUY ROUTE ===');
        console.log('Auth payload:', JSON.stringify(req.payload, null, 2));

        // Extract user ID - your JWT likely has 'id' or '_id' field
        let userId = null;

        if (req.payload) {
            // Try common field names
            if (req.payload._id) {
                userId = req.payload._id;
                console.log('Found userId in _id:', userId);
            } else if (req.payload.id) {
                userId = req.payload.id;
                console.log('Found userId in id:', userId);
            } else if (req.payload.userId) {
                userId = req.payload.userId;
                console.log('Found userId in userId:', userId);
            }

            // Handle MongoDB ObjectId format (if it has $oid)
            if (userId && typeof userId === 'object' && userId.$oid) {
                userId = userId.$oid;
                console.log('Extracted $oid:', userId);
            }

            // Convert to string if needed
            if (userId && typeof userId === 'object' && userId.toString) {
                userId = userId.toString();
                console.log('Converted to string:', userId);
            }
        }

        console.log('Final userId:', userId);
        console.log('UserId type:', typeof userId);

        // If still no userId, return error
        if (!userId) {
            console.error(
                'No user ID found. Payload keys:',
                Object.keys(req.payload || {}),
            );
            return res.status(401).json({
                message: 'Authentication failed - User ID not found in token',
                payloadKeys: Object.keys(req.payload || {}),
            });
        }

        const { listingId, type, startDate, endDate } = req.body;
        console.log('Request body:', { listingId, type, startDate, endDate });

        // Validate required fields
        if (!listingId) {
            return res.status(400).json({ message: 'Listing ID is required' });
        }

        if (!type) {
            return res
                .status(400)
                .json({ message: 'Promotion type is required' });
        }

        if (!startDate || !endDate) {
            return res
                .status(400)
                .json({ message: 'Start date and end date are required' });
        }

        // Find the listing
        const listing = await Posts.findById(listingId);

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        console.log('Listing userId:', listing.userId);
        console.log('Listing userId type:', typeof listing.userId);

        // Convert listing.userId to string for comparison
        let listingUserId = listing.userId;
        if (listingUserId && listingUserId.toString) {
            listingUserId = listingUserId.toString();
        }

        const authUserId = userId.toString();

        console.log('Comparing:', { listingUserId, authUserId });

        // Define prices
        const prices = {
            highlight: 10,
            top: 25,
            homepage: 50,
        };

        if (!prices[type]) {
            return res.status(400).json({ message: 'Invalid promotion type' });
        }

        // Validate ownership
        if (listingUserId !== authUserId) {
            console.error('Ownership check failed!');
            return res.status(403).json({
                message: 'You can only promote your own listings',
                listingOwner: listingUserId,
                yourId: authUserId,
            });
        }

        console.log('Creating Stripe session...');

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
            metadata: {
                userId: authUserId,
                listingId: listingId.toString(),
                type: type,
                startDate: startDate,
                endDate: endDate,
            },
            line_items: [
                {
                    price_data: {
                        currency: 'ils',
                        product_data: {
                            name: `Featured Ad - ${type}`,
                            description: `Promote "${listing.product_name || listing.title}" on ${type} position`,
                        },
                        unit_amount: prices[type] * 100,
                    },
                    quantity: 1,
                },
            ],
        });

        console.log('Stripe session created:', session.id);

        res.json({
            url: session.url,
            sessionId: session.id,
        });
    } catch (err) {
        console.error('Payment creation error:', err);
        res.status(500).json({
            message: 'Payment failed',
            error: err.message,
            stack:
                process.env.NODE_ENV === 'development' ? err.stack : undefined,
        });
    }
});

// GET /api/featured-ads/me
// router.get('/me', auth, async (req, res) => {
//     const userId = req.payload._id;
//     try {
//         const ads = await FeaturedAd.find({ userId })
//             .populate('listingId')
//             .sort({ createdAt: -1 });
//         const activeCounts = { homepage: 0, top: 0, highlight: 0 };
//         ads.forEach((ad) => {
//             if (ad.isActive) {
//                 activeCounts[ad.type.toLowerCase()]++;
//             }
//         });

//         res.status(200).json({ ads, activeCounts });
//     } catch (err) {
//         console.error(err);
//         res.status(500).send(err);
//     }
// });
router.get('/me', auth, async (req, res) => {
    // Extract user ID using same logic
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

    try {
        const ads = await FeaturedAd.find({ userId })
            .populate('listingId')
            .sort({ createdAt: -1 });

        const activeCounts = { homepage: 0, top: 0, highlight: 0 };
        const now = new Date();

        ads.forEach((ad) => {
            if (ad.isActive && ad.endDate >= now && ad.startDate <= now) {
                const typeLower = ad.type.toLowerCase();
                if (activeCounts[typeLower] !== undefined) {
                    activeCounts[typeLower]++;
                }
            }
        });

        res.status(200).json({ ads, activeCounts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET /api/featured-ads/homepage
router.get('/homepage', async (req, res) => {
    try {
        const now = new Date();
        const ads = await FeaturedAd.find({
            type: 'homepage',
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now },
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

// DELETE /api/featured-ads/delete/:adId
router.delete('/delete/:adId', auth, async (req, res) => {
    // Extract user ID using same logic
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

    const { adId } = req.params;

    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    try {
        const ad = await FeaturedAd.findOneAndDelete({
            _id: adId,
            userId: userId,
        });

        if (!ad) {
            return res.status(404).json({
                message: 'Ad not found or unauthorized',
            });
        }

        res.status(200).json({ message: 'Ad deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET /api/featured-ads/delete
// router.delete(`/delete/:adId`, auth, async (req, res) => {
//     const { adId } = req.params;
//     try {
//         const ad = await FeaturedAd.findOneAndDelete({
//             _id: adId,
//             userId: req.payload._id,
//         });

//         if (!ad) {
//             return res.status(404).json({
//                 message: 'Ad not found or unauthorized',
//             });
//         }

//         res.status(200).send('success');
//     } catch (err) {
//         console.error(err);
//         res.status(500).send(err);
//     }
// });

// Debug endpoint to see JWT structure
router.get('/debug-token', auth, (req, res) => {
    res.json({
        payload: req.payload,
        userIdFields: {
            _id: req.payload?._id,
            id: req.payload?.id,
            userId: req.payload?.userId,
            toString: req.payload?._id?.toString
                ? req.payload._id.toString()
                : null,
        },
        allKeys: Object.keys(req.payload || {}),
        payloadType: typeof req.payload,
    });
});
module.exports = router;
