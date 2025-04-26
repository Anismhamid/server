const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env";
require("dotenv").config({path: envFile});
const express = require("express");
const {createServer} = require("http");
const {Server} = require("socket.io");
const app = express();
const httpServer = createServer(app);
const orderSocketHandler = require("./sockets/orderSocket");

const io = new Server(httpServer, {
	transports: ["websocket"],
	cors: {
		origin: [process.env.DEV_MODE, process.env.PROD_MODE, process.env.VERCEL_URL],
		methods: ["GET", "POST"],
		credentials: true,
	},
});

const helmet = require("helmet");
const products = require("./routes/products");
const businessInfo = require("./routes/businessInfo");
const users = require("./routes/users");
const carts = require("./routes/carts");
const orders = require("./routes/orders");
const receipt = require("./routes/receipt");
const discounts = require("./routes/discountAndOffers");
const mongoose = require("mongoose");
const cors = require("cors");
const chalk = require("chalk");
const expressRoutes = require("express-list-routes");
const {rateLimit} = require("express-rate-limit");
const {logger, logToFile} = require("./middlewares/logger");

const port = process.env.PORT || 8000;

const limiter = rateLimit({
	windowMs: 24 * 60 * 60 * 1000, // hours / minutes / seconds / milliseconds :: 24 hours
	limit: 2000, // Limit each IP to 1000 requests per `window` (here, per 24 hours).
	standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
});

mongoose
	.connect(process.env.DB)
	.then(() => console.log(chalk.blue("Connected to mongoDB")))
	.catch((error) => {
		console.log(error);
		process.exit(1);
	});

// Middlewares
app.use(
	cors({
		origin: (origin, callback) => {
			const allowedOrigins = [
				process.env.PROD_MODE,
				process.env.DEV_MODE,
				process.env.NODE_API,
				process.env.RENDER_API,
				process.env.VERCEL_URL,
			];
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true);
			} else {
				callback(new Error("Not allowed by CORS"));
			}
		},
		credentials: true,
	}),
);

app.set("io", io);
app.use(express.json({limit: "2mb"}));
app.use(helmet({crossOriginOpenerPolicy: false}));
app.use(logger);
logToFile();
app.use(limiter);

app.use("/api/users", users);
app.use("/api/carts", carts);
app.use("/api/orders", orders);
app.use("/api/products", products);
app.use("/api/business-info", businessInfo);
app.use("/api/discounts", discounts);
app.use("/api/receipt", receipt);

io.on("connection", (socket) => {
	console.log("A user connected");
	orderSocketHandler(io, socket);
});

httpServer.listen(port, () =>
	console.log(chalk.blue.underline("Server started on port:", port)),
);

if (process.env.NODE_ENV === "development") {
	console.log(chalk.bgWhite.red.bold("App is running in Development mode"));
	expressRoutes(app);
} else {
	console.log(chalk.bgWhiteBright.bold("App is running in Production mode"));
}
