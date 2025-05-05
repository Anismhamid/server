require("dotenv").config({
	path: process.env.NODE_ENV === "production" ? ".env.production" : ".env",
});

// Creating http server
const {createServer} = require("http");
const {Server} = require("socket.io");

const expressRoutes = require("express-list-routes");
const chalk = require("chalk");

const app = require("./app");
const connectDB = require("./config/db");

// Sockets
const orderSocketHandler = require("./sockets/orderSocket");

// Cors origins from .env
const {allowedOrigins} = require("./config/allowOrigins");

const httpServer = createServer(app);

// Io Server
const io = new Server(httpServer, {
	cors: {
		origin: [
			"http://localhost:5173",
			"http://localhost:4173",
			"http://localhost:8209",
			"http://localhost:8201",
			"https://server-32bo.onrender.com",
			"https://client-qqq1.vercel.app",
		],
		methods: ["GET", "POST","PATCH"],
		credentials: true,
	},
	transports: ["websocket"],
});

// Prot
const PORT = process.env.PORT || 8000;

// mongoDB connection
connectDB();

// attach Io into the app
app.set("io", io);

io.on("connection", (socket) => {
	console.log("New user connected");

	// create connection for connected user
	const userId = socket.handshake.auth?.userId;
	if (userId) {
		socket.join(userId);
	}

	// Handling socket event for orders
	orderSocketHandler(io, socket);

	socket.on("disconnect", () => {
		console.log("user disconnected");
	});
});

// Starting server connecion
httpServer.listen(PORT, () =>
	console.log(chalk.greenBright(`Server running on port ${PORT}`)),
);

// Print current environment
if (process.env.NODE_ENV === "development") {
	console.log(chalk.bgWhite.red.bold("App is running in Development mode"));
	expressRoutes(app);
} else {
	console.log(chalk.bgWhiteBright.bold("App is running in Production mode"));
}
