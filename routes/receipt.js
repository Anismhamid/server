const express = require("express");
const router = express.Router();
const Receipt = require("../models/Receipt");
const auth = require("../middlewares/auth");

router.get("/", auth, async (req, res) => {
	try {
		if (req.payload.role !== "Admin") return res.status(403).send("Cannot Acceess");

		const newReceipt = await Receipt.find();
		if (!newReceipt) return res.status(404).send("No receipts yet");

		res.status(200).send(newReceipt);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

router.get("/:userId", auth, async (req, res) => {
	try {
		if (req.payload._id !== req.params.userId)
			return res.status(401).send("Unautontication");

		const newReceipt = await Receipt.find({userId: req.params.userId});
		if (!newReceipt) return res.status(404).send("No receipts yet");

		res.status(202).send(newReceipt);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

module.exports = router;
