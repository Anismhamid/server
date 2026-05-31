// const express = require('express');
// const Stripe = require('stripe');
// const FeaturedAd = require('../../models/FeaturedAd');
// const router = express.Router();
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// router.post('/', async (req, res) => {
//     try {
//         const sig = req.headers['stripe-signature'];

//         const event = stripe.webhooks.constructEvent(
//             req.body,
//             sig,
//             process.env.STRIPE_WEBHOOK_SECRET,
//         );
//         console.log('=== WEBHOOK CALLED ===');
//         console.log('EVENT TYPE:', event.type);

//         if (event.type === 'checkout.session.completed') {
//             console.log('CHECKOUT COMPLETED');
//             const session = event.data.object;
//             console.log('SESSION ID:', session.id);
//             console.log('METADATA:', session.metadata);

//             // Guard 1: must be paid
//             if (session.payment_status !== 'paid') {
//                 return res.json({ received: true });
//             }

//             const { userId, listingId, type, startDate, endDate } =
//                 session.metadata || {};

//             // Guard 2: validate required metadata
//             if (!userId || !listingId || !type) {
//                 console.error(
//                     'Missing required metadata for session:',
//                     session.id,
//                 );
//                 return res.json({ received: true });
//             }

//             // Guard 3: validate dates
//             if (
//                 !startDate ||
//                 !endDate ||
//                 isNaN(Date.parse(startDate)) ||
//                 isNaN(Date.parse(endDate))
//             ) {
//                 console.error(
//                     'Invalid metadata dates for session:',
//                     session.id,
//                 );
//                 return res.json({ received: true });
//             }

//             // Guard 4: idempotency
//             const existingAd = await FeaturedAd.findOne({
//                 stripeSessionId: session.id,
//             });
//             if (existingAd) {
//                 console.log(`⚠️ Duplicate ignored: ${session.id}`);
//                 return res.json({ received: true });
//             }

//             console.log('CREATING FEATURED AD');

//             await FeaturedAd.create({
//                 userId,
//                 listingId,
//                 type,
//                 startDate: new Date(startDate),
//                 endDate: new Date(endDate),
//                 isActive: true,
//                 paid: true,
//                 stripeSessionId: session.id,
//             });
//             console.log('FEATURED AD CREATED');
//             console.log(session.metadata);
//             console.log(`✅ Ad activated for listing ${listingId}`);
//         }

//         res.json({ received: true });
//     } catch (err) {
//         console.error('Webhook Error:', err.message);
//         return res.status(400).send(err.message);
//     }
// });

// module.exports = router;

// utils/PaymentController/controller.js


const Stripe = require('stripe');
const FeaturedAd = require('../../models/FeaturedAd');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    console.log('=== WEBHOOK CALLED ===');

    const sig = req.headers['stripe-signature'];

    try {
        const event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET,
        );

        console.log('EVENT TYPE:', event.type);

        // Handle multiple event types
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            await handleCheckoutSession(session);
        } else if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            console.log('Payment intent succeeded:', paymentIntent.id);

            // Get the checkout session from the payment intent
            if (paymentIntent.metadata?.session_id) {
                const session = await stripe.checkout.sessions.retrieve(
                    paymentIntent.metadata.session_id,
                );
                await handleCheckoutSession(session);
            } else {
                // If no session in metadata, we need to look it up
                console.log('No session_id in payment intent metadata');
            }
        } else if (event.type === 'payment_intent.created') {
            console.log('Payment intent created - waiting for completion');
            // Don't do anything yet, wait for succeeded event
        }

        res.json({ received: true });
    } catch (err) {
        console.error('Webhook Error:', err.message);
        return res.status(400).send(err.message);
    }
};

// Helper function to handle checkout session
async function handleCheckoutSession(session) {
    console.log('Processing checkout session:', session.id);
    console.log('Payment status:', session.payment_status);

    // Only process if payment is paid
    if (session.payment_status !== 'paid') {
        console.log('Payment not paid yet, waiting');
        return;
    }

    const { userId, listingId, type, startDate, endDate } =
        session.metadata || {};

    // Validate required metadata
    if (!userId || !listingId || !type) {
        console.error('Missing required metadata:', {
            userId,
            listingId,
            type,
        });
        return;
    }

    // Check for duplicate
    const existingAd = await FeaturedAd.findOne({
        stripeSessionId: session.id,
    });

    if (existingAd) {
        console.log('⚠️ Duplicate webhook ignored for session:', session.id);
        return;
    }

    // Create featured ad
    await FeaturedAd.create({
        userId: userId.toString(),
        listingId,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: true,
        paid: true,
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent,
    });

    console.log(`✅ Ad activated for listing ${listingId}`);
}
