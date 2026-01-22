const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const {limiter} = require("./middlewares/rateLimiter");
const {logger, logToFile} = require("./utils/logger");
const {allowedOrigins} = require("./config/allowOrigins");
const morgan = require("morgan");


const users = require("./routes/users");
const products = require("./routes/products");
const businessInfo = require("./routes/businessInfo");
const discounts = require("./routes/discountAndOffers");
const receipt = require("./routes/receipt");
const cities = require("./routes/cities");
const messages = require("./routes/messages");

const app = express();

app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true);
			} else {
				callback(new Error("Not allowed by CORS"));
			}
		},
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
		credentials: true,
	}),
);

app.use((err, req, res, next) => {
	if (err instanceof Error && err.message === "Not allowed by CORS") {
		return res.status(403).send("CORS error: Access denied");
	}
	next(err);
});

app.use(express.json({limit: "5mb"}));
app.use(helmet());
app.use(logger);
logToFile();
app.use(limiter);
app.use(morgan("dev"));

//  products
app.use("/api/products", products);

// users and business
app.use("/api/users", users);
app.use("/api/business-info", businessInfo);
app.use("/api/discounts", discounts);
app.use("/api/receipt", receipt);
app.use("/api/cities", cities);
app.use("/api/messages", messages);
app.use("/api/images", messages);

module.exports = app;
