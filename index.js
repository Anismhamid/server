require('dotenv').config({
    path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
});

const { setServers } = require('node:dns/promises');

const { createServer } = require('http');
const { Server } = require('socket.io');
const chalk = require('chalk');
const expressRoutes = require('express-list-routes');

const app = require('./app');

// Cors origins from .env
const { allowedOrigins } = require('./config/allowOrigins');
setServers(['1.1.1.1', '8.8.8.8']);
const connectDB = require('./config/db');

// MongoDB connection
connectDB();

// Create HTTP server
const httpServer = createServer(app);

// Socket.IO server
const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: true,
    },
});

// Map to track connected users: userId -> [socketIds]
const connectedUsers = new Map();
app.set('io', io);
app.set('connectedUsers', connectedUsers);

io.on('connection', (socket) => {
    const { userId, name, role } = socket.handshake.auth;
    if (!userId) {
        return;
    }

    // Add socket.id to array for this user
    if (!connectedUsers.has(userId)) connectedUsers.set(userId, []);
    connectedUsers.get(userId).push(socket.id);

    socket.join(userId);

    // If Admin/Moderator, join admins room
    if (role === 'Admin' || role === 'Moderator') {
        socket.join('admins');
    }

    // Typing events
    socket.on('user:typing', ({ to, from }) => {
        const toSockets = connectedUsers.get(to) || [];
        toSockets.forEach((id) => io.to(id).emit('user:typing', { from }));
    });

    socket.on('user:stopTyping', ({ to, from }) => {
        const toSockets = connectedUsers.get(to) || [];
        toSockets.forEach((id) => io.to(id).emit('user:stopTyping', { from }));
    });

    socket.on('disconnect', (reason) => {

        const ids = connectedUsers.get(userId) || [];
        const newIds = ids.filter((id) => id !== socket.id);

        if (newIds.length > 0) {
            connectedUsers.set(userId, newIds);
        } else {
            connectedUsers.delete(userId);
        }
    });
});

// Start server
const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, '0.0.0.0', () =>
    console.log(chalk.greenBright(`Server running on port ${PORT}`)),
);

if (process.env.NODE_ENV === 'development') {
    console.log(chalk.bgWhite.red.bold('App is running in Development mode'));
    expressRoutes(app);
} else {
    console.log(chalk.bgWhiteBright.bold('App is running in Production mode'));
}
