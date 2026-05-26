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
const app = express();

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, etc.)
        if (!origin) return callback(null, true);

        // Check against allowed origins
        if (allowedOrigins.indexOf(origin) !== -1) {
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

// Apply CORS middleware
app.use(cors(corsOptions));


const featuredAdWebhook = require('./utils/PaymentController/controller');

// =======================
// WEBHOOK  FOR STRIPE PAYMENTS
// =======================
app.use(
    '/api/featured-ads/webhook',
    express.raw({ type: 'application/json' }),
    featuredAdWebhook,
);

app.use("/api/stripe-webhook", require("./routes/stripeWebhook"));

// // =======================
// NORMAL MIDDLEWARES
// =======================
app.use(express.json({ limit: '5mb' }));
app.use(helmet());
app.use(logger);
logToFile();
app.use(limiter);
app.use(morgan('dev'));
// startFeaturedAdsCron();

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
// GLOBAL ERROR HANDLER
// =======================
app.use((err, req, res, next) => {
    if (err instanceof Error && err.message === 'Not allowed by CORS') {
        return res.status(403).send('CORS error: Access denied');
    }
    next(err);
});

module.exports = app;
