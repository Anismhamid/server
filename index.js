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

        if (separatorIndex === -1) {
            continue;
        }

        const name = cookie.slice(0, separatorIndex).trim();

        if (name !== cookieName) {
            continue;
        }

        return decodeURIComponent(cookie.slice(separatorIndex + 1).trim());
    }

    return null;
}

io.use(async (socket, next) => {
    try {
        const cookieHeader = socket.handshake.headers.cookie;

        console.log('🍪 Socket cookie received:', Boolean(cookieHeader));

        const token = getCookieValue(cookieHeader, AUTH_COOKIE_NAME);

        console.log('🔐 Socket token received:', Boolean(token));

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

        console.log(`✅ Socket authenticated: ${user._id}`);

        next();
    } catch (error) {
        console.error('❌ Socket authentication error:', error.message);

        return next(new Error('Authentication required'));
    }
});

// ======================================================
// CONNECTED USERS
// ======================================================

const connectedUsers = new Map();

app.set('io', io);
app.set('connectedUsers', connectedUsers);

// ======================================================
// SOCKET CONNECTION
// ======================================================

io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    const role = socket.user.role;

    console.log(`🔌 Socket connected: ${userId} (${role})`);

    // ==================================================
    // User room
    // ==================================================

    socket.join(userId);

    console.log(`🏠 User room joined: ${userId}`);

    // ==================================================
    // Connected users
    // Keep this only for presence / online status
    // ==================================================

    const sockets = connectedUsers.get(userId) || [];

    if (!sockets.includes(socket.id)) {
        sockets.push(socket.id);
    }

    connectedUsers.set(userId, sockets);

    console.log(`👤 User ${userId} sockets:`, sockets);

    // ==================================================
    // Admin / Moderator
    // ==================================================

    if (role === 'Admin' || role === 'Moderator') {
        socket.join('admins');
    }

    // ==================================================
    // Typing
    // ==================================================

    socket.on('user:typing', ({ to }) => {
        if (!to) return;

        io.to(to.toString()).emit('user:typing', {
            from: userId,
        });
    });

    // ==================================================
    // Stop typing
    // ==================================================

    socket.on('user:stopTyping', ({ to }) => {
        if (!to) return;

        io.to(to.toString()).emit('user:stopTyping', {
            from: userId,
        });
    });

    // ==================================================
    // IMPORTANT:
    // Do NOT handle message:seen here.
    //
    // REST PATCH /mark-as-seen/:fromUserId
    // is responsible for DB + Socket notification.
    // ==================================================

    // ==================================================
    // Disconnect
    // ==================================================

    socket.on('disconnect', (reason) => {
        console.log(`🔌 Socket disconnected: ${userId} - ${reason}`);

        const ids = connectedUsers.get(userId) || [];

        const remainingIds = ids.filter((id) => id !== socket.id);

        if (remainingIds.length > 0) {
            connectedUsers.set(userId, remainingIds);
        } else {
            connectedUsers.delete(userId);
        }

        console.log(`👤 User ${userId} remaining sockets:`, remainingIds);
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
