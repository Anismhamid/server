const cron = require('node-cron');

const FeaturedAd = require('../../models/FeaturedAd');
const Posts = require('../../models/post');

function startFeaturedAdsCron() {
    console.log('✅ Featured ads cron initialized');

    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();

            console.log('⏰ Featured Ads Cron:', now.toISOString());

            // Find expired active ads
            const expiredAds = await FeaturedAd.find({
                endDate: { $lt: now },
                isActive: true,
            });

            if (expiredAds.length === 0) {
                console.log('✅ No expired ads');
                return;
            }

            for (const ad of expiredAds) {
                // Disable expired FeaturedAd
                ad.isActive = false;
                await ad.save();

                console.log(`⏹️ FeaturedAd disabled: ${ad._id}`);

                // Check whether this listing has
                // another currently active promotion
                const anotherActiveAd = await FeaturedAd.exists({
                    listingId: ad.listingId,
                    isActive: true,
                    startDate: { $lte: now },
                    endDate: { $gte: now },
                });

                if (!anotherActiveAd) {
                    await Posts.findByIdAndUpdate(ad.listingId, {
                        $set: {
                            featured: false,
                        },
                    });

                    console.log(
                        `❌ Post is no longer featured: ${ad.listingId}`,
                    );
                } else {
                    console.log(
                        `ℹ️ Listing still has another active promotion: ${ad.listingId}`,
                    );
                }
            }

            console.log(`✅ Expired ads processed: ${expiredAds.length}`);
        } catch (err) {
            console.error('❌ Featured ads cron error:', err);
        }
    });
}

module.exports = startFeaturedAdsCron;
