const cron = require("node-cron");
const FeaturedAd = require("../models/FeaturedAd");

// كل يوم الساعة 00:00
cron.schedule("0 0 * * *", async () => {
	const now = new Date();
	const result = await FeaturedAd.updateMany(
		{endDate: {$lt: now}, isActive: true},
		{$set: {isActive: false}},
	);
	console.log(`Deactivated ${result.modifiedCount} expired featured ads`);
});
