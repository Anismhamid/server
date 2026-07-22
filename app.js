const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { limiter } = require('./middlewares/rateLimiter');
const { logger, logToFile } = require('./utils/logger');
const { allowedOrigins } = require('./config/allowOrigins');
const morgan = require('morgan');

const users = require('./routes/users');
const posts = require('./routes/posts');
const businessInfo = require('./routes/businessInfo');
const featuredAd = require('./routes/featuredRegister');
const discounts = require('./routes/discountAndOffers');
const cities = require('./routes/cities');
const messages = require('./routes/messages');
const images = require('./routes/deleteImage');
const startFeaturedAdsCron = require('./utils/PaymentController/featuredAdsCron');
const featuredAdWebhookController = require('./utils/PaymentController/controller');
const app = express();

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, etc.)
        if (!origin) return callback(null, true);

        // Check against allowed origins
        if (
            allowedOrigins.includes(origin) ||
            origin === 'http://localhost:5173'
        ) {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// SECURITY & LOGGING
// =======================
app.use(cors(corsOptions));

// =======================
// WEBHOOK - IMPORTANT: Must be BEFORE express.json()
// =======================
console.log('Registering webhook route at: /api/featured-ads/webhook');
app.use(
    '/api/featured-ads/webhook',
    express.raw({ type: 'application/json' }),
    featuredAdWebhookController
);

// Test webhook endpoint
app.post('/api/featured-ads/test-webhook', express.raw({ type: 'application/json' }), (req, res) => {
    console.log('Test webhook hit!');
    console.log('Headers:', req.headers);
    res.json({ received: true });
});

// =======================
// BODY PARSING & RATE LIMITING
// =======================
app.use(express.json({ limit: '5mb' }));
// app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(helmet());
app.use(logger);
logToFile();
app.use(limiter);
app.use(morgan('dev'));

// =======================
// STARTUP JOBS
// =======================
startFeaturedAdsCron();


// =======================
// ROUTES
// =======================
app.use('/api/posts', posts);
app.use('/api/users', users);
app.use('/api/business-info', businessInfo);
app.use('/api/featured-ads', featuredAd);
app.use('/api/discounts', discounts);
app.use('/api/cities', cities);
app.use('/api/messages', messages);
app.use('/api/images', images);

// =======================
// 404 HANDLER
// =======================
app.use((req, res) => {
    res.status(404).json({
        message: `Route ${req.method} ${req.path} not found`,
    });
});

app.use((req, res, next) => {
    if (req.originalUrl === '/api/featured-ads/webhook') {
        return next();
    }
    return logger(req, res, next);
});

// =======================
// GLOBAL ERROR HANDLER
// =======================
app.use((err, req, res, next) => {
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ message: 'CORS error: Access denied' });
    }

    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
    });
});

module.exports = app;
