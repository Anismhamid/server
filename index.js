require("dotenv").config({
	path: process.env.NODE_ENV === "production" ? ".env.production" : ".env",
});
const auth = require("./middlewares/auth");

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
		origin: allowedOrigins,
		methods: ["GET", "POST", "PATCH"],
		credentials: true,
	},
	connectionStateRecovery: {
		maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
		skipMiddlewares: true,
	},
});

// Prot
const PORT = process.env.PORT || 8000;

// mongoDB connection
connectDB();

// attach Io into the app
app.set("io", io);
const connectedUsers = new Map();

io.on("connection", (socket) => {
	console.log("socket connected");

	// create connection for connected user
	const userId = socket.handshake.auth.userId;
	const userName = socket.handshake.auth.name;
	const role = socket.handshake.auth.role;
	if (!userId) {
		return;
	}

	connectedUsers.set(userId, socket.id);
	socket.join(userId);
	console.log(`User ${userId} joined personal room`);

	if (role === "Admin" || role === "Moderator") {
		socket.join("admins");
		console.log(`${userName} jioned with ${role} role to 'admins' room`);
	}

	// Emit login event with full user data
	socket.broadcast.emit("user:connected", {
		userId: userId,
		socketId: socket.id,
		timestamp: new Date(),
	});

	// Handling socket event for orders
	orderSocketHandler(io, socket);

	socket.on("disconnect", () => {
		// Remove user from connected users map
		connectedUsers.delete(userId);

		// Emit disconnect event
		socket.broadcast.emit("user:disconnected", {
			userId: userId,
			timestamp: new Date(),
		});
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
