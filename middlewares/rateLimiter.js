const {rateLimit} = require("express-rate-limit");

const limiter = rateLimit({
	windowMs: 24 * 60 * 60 * 1000,
	limit: 2000,
	standardHeaders: "draft-8",
	legacyHeaders: false,
});

module.exports = {limiter};