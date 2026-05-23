// utils/PaymentController/featuredAdsCron.js
const cron = require('node-cron');
const FeaturedAd = require('../../models/FeaturedAd');

function startFeaturedAdsCron() {
    cron.schedule('0 * * * *', async () => {
        try {
            const result = await FeaturedAd.updateMany(
                {
                    endDate: {
                        $lt: new Date(),
                    },
                    isActive: true,
                },
                {
                    isActive: false,
                },
            );

            console.log(`Expired ads updated: ${result.modifiedCount}`);
        } catch (err) {
            console.error('Cron error:', err);
        }
    });
}
module.exports = startFeaturedAdsCron;