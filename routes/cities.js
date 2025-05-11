const express = require("express");
const router = express.Router();
const Cities = require("../models/City");

router.get("/", async (req, res) => {
	try {
		const cities = await Cities.distinct("city_name");
		res.status(200).send(cities);
	} catch (err) {
		res.status(500).send({error: "Failed to fetch cities"});
	}
});

// city streets
router.get("/:city", async (req, res) => {
	const {city} = req.params;
	try {
		const streets = await Cities.find({city_name: city}).distinct("street_name");
		res.json(streets);
	} catch (err) {
		res.status(500).json({error: "Failed to fetch streets"});
	}
});

module.exports = router;
