const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const FeaturedAd = require('../models/FeaturedAd');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post(
    '/',
    express.raw({ type: 'application/json' }),
    async (req, res) => {
        const sig = req.headers['stripe-signature'];

        let event;

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET,
            );
        } catch (err) {
            console.log('Webhook Error:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // 🎯 الدفع نجح
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;

            const { userId, listingId, type, startDate, endDate } =
                session.metadata;

            await FeaturedAd.create({
                userId,
                listingId,
                type,
                startDate,
                endDate,
                isActive: true,
            });

            console.log('✅ Ad activated after payment');
        }

        res.json({ received: true });
    },
);

module.exports = router;
