const express = require('express');
const Stripe = require('stripe');
const FeaturedAd = require('../../models/FeaturedAd');
const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/', async (req, res) => {
    try {
        const sig = req.headers['stripe-signature'];

        const event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET,
        );

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;

            // Guard 1: must be paid
            if (session.payment_status !== 'paid') {
                return res.json({ received: true });
            }

            const { userId, listingId, type, startDate, endDate } =
                session.metadata || {};

            // Guard 2: validate required metadata
            if (!userId || !listingId || !type) {
                console.error(
                    'Missing required metadata for session:',
                    session.id,
                );
                return res.json({ received: true });
            }

            // Guard 3: validate dates
            if (
                !startDate ||
                !endDate ||
                isNaN(Date.parse(startDate)) ||
                isNaN(Date.parse(endDate))
            ) {
                console.error(
                    'Invalid metadata dates for session:',
                    session.id,
                );
                return res.json({ received: true });
            }

            // Guard 4: idempotency
            const existingAd = await FeaturedAd.findOne({
                stripeSessionId: session.id,
            });
            if (existingAd) {
                console.log(`⚠️ Duplicate ignored: ${session.id}`);
                return res.json({ received: true });
            }

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

            console.log(`✅ Ad activated for listing ${listingId}`);
        }

        res.json({ received: true });
    } catch (err) {
        console.error('Webhook Error:', err.message);
        return res.status(400).send(err.message);
    }
});



module.exports = router;
