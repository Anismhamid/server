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
	"http://localhost:5173",
	"http://localhost:4173",
	"http://localhost:8209",
	"https://server-32bo.onrender.com",
	"https://client-qqq1.vercel.app",
	"https://client-qqq1-dip2scy3s-anismhamids-projects.vercel.app",
	process.env.DEV_MODE, // מקור דיפלוי לפיתוח
	process.env.PROD_MODE, // מקור דיפלוי לייצור
	process.env.NODE_API, // ה-API המקומי
	process.env.RENDER_API, // ה-API המפורסם ב-Render
	process.env.VERCEL_URL, // ה-URL של אפליקציה ב-Vercel
	process.env.VERCEL_URL_DEVELOPMENT, // ה-URL לפיתוח ב-Vercel
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
