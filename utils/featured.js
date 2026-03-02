const FeaturedAd = require("../models/FeaturedAd");

async function getHomepageFeaturedAds(limit = 8) {
	const now = new Date();

	const ads = await FeaturedAd.find({
		type: "homepage",
		isActive: true,
		startDate: {$lte: now},
		endDate: {$gte: now},
	})
		.sort({createdAt: -1})
		.limit(limit)
		.populate("listingId");

	return ads;
}

module.exports = {getHomepageFeaturedAds};
