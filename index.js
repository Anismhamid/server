require('dotenv').config({
    path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
});

const { setServers } = require('node:dns/promises');

const { createServer } = require('http');
const { Server } = require('socket.io');
const Jwt = require('jsonwebtoken');
const chalk = require('chalk');
const expressRoutes = require('express-list-routes');

const app = require('./app');
const Users = require('./models/User');

// Cors origins from .env
const { allowedOrigins } = require('./config/allowOrigins');

setServers(['1.1.1.1', '8.8.8.8']);

const connectDB = require('./config/db');

// MongoDB connection
connectDB();

// Create HTTP server
const httpServer = createServer(app);

// ======================================================
// SOCKET.IO SERVER
// ======================================================

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

        // IMPORTANT:
        // Do not allow a recovered socket to skip
        // authentication middleware.
        skipMiddlewares: false,
    },
});

// ======================================================
// SOCKET AUTHENTICATION
// ======================================================

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'safqa_token';

function getCookieValue(cookieHeader, cookieName) {
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(';');

    for (const cookie of cookies) {
        const separatorIndex = cookie.indexOf('=');

        if (separatorIndex === -1) continue;

        const name = cookie.slice(0, separatorIndex).trim();

        if (name !== cookieName) continue;

        return decodeURIComponent(cookie.slice(separatorIndex + 1).trim());
    }

    return null;
}

// Authenticate every Socket.IO connection
io.use(async (socket, next) => {
    try {
        const cookieHeader = socket.handshake.headers.cookie;

        const token = getCookieValue(cookieHeader, AUTH_COOKIE_NAME);

        if (!token) {
            return next(new Error('Authentication required'));
        }

        const payload = Jwt.verify(token, process.env.JWT_SECRET);

        if (!payload?._id) {
            return next(new Error('Invalid authentication payload'));
        }

        const user = await Users.findById(payload._id)
            .select('_id role accountStatus permissions')
            .lean();

        if (!user) {
            return next(new Error('User not found'));
        }

        if (user.accountStatus === 'disabled') {
            return next(new Error('Account disabled'));
        }

        if (user.permissions?.canUseAccount === false) {
            return next(new Error('Account access disabled'));
        }

        socket.user = {
            _id: user._id.toString(),
            role: user.role,
            accountStatus: user.accountStatus,
            permissions: user.permissions,
        };

        next();
    } catch (error) {
        console.error('❌ Socket authentication error:', error.message);

        return next(new Error('Authentication required'));
    }
});

// ======================================================
// CONNECTED USERS
// userId -> [socketIds]
// ======================================================

const connectedUsers = new Map();

app.set('io', io);
app.set('connectedUsers', connectedUsers);

// ======================================================
// SOCKET CONNECTION
// ======================================================

io.on('connection', (socket) => {
    const userId = socket.user._id;
    const role = socket.user.role;

    console.log(`🔌 Socket connected: ${userId} (${role})`);

    // ------------------------------------------
    // Add socket to connected user
    // ------------------------------------------

    if (!connectedUsers.has(userId)) {
        connectedUsers.set(userId, []);
    }

    connectedUsers.get(userId).push(socket.id);

    // User-specific room
    socket.join(userId);

    // Admin / Moderator room
    if (role === 'Admin' || role === 'Moderator') {
        socket.join('admins');
    }

    // ------------------------------------------
    // Typing
    // ------------------------------------------

    socket.on('user:typing', ({ to }) => {
        if (!to) return;

        const toSockets = connectedUsers.get(to) || [];

        toSockets.forEach((id) => {
            io.to(id).emit('user:typing', {
                // IMPORTANT:
                // Do not trust "from" from frontend.
                from: userId,
            });
        });
    });

    // ------------------------------------------
    // Stop typing
    // ------------------------------------------

    socket.on('user:stopTyping', ({ to }) => {
        if (!to) return;

        const toSockets = connectedUsers.get(to) || [];

        toSockets.forEach((id) => {
            io.to(id).emit('user:stopTyping', {
                // IMPORTANT:
                // Use authenticated socket user.
                from: userId,
            });
        });
    });

    // ------------------------------------------
    // Disconnect
    // ------------------------------------------

    socket.on('disconnect', (reason) => {
        console.log(`🔌 Socket disconnected: ${userId} - ${reason}`);

        const ids = connectedUsers.get(userId) || [];

        const newIds = ids.filter((id) => id !== socket.id);

        if (newIds.length > 0) {
            connectedUsers.set(userId, newIds);
        } else {
            connectedUsers.delete(userId);
        }
    });
});

// ======================================================
// START SERVER
// ======================================================

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
