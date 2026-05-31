// // const express = require('express');
// // const Stripe = require('stripe');
// // const FeaturedAd = require('../../models/FeaturedAd');
// // const router = express.Router();
// // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// // router.post('/', async (req, res) => {
// //     try {
// //         const sig = req.headers['stripe-signature'];

// //         const event = stripe.webhooks.constructEvent(
// //             req.body,
// //             sig,
// //             process.env.STRIPE_WEBHOOK_SECRET,
// //         );
// //         console.log('=== WEBHOOK CALLED ===');
// //         console.log('EVENT TYPE:', event.type);

// //         if (event.type === 'checkout.session.completed') {
// //             console.log('CHECKOUT COMPLETED');
// //             const session = event.data.object;
// //             console.log('SESSION ID:', session.id);
// //             console.log('METADATA:', session.metadata);

// //             // Guard 1: must be paid
// //             if (session.payment_status !== 'paid') {
// //                 return res.json({ received: true });
// //             }

// //             const { userId, listingId, type, startDate, endDate } =
// //                 session.metadata || {};

// //             // Guard 2: validate required metadata
// //             if (!userId || !listingId || !type) {
// //                 console.error(
// //                     'Missing required metadata for session:',
// //                     session.id,
// //                 );
// //                 return res.json({ received: true });
// //             }

// //             // Guard 3: validate dates
// //             if (
// //                 !startDate ||
// //                 !endDate ||
// //                 isNaN(Date.parse(startDate)) ||
// //                 isNaN(Date.parse(endDate))
// //             ) {
// //                 console.error(
// //                     'Invalid metadata dates for session:',
// //                     session.id,
// //                 );
// //                 return res.json({ received: true });
// //             }

// //             // Guard 4: idempotency
// //             const existingAd = await FeaturedAd.findOne({
// //                 stripeSessionId: session.id,
// //             });
// //             if (existingAd) {
// //                 console.log(`⚠️ Duplicate ignored: ${session.id}`);
// //                 return res.json({ received: true });
// //             }

// //             console.log('CREATING FEATURED AD');

// //             await FeaturedAd.create({
// //                 userId,
// //                 listingId,
// //                 type,
// //                 startDate: new Date(startDate),
// //                 endDate: new Date(endDate),
// //                 isActive: true,
// //                 paid: true,
// //                 stripeSessionId: session.id,
// //             });
// //             console.log('FEATURED AD CREATED');
// //             console.log(session.metadata);
// //             console.log(`✅ Ad activated for listing ${listingId}`);
// //         }

// //         res.json({ received: true });
// //     } catch (err) {
// //         console.error('Webhook Error:', err.message);
// //         return res.status(400).send(err.message);
// //     }
// // });

// // module.exports = router;

// // utils/PaymentController/controller.js

// const Stripe = require('stripe');
// const FeaturedAd = require('../../models/FeaturedAd');
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// module.exports = async (req, res) => {
//     console.log('=== WEBHOOK CALLED ===');
//     console.log('Event timestamp:', new Date().toISOString());

//     const sig = req.headers['stripe-signature'];

//     try {
//         const event = stripe.webhooks.constructEvent(
//             req.body,
//             sig,
//             process.env.STRIPE_WEBHOOK_SECRET,
//         );

//         console.log('EVENT TYPE:', event.type);

//         // Handle payment_intent.succeeded (this is what you're receiving)
//         if (event.type === 'payment_intent.succeeded') {
//             const paymentIntent = event.data.object;
//             console.log('✅ Payment succeeded for:', paymentIntent.id);

//             // Get metadata from payment intent
//             const { userId, listingId, type, startDate, endDate } =
//                 paymentIntent.metadata || {};

//             console.log('Metadata:', {
//                 userId,
//                 listingId,
//                 type,
//                 startDate,
//                 endDate,
//             });

//             if (!userId || !listingId || !type) {
//                 console.error('Missing metadata in payment intent');
//                 return res.json({ received: true });
//             }

//             // Check for duplicate using payment intent ID
//             const existingAd = await FeaturedAd.findOne({
//                 stripePaymentIntentId: paymentIntent.id,
//             });

//             if (existingAd) {
//                 console.log(
//                     '⚠️ Duplicate webhook ignored for payment intent:',
//                     paymentIntent.id,
//                 );
//                 return res.json({ received: true });
//             }

//             // Create the featured ad
//             const newAd = await FeaturedAd.create({
//                 userId: userId.toString(),
//                 listingId: listingId,
//                 type: type,
//                 startDate: new Date(startDate),
//                 endDate: new Date(endDate),
//                 isActive: true,
//                 paid: true,
//                 stripePaymentIntentId: paymentIntent.id,
//             });

//             console.log(`✅ Ad activated successfully! ID: ${newAd._id}`);
//             console.log(
//                 `Listing: ${listingId}, User: ${userId}, Type: ${type}`,
//             );
//         } else if (event.type === 'payment_intent.created') {
//             console.log('Payment intent created - waiting for completion');
//             // Don't do anything, wait for succeeded event
//         } else if (event.type === 'checkout.session.completed') {
//             // This will work if you add this event type in Stripe dashboard
          
//             const session = event.data.object;
            
//             console.log('Checkout session completed:', session.id);

//             const { userId, listingId, type, startDate, endDate } =
//                 session.metadata || {};

//             if (
//                 userId &&
//                 listingId &&
//                 type &&
//                 session.payment_status === 'paid'
//             ) {
//                 const existingAd = await FeaturedAd.findOne({
//                     stripeSessionId: session.id,
//                 });

//                 if (!existingAd) {
//                     await FeaturedAd.create({
//                         userId: userId.toString(),
//                         listingId,
//                         type,
//                         startDate: new Date(startDate),
//                         endDate: new Date(endDate),
//                         isActive: true,
//                         paid: true,
//                         stripeSessionId: session.id,
//                         stripePaymentIntentId: session.payment_intent,
//                     });
//                     console.log('✅ Ad activated via checkout session');
//                 }
//             }
//         }

//         res.json({ received: true });
//     } catch (err) {
//         console.error('Webhook Error:', err.message);
//         console.error('Error stack:', err.stack);
//         return res.status(400).send(`Webhook Error: ${err.message}`);
//     }
// };

// // Helper function to handle checkout session
// async function handleCheckoutSession(session) {
//     console.log('Processing checkout session:', session.id);
//     console.log('Payment status:', session.payment_status);

//     // Only process if payment is paid
//     if (session.payment_status !== 'paid') {
//         console.log('Payment not paid yet, waiting');
//         return;
//     }

//     const { userId, listingId, type, startDate, endDate } =
//         session.metadata || {};

//     // Validate required metadata
//     if (!userId || !listingId || !type) {
//         console.error('Missing required metadata:', {
//             userId,
//             listingId,
//             type,
//         });
//         return;
//     }

//     // Check for duplicate
//     const existingAd = await FeaturedAd.findOne({
//         stripeSessionId: session.id,
//     });

//     if (existingAd) {
//         console.log('⚠️ Duplicate webhook ignored for session:', session.id);
//         return;
//     }

//     // Create featured ad
//     await FeaturedAd.create({
//         userId: userId.toString(),
//         listingId,
//         type,
//         startDate: new Date(startDate),
//         endDate: new Date(endDate),
//         isActive: true,
//         paid: true,
//         stripeSessionId: session.id,
//         stripePaymentIntentId: session.payment_intent,
//     });

//     console.log(`✅ Ad activated for listing ${listingId}`);
// }
// utils/PaymentController/controller.js
const Stripe = require('stripe');
const FeaturedAd = require('../../models/FeaturedAd');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    console.log('=== WEBHOOK CALLED ===');
    console.log('Event timestamp:', new Date().toISOString());

    const sig = req.headers['stripe-signature'];

    if (!sig) {
        console.error('No stripe-signature header');
        return res.status(400).send('No stripe signature');
    }

    try {
        const event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET,
        );

        console.log('EVENT TYPE:', event.type);

        // Handle checkout.session.completed (primary event type)
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            console.log('Checkout session completed:', session.id);
            console.log('Payment status:', session.payment_status);
            console.log('Metadata:', session.metadata);

            // Only process if payment is successful
            if (session.payment_status !== 'paid') {
                console.log('Payment not paid yet, skipping');
                return res.json({ received: true });
            }

            const { userId, listingId, type, startDate, endDate } = session.metadata || {};

            // Validate required metadata
            if (!userId || !listingId || !type) {
                console.error('Missing required metadata:', { userId, listingId, type });
                return res.json({ received: true });
            }

            // Validate dates
            if (!startDate || !endDate || isNaN(Date.parse(startDate)) || isNaN(Date.parse(endDate))) {
                console.error('Invalid dates:', { startDate, endDate });
                return res.json({ received: true });
            }

            // Check for duplicate using session ID
            const existingAd = await FeaturedAd.findOne({
                $or: [
                    { stripeSessionId: session.id },
                    { stripePaymentIntentId: session.payment_intent }
                ]
            });

            if (existingAd) {
                console.log(`⚠️ Duplicate webhook ignored for session: ${session.id}`);
                return res.json({ received: true });
            }

            // Create the featured ad
            const newAd = await FeaturedAd.create({
                userId: userId.toString(),
                listingId: listingId,
                type: type,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                isActive: true,
                paid: true,
                stripeSessionId: session.id,
                stripePaymentIntentId: session.payment_intent,
            });

            console.log(`✅ Ad activated successfully! ID: ${newAd._id}`);
            console.log(`Listing: ${listingId}, User: ${userId}, Type: ${type}`);
        }
        
        // Handle payment_intent.succeeded as fallback
        else if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            console.log('Payment intent succeeded:', paymentIntent.id);
            console.log('Metadata:', paymentIntent.metadata);

            const { userId, listingId, type, startDate, endDate } = paymentIntent.metadata || {};

            if (!userId || !listingId || !type) {
                console.log('No metadata in payment intent, skipping');
                return res.json({ received: true });
            }

            // Check for duplicate
            const existingAd = await FeaturedAd.findOne({
                stripePaymentIntentId: paymentIntent.id,
            });

            if (!existingAd) {
                const newAd = await FeaturedAd.create({
                    userId: userId.toString(),
                    listingId: listingId,
                    type: type,
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    isActive: true,
                    paid: true,
                    stripePaymentIntentId: paymentIntent.id,
                });
                console.log(`✅ Ad activated via payment intent! ID: ${newAd._id}`);
            } else {
                console.log('⚠️ Duplicate payment intent ignored');
            }
        }
        
        // Log other event types for debugging
        else if (event.type === 'payment_intent.created') {
            console.log('Payment intent created - waiting for completion');
        } else if (event.type === 'charge.succeeded') {
            console.log('Charge succeeded - payment completed');
        } else {
            console.log(`Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
        
    } catch (err) {
        console.error('Webhook Error:', err.message);
        console.error('Error stack:', err.stack);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
};