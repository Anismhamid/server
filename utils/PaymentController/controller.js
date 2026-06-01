const Posts = require('../../models/post');

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

            const { userId, listingId, type, startDate, endDate } =
                session.metadata || {};

            // Validate required metadata
            if (!userId || !listingId || !type) {
                console.error('Missing required metadata:', {
                    userId,
                    listingId,
                    type,
                });
                return res.json({ received: true });
            }

            // Validate dates
            if (
                !startDate ||
                !endDate ||
                isNaN(Date.parse(startDate)) ||
                isNaN(Date.parse(endDate))
            ) {
                console.error('Invalid dates:', { startDate, endDate });
                return res.json({ received: true });
            }

            // Check for duplicate using session ID
            const existingAd = await FeaturedAd.findOne({
                $or: [
                    { stripeSessionId: session.id },
                    { stripePaymentIntentId: session.payment_intent },
                ],
            });

            if (existingAd) {
                console.log(
                    `⚠️ Duplicate webhook ignored for session: ${session.id}`,
                );
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

            const updatedPost = await Posts.findByIdAndUpdate(
                listingId,
                { $set: { featured: true } },
                { new: true, runValidators: true },
            );

            console.log(`✅ Ad activated successfully! ID: ${newAd._id}`);
            console.log(`Post ${updatedPost} is now featured`);
            console.log(
                `Listing: ${listingId}, User: ${userId}, Type: ${type}`,
            );
        }

        // Handle payment_intent.succeeded as fallback
        else if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            console.log('Payment intent succeeded:', paymentIntent.id);
            console.log('Metadata:', paymentIntent.metadata);

            const { userId, listingId, type, startDate, endDate } =
                paymentIntent.metadata || {};

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
                console.log(
                    `✅ Ad activated via payment intent! ID: ${newAd._id}`,
                );
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
