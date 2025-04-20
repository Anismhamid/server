const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

router.get("/", async (req, res) => {
	try {
		const discounts = await Product.aggregate([{$match: {sale: true}}, {$limit: 6}]);
		if (!discounts) return res.status(404).send("no products on discounts");

		res.status(200).send(discounts);
	} catch (error) {
		res.status(400).send(error.message);
	}
});

module.exports = router;
