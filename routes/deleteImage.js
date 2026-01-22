import {v2 as cloudinary} from "cloudinary";

cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.CLOUD_KEY,
	api_secret: process.env.CLOUD_SECRET,
});

router.post("/delete", async (req, res) => {
	const {publicId} = req.body;

	if (!publicId) return res.status(400).json({error: "Missing publicId"});

	try {
		const result = await cloudinary.uploader.destroy(publicId);
		res.json({success: true, result});
	} catch (err) {
		console.error(err);
		res.status(500).json({success: false, error: err});
	}
});
