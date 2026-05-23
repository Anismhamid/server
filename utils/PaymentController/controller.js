// utils/PaymentController/controller.js

const express = require('express');
const Stripe = require('stripe');
const FeaturedAd = require('../../models/FeaturedAd');

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20',
});

router.post('/', async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET,
        );
    } catch (err) {
        console.error('Webhook:', err.message);

        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        const { userId, listingId, type, startDate, endDate } =
            session.metadata || {};

        if (!userId || !listingId || !type) {
            return res.status(400).send('Missing metadata');
        }

        const existingAd = await FeaturedAd.findOne({
            stripeSessionId: session.id,
        });

        if (existingAd) {
            return res.json({
                received: true,
            });
        }

        await FeaturedAd.create({
            userId,
            listingId,
            type,
            startDate,
            endDate,
            isActive: true,
            paid: true,
            stripeSessionId: session.id,
        });
    }

    res.json({
        received: true,
    });
});

module.exports = router;
