const Posts = require('../../models/post');
const FeaturedAd = require('../../models/FeaturedAd');
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    console.log('=== STRIPE WEBHOOK CALLED ===');
    console.log('Time:', new Date().toISOString());

    const sig = req.headers['stripe-signature'];

    if (!sig) {
        console.error('❌ Missing stripe-signature');
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

    console.log('EVENT TYPE:', event.type);
    console.log('EVENT ID:', event.id);

    try {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;

            console.log('Checkout Session:', session.id);
            console.log('Payment status:', session.payment_status);

            if (session.payment_status !== 'paid') {
                console.log('⚠️ Payment not completed, skipping');

                return res.json({ received: true });
            }

            const metadata = session.metadata || {};

            const { userId, listingId, type, startDate, endDate } = metadata;

            console.log('Metadata:', metadata);

            if (!userId || !listingId || !type || !startDate || !endDate) {
                console.error('❌ Missing required metadata');

                return res.json({ received: true });
            }

            const allowedTypes = ['highlight', 'top', 'homepage'];

            if (!allowedTypes.includes(type)) {
                console.error('❌ Invalid promotion type:', type);

                return res.json({ received: true });
            }

            const start = new Date(startDate);
            const end = new Date(endDate);

            if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
                console.error('❌ Invalid dates');

                return res.json({ received: true });
            }

            if (end <= start) {
                console.error('❌ End date must be after start date');

                return res.json({ received: true });
            }

            /*
             * Verify listing
             */
            const listing = await Posts.findById(listingId);

            if (!listing) {
                console.error('❌ Listing not found:', listingId);

                return res.json({ received: true });
            }

            /*
             * Prevent duplicate webhook processing
             */
            const existingAd = await FeaturedAd.findOne({
                stripeSessionId: session.id,
            });

            if (existingAd) {
                console.log('⚠️ Session already processed:', session.id);

                return res.json({
                    received: true,
                    alreadyProcessed: true,
                });
            }

            /*
             * Create FeaturedAd
             */
            const dbSession = await FeaturedAd.startSession();

            try {
                dbSession.startTransaction();

                const [newAd] = await FeaturedAd.create(
                    [
                        {
                            userId,
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
                    {
                        session: dbSession,
                    },
                );

                const updatedPost = await Posts.findByIdAndUpdate(
                    listingId,
                    {
                        $set: {
                            featured: true,
                        },
                    },
                    {
                        new: true,
                        session: dbSession,
                    },
                );

                await dbSession.commitTransaction();

                console.log('✅ FeaturedAd created:', newAd._id);

                console.log('✅ Post featured:', updatedPost?._id);
            } catch (err) {
                await dbSession.abortTransaction();

                console.error('❌ Transaction failed:', err);

                throw err;
            } finally {
                await dbSession.endSession();
            }
        } else if (event.type === 'payment_intent.succeeded') {

        /*
         * Payment intent is only logged.
         * Do NOT create FeaturedAd here.
         */
            const paymentIntent = event.data.object;

            console.log('💰 PaymentIntent succeeded:', paymentIntent.id);
        } else if (event.type === 'payment_intent.created') {
            console.log('PaymentIntent created');
        } else if (event.type === 'charge.succeeded') {
            console.log('Charge succeeded');
        } else {
            console.log('Unhandled event:', event.type);
        }

        return res.json({
            received: true,
        });
    } catch (err) {
        console.error('❌ Webhook processing error:', err);

        return res.status(500).json({
            message: 'Webhook failed',
        });
    }
};
