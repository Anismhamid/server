// ==========app.js=============
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { limiter } = require('./middlewares/rateLimiter');
const { logger, logToFile } = require('./utils/logger');
const { allowedOrigins } = require('./config/allowOrigins');
const morgan = require('morgan');

const users = require('./routes/users');
const appVersionRoutes = require('./routes/appVersionRoutes');
const posts = require('./routes/posts');
const block = require('./routes/block');
const reports = require('./routes/reports');
const blog = require('./routes/blog');
const businessInfo = require('./routes/businessInfo');
const featuredAd = require('./routes/featuredRegister');
const discounts = require('./routes/discountAndOffers');
const cities = require('./routes/cities');
const messages = require('./routes/messages');
const jobs = require('./routes/jobs');
const images = require('./routes/images');
const startFeaturedAdsCron = require('./utils/PaymentController/featuredAdsCron');
const featuredAdWebhookController = require('./utils/PaymentController/controller');
const sitemapRouter = require('./routes/sitemap');
const cookieParser = require('cookie-parser');
const notifications = require('./routes/notifications');
const adminNotifications = require('./routes/adminNotifications');
const savedSearchesRouter = require('./routes/savedSearches');

const app = express();
app.set('trust proxy', 1);

// =======================
// CORS CONFIGURATION
// =======================
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
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

app.use(cors(corsOptions));

// =======================
// WEBHOOK - Must be BEFORE express.json()
// =======================
console.log('Registering webhook route at: /api/featured-ads/webhook');
app.use(
    '/api/featured-ads/webhook',
    express.raw({ type: 'application/json' }),
    featuredAdWebhookController,
);

app.post(
    '/api/featured-ads/test-webhook',
    express.raw({ type: 'application/json' }),
    (req, res) => {
        console.log('Test webhook hit!');
        console.log('Headers:', req.headers);
        res.json({ received: true });
    },
);

// =======================
// BODY PARSING & SECURITY
// =======================
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());
app.use(helmet());
app.use(morgan('dev'));
app.use(logger);
logToFile();
app.use(limiter);

// =======================
// STARTUP JOBS
// =======================
startFeaturedAdsCron();

// =======================
// ROUTES
// =======================
app.use('/api/posts', posts);
app.use('/api/users', users);

app.use('/api/notifications', notifications);
app.use('/api/admin/notifications', adminNotifications);

app.use('/api/saved-searches', savedSearchesRouter);
app.use('/api/app-version', appVersionRoutes);
app.use('/api/business-info', businessInfo);
app.use('/api/featured-ads', featuredAd);
app.use('/api/discounts', discounts);
app.use('/api/cities', cities);
app.use('/api/messages', messages);
app.use('/api/jobs', jobs);
app.use('/api/images', images);


app.use('/api/blocks', block);
app.use('/api/reports', reports);
app.use('/api/blog', blog);

// =======================
// SITEMAPS
// blog.xml must be registered BEFORE the sitemap router
// =======================
app.get('/sitemap/blog.xml', blog.blogSitemap);
app.use('/sitemap', sitemapRouter);

app.get('/sitemap.xml', (req, res) => {
    res.redirect(301, '/sitemap/sitemap.xml');
});

app.get('/sitemap-index.xml', (req, res) => {
    res.redirect(301, '/sitemap/');
});

// robots.txt is served from the client (public/robots.txt)

// =======================
// ROOT HEALTH CHECK
// =======================
app.get('/api', (_req, res) => {
    res.status(200).json({
        name: 'Safqa API',
        version: '1.0.0',
        status: 'online',
        endpoints: {
            posts: '/api/posts',
            users: '/api/users',
            discounts: '/api/discounts',
            blog: '/api/blog',
            sitemap: '/sitemap/sitemap.xml',
            'blog-sitemap': '/sitemap/blog.xml',
            'sitemap-stats': '/sitemap/sitemap-stats',
        },
        timestamp: new Date().toISOString(),
    });
});

// =======================
// 404 HANDLER
// =======================
app.use((req, res) => {
    res.status(404).json({
        message: `Route ${req.method} ${req.path} not found`,
    });
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