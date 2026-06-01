const Posts = require('../../models/post');
const FeaturedAd = require('../../models/FeaturedAd');
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    console.log('=== STRIPE WEBHOOK CALLED ===');
    console.log('Time:', new Date().toISOString());

    const sig = req.headers['stripe-signature'];

    if (!sig) {
        console.error('Missing stripe-signature');
        return res.status(400).send('Missing signature');
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET,
        );
    } catch (err) {
        console.error('❌ Stripe signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        console.log('EVENT TYPE:', event.type);
        console.log('EVENT ID:', event.id);

        /* =========================================
           CHECKOUT SESSION COMPLETED
        ========================================= */
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;

            if (session.payment_status !== 'paid') {
                console.log('Payment not completed, skipping...');
                return res.json({ received: true });
            }

            let metadata = session.metadata || {};

            // safe parse if string
            if (typeof metadata === 'string') {
                try {
                    metadata = JSON.parse(metadata);
                } catch {
                    console.error('Invalid metadata format');
                    return res.json({ received: true });
                }
            }

            const { userId, listingId, type, startDate, endDate } = metadata;

            if (!userId || !listingId || !type) {
                console.error('Missing metadata fields');
                return res.json({ received: true });
            }

            const start = new Date(startDate);
            const end = new Date(endDate);

            if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
                console.error('Invalid dates');
                return res.json({ received: true });
            }

            /* ---------------- DUPLICATE CHECK ---------------- */
            const exists = await FeaturedAd.findOne({
                stripeSessionId: session.id,
            });

            if (exists) {
                console.log('⚠️ Duplicate session ignored:', session.id);
                return res.json({ received: true });
            }

            /* ---------------- TRANSACTION ---------------- */
            const dbSession = await FeaturedAd.startSession();
            dbSession.startTransaction();

            try {
                const [newAd] = await FeaturedAd.create(
                    [
                        {
                            userId: userId.toString(),
                            listingId,
                            type,
                            startDate: start,
                            endDate: end,
                            isActive: true,
                            paid: true,
                            stripeSessionId: session.id,
                            stripePaymentIntentId: session.payment_intent,
                        },
                    ],
                    { session: dbSession },
                );

                const updatedPost = await Posts.findByIdAndUpdate(
                    listingId,
                    { $set: { featured: true } },
                    { new: true, session: dbSession },
                );

                await dbSession.commitTransaction();
                dbSession.endSession();

                console.log('✅ Featured Ad created:', newAd._id);
                console.log('✅ Post featured:', updatedPost?._id);
            } catch (err) {
                await dbSession.abortTransaction();
                dbSession.endSession();
                throw err;
            }
        } else if (event.type === 'payment_intent.succeeded') {
            /* =========================================
           PAYMENT INTENT FALLBACK
        ========================================= */
            const paymentIntent = event.data.object;

            const metadata = paymentIntent.metadata || {};
            const { userId, listingId, type, startDate, endDate } = metadata;

            if (!userId || !listingId || !type) {
                console.log('Missing metadata in payment intent');
                return res.json({ received: true });
            }

            /* ---------------- DUPLICATE CHECK ---------------- */
            const exists = await FeaturedAd.findOne({
                stripePaymentIntentId: paymentIntent.id,
            });

            if (exists) {
                console.log('⚠️ Duplicate payment intent ignored');
                return res.json({ received: true });
            }

            const dbSession = await FeaturedAd.startSession();
            dbSession.startTransaction();

            try {
                const [newAd] = await FeaturedAd.create(
                    [
                        {
                            userId: userId.toString(),
                            listingId,
                            type,
                            startDate: new Date(startDate),
                            endDate: new Date(endDate),
                            isActive: true,
                            paid: true,
                            stripePaymentIntentId: paymentIntent.id,
                        },
                    ],
                    { session: dbSession },
                );

                const updatedPost = await Posts.findByIdAndUpdate(
                    listingId,
                    { $set: { featured: true } },
                    { new: true, session: dbSession },
                );

                await dbSession.commitTransaction();
                dbSession.endSession();

                console.log('✅ Ad created via payment intent:', newAd._id);
                console.log('✅ Post featured:', updatedPost?._id);
            } catch (err) {
                await dbSession.abortTransaction();
                dbSession.endSession();
                throw err;
            }
        } else if (event.type === 'payment_intent.created') {
            /* =========================================
            DEBUG EVENTS
            ========================================= */
            console.log('Payment intent created');
        } else if (event.type === 'charge.succeeded') {
            console.log('Charge succeeded');
        } else {
            console.log('Unhandled event:', event.type);
        }

        return res.json({ received: true });
    } catch (err) {
        console.error('❌ Webhook error:', err);
        return res.status(500).send('Webhook failed');
    }
};
