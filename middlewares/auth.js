const Jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
	try {
		const token = req.header("Authorization");
		if (!token) return res.status(401).send("No Have Access. No Token Provided");
		req.payload = Jwt.verify(token, process.env.JWT_SECRET);
		next();
	} catch (error) {
		res.status(400).send(error);
	}
};
