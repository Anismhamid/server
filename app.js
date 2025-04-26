require("dotenv").config()
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const {limiter} = require("./middlewares/rateLimiter");
const {logger, logToFile} = require("./utils/logger");
// const {allowedOrigins} = require("./config/allowOrigins");

const users = require("./routes/users");
const carts = require("./routes/carts");
const orders = require("./routes/orders");
const products = require("./routes/products");
const businessInfo = require("./routes/businessInfo");
const discounts = require("./routes/discountAndOffers");
const receipt = require("./routes/receipt");

const app = express();

const allowedOrigins = [
	process.env.DEV_MODE,
	process.env.PROD_MODE,
	process.env.NODE_API,
	process.env.RENDER_API,
	process.env.VERCEL_URL,
	process.env.VERCEL_URL_DEVELOPMENT,
];
app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true);
			} else {
				callback(new Error("Not allowed by CORS"));
			}
		},
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	}),
);

app.use(express.json({limit: "5mb"}));
app.use(helmet({crossOriginOpenerPolicy: false}));
app.use(logger);
logToFile();
app.use(limiter);

// orders and products
app.use("/api/carts", carts);
app.use("/api/orders", orders);
app.use("/api/products", products);

// users and business
app.use("/api/users", users);
app.use("/api/business-info", businessInfo);
app.use("/api/discounts", discounts);
app.use("/api/receipt", receipt);

module.exports = app;
