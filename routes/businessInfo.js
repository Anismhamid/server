const express = require("express");
const auth = require("../middlewares/auth");
const router = express.Router();
const BusinessInfo = require("../models/BusinessInfo");
const businessSchema = require("../schema/businessSchema");

router.get("/", async (req, res) => {
	try {
		const businessInfo = await BusinessInfo.findOne();
		res.status(200).send(businessInfo);
	} catch (error) {
		res.status(400).send(error.message);
	}
});

router.put("/", auth, async (req, res) => {
	try {
		if (req.payload.role !== "Admin") return res.status(401).send("Access denied.");

		// validate the body
		const {error,value} = businessSchema.validate(req.body);
		if (error) return res.status(400).send(error.details[0].message);

		const businessInfo = await BusinessInfo.findOneAndUpdate({}, value, {
			new: true,
		});

		res.status(200).send(businessInfo);
	} catch (error) {
		res.status(400).send(error.message);
	}
});

module.exports = router;
