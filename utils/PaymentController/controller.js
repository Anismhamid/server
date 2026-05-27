// This controller handles Stripe webhook events for featured ad payments.
// It listens for 'checkout.session.completed' events and activates the corresponding ad.

const express = require('express');
const Stripe = require('stripe');
const FeaturedAd = require('../../models/FeaturedAd');

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/', async (req, res) => {

    console.log('=== WEBHOOK CALLED ===');

    try {

        const event = stripe.webhooks.constructEvent(
            req.body,
            req.headers['stripe-signature'],
            process.env.STRIPE_WEBHOOK_SECRET
        );

        console.log("Event:", event.type);

        if (event.type === 'checkout.session.completed') {

            const session = event.data.object;

            const { userId, listingId, type, startDate, endDate } =
                session.metadata || {};

            const existingAd = await FeaturedAd.findOne({
                stripeSessionId: session.id,
            });

            if (!existingAd) {

                await FeaturedAd.create({
                    userId,
                    listingId,
                    type,
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    isActive: true,
                    paid: true,
                    stripeSessionId: session.id,
                });

                console.log('✅ Ad activated');
            }
        }

        res.json({ received: true });

    } catch (err) {
        console.error('Webhook Error:', err.message);
        return res.status(400).send(err.message);
    }
});

module.exports = router;