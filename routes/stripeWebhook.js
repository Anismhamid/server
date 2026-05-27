// const express = require('express');
// const router = express.Router();
// const Stripe = require('stripe');
// const FeaturedAd = require('../models/FeaturedAd');

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// router.post('/', async (req, res) => {
//     console.log("Webhook reached");

//     try {
//         const event = stripe.webhooks.constructEvent(
//             req.body,
//             req.headers['stripe-signature'],
//             process.env.STRIPE_WEBHOOK_SECRET
//         );

//         console.log("Event:", event.type);

//         if (event.type === 'checkout.session.completed') {
//             const session = event.data.object;

//             await FeaturedAd.create({
//                 userId: session.metadata.userId,
//                 listingId: session.metadata.listingId,
//                 type: session.metadata.type,
//                 startDate: new Date(session.metadata.startDate),
//                 endDate: new Date(session.metadata.endDate),
//                 paid: true,
//                 stripeSessionId: session.id,
//                 isActive: true,
//             });

//             console.log("✅ Ad activated");
//         }

//         res.json({ received: true });

//     } catch(err){
//         console.log(err);
//         res.status(400).send(err.message);
//     }
// });

// module.exports = router;