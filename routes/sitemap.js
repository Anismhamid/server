// server/routes/sitemap.js
const express = require('express');
const Post = require('../models/post');
const compression = require('compression');

const router = express.Router();

// ===================== CONFIGURATION =====================
const BASE_URL = process.env.CLIENT_URL || 'https://client-qqq1.vercel.app';
const MAX_URLS_PER_SITEMAP = 50000; // Google's limit
const CACHE_TTL = 1000 * 60 * 15;
const ENABLE_COMPRESSION = true;
const ENABLE_LOGGING = process.env.NODE_ENV !== 'production' || process.env.LOG_SITEMAP === 'true';

// ===================== STATIC URLS =====================
const staticUrls = [
    // Main pages
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/about', priority: '0.7', changefreq: 'monthly' },
    { loc: '/contact', priority: '0.7', changefreq: 'monthly' },
    { loc: '/categories', priority: '0.8', changefreq: 'weekly' },
    { loc: '/discounts-and-offers', priority: '0.8', changefreq: 'daily' },
    { loc: '/blog', priority: '0.6', changefreq: 'weekly' },
    
    // Category pages
    { loc: '/category/Cars', priority: '0.9', changefreq: 'daily' },
    { loc: '/category/Motorcycles', priority: '0.9', changefreq: 'daily' },
    { loc: '/category/Bikes', priority: '0.9', changefreq: 'daily' },
    { loc: '/category/Trucks', priority: '0.9', changefreq: 'daily' },
    { loc: '/category/ElectricVehicles', priority: '0.9', changefreq: 'daily' },
    { loc: '/category/House', priority: '0.8', changefreq: 'weekly' },
    { loc: '/category/Garden', priority: '0.8', changefreq: 'weekly' },
    { loc: '/category/Baby', priority: '0.8', changefreq: 'weekly' },
    { loc: '/category/Electronics', priority: '0.9', changefreq: 'daily' },
    { loc: '/category/Kids', priority: '0.8', changefreq: 'weekly' },
    { loc: '/category/Beauty', priority: '0.8', changefreq: 'weekly' },
    { loc: '/category/Cleaning', priority: '0.7', changefreq: 'weekly' },
    { loc: '/category/Health', priority: '0.8', changefreq: 'weekly' },
    { loc: '/category/Watches', priority: '0.8', changefreq: 'weekly' },
    { loc: '/category/WomenClothes', priority: '0.8', changefreq: 'weekly' },
    { loc: '/category/MenClothes', priority: '0.8', changefreq: 'weekly' },
    { loc: '/category/WomenBags', priority: '0.8', changefreq: 'weekly' },
    { loc: '/category/Art', priority: '0.7', changefreq: 'weekly' },
    { loc: '/category/Gaming', priority: '0.8', changefreq: 'weekly' },
    { loc: '/category/RealEstate', priority: '0.9', changefreq: 'daily' },
    { loc: '/category/Pets', priority: '0.8', changefreq: 'weekly' },
    { loc: '/category/Furniture', priority: '0.8', changefreq: 'weekly' },
    
    // Help pages
    { loc: '/help/selling', priority: '0.6', changefreq: 'monthly' },
    { loc: '/help/safety', priority: '0.6', changefreq: 'monthly' },
    { loc: '/help/disputes', priority: '0.6', changefreq: 'monthly' },
    
    // Legal pages
    { loc: '/privacy-and-policy', priority: '0.3', changefreq: 'yearly' },
    { loc: '/term-of-use', priority: '0.3', changefreq: 'yearly' },
];

// ===================== CACHE STATE =====================
let cachedXml = null;
let cachedAt = 0;
let cacheStats = { hits: 0, misses: 0, stale: 0 };
let generationInProgress = false;
let pendingRequests = [];

// ===================== MIDDLEWARE =====================
if (ENABLE_COMPRESSION) {
    router.use(compression({
        threshold: 1024, // Compress responses > 1KB
        level: 6, // Balanced compression
    }));
}

// ===================== HELPER FUNCTIONS =====================
const generateETag = (content) => {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(content).digest('hex');
};

const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

const getCacheAge = () => {
    if (!cachedAt) return 'N/A';
    const age = Math.floor((Date.now() - cachedAt) / 1000);
    if (age < 60) return `${age}s`;
    if (age < 3600) return `${Math.floor(age / 60)}m`;
    return `${Math.floor(age / 3600)}h`;
};

const log = (...args) => {
    if (ENABLE_LOGGING) {
        console.log(`[Sitemap]`, ...args);
    }
};

// ===================== CACHE INVALIDATION =====================
const invalidateSitemapCache = () => {
    cachedXml = null;
    cachedAt = 0;
    log('🗑️ Cache invalidated');
};

// ===================== GENERATE SITEMAP XML =====================
const generateSitemapXml = async (page = 1) => {
    const startTime = Date.now();
    
    try {
        // Get total count for pagination
        const totalPosts = await Post.countDocuments({ in_stock: true });
        const totalPages = Math.ceil(totalPosts / MAX_URLS_PER_SITEMAP);
        
        if (page > totalPages && totalPages > 0) {
            throw new Error(`Page ${page} exceeds total pages (${totalPages})`);
        }

        // Fetch posts with pagination
        const skip = (page - 1) * MAX_URLS_PER_SITEMAP;
        const posts = await Post.find({ in_stock: true })
            .select('_id category brand updatedAt')
            .sort({ updatedAt: -1 }) // Most recent first
            .skip(skip)
            .limit(MAX_URLS_PER_SITEMAP)
            .lean()
            .maxTimeMS(5000); // Timeout after 5 seconds

        log(`📄 Generating page ${page}/${totalPages} with ${posts.length} posts`);

        // Generate post URLs
        const postUrls = posts
            .map((post) => {
                try {
                    const loc = post.category && post.brand
                        ? `${BASE_URL}/posts/${encodeURIComponent(post.category)}/${encodeURIComponent(post.brand)}/${post._id}`
                        : `${BASE_URL}/posts/${post._id}`;

                    if (!isValidUrl(loc)) {
                        console.warn(`⚠️ Invalid URL for post ${post._id}`);
                        return null;
                    }

                    const lastmod = post.updatedAt
                        ? new Date(post.updatedAt).toISOString().split('T')[0]
                        : new Date().toISOString().split('T')[0];

                    return {
                        loc,
                        lastmod,
                        priority: '0.9',
                        changefreq: 'weekly'
                    };
                } catch (error) {
                    console.error(`❌ Error processing post ${post._id}:`, error);
                    return null;
                }
            })
            .filter(Boolean);

        // Combine static and post URLs
        const staticUrlsWithBase = staticUrls.map((u) => ({
            ...u,
            loc: `${BASE_URL}${u.loc}`,
            lastmod: new Date().toISOString().split('T')[0]
        }));

        // For page 1, include static URLs; for other pages, only posts
        const allUrls = page === 1 
            ? [...staticUrlsWithBase, ...postUrls]
            : postUrls;

        // Build XML
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${allUrls
    .map((u) => `  <url>
    <loc>${u.loc}</loc>
${u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : ''}${u.changefreq ? `    <changefreq>${u.changefreq}</changefreq>\n` : ''}    <priority>${u.priority}</priority>
  </url>`)
    .join('\n')}
</urlset>`;

        const duration = Date.now() - startTime;
        log(`✅ Generated ${allUrls.length} URLs in ${duration}ms`);

        return {
            xml,
            count: allUrls.length,
            totalPosts,
            totalPages,
            currentPage: page,
            duration
        };
    } catch (error) {
        console.error('❌ Sitemap generation failed:', error);
        throw error;
    }
};

// ===================== SITEMAP INDEX =====================
router.get('/', async (_req, res) => {
    try {
        const totalPosts = await Post.countDocuments({ in_stock: true });
        const totalUrls = staticUrls.length + totalPosts;
        const totalSitemaps = Math.ceil(totalUrls / MAX_URLS_PER_SITEMAP);

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        for (let i = 1; i <= totalSitemaps; i++) {
            const loc = i === 1 
                ? `${BASE_URL}/sitemap.xml`
                : `${BASE_URL}/sitemap-${i}.xml`;
            
            xml += `
  <sitemap>
    <loc>${loc}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`;
        }

        xml += `
</sitemapindex>`;

        res.header('Content-Type', 'application/xml');
        res.header('Cache-Control', 'public, max-age=3600'); // 1 hour
        res.send(xml);
    } catch (error) {
        console.error('Sitemap index generation failed:', error);
        res.status(500).send('Failed to generate sitemap index');
    }
});

// ===================== MAIN SITEMAP ENDPOINT =====================
router.get('/sitemap.xml', async (req, res) => {
    try {
        const now = Date.now();
        const page = parseInt(req.query.page) || 1;

        // Check if we have a cached version and it's still valid
        if (cachedXml && now - cachedAt < CACHE_TTL && page === 1) {
            cacheStats.hits++;
            
            // Set response headers
            res.header('Content-Type', 'application/xml');
            res.header('Cache-Control', 'public, max-age=900'); // 15 minutes
            res.header('Last-Modified', new Date(cachedAt).toUTCString());
            res.header('ETag', `"${generateETag(cachedXml)}"`);
            res.header('X-Cache', 'HIT');
            res.header('X-Cache-Stats', `Hits: ${cacheStats.hits}, Misses: ${cacheStats.misses}, Stale: ${cacheStats.stale}`);
            res.header('X-Cache-Age', getCacheAge());
            
            log(`📦 Cache HIT (age: ${getCacheAge()})`);
            return res.send(cachedXml);
        }

        // Prevent multiple concurrent generations
        if (generationInProgress) {
            log('⏳ Generation in progress, waiting...');
            
            return new Promise((resolve, reject) => {
                pendingRequests.push({ res, resolve, reject });
                setTimeout(() => {
                    // Timeout after 10 seconds
                    const index = pendingRequests.findIndex(r => r.res === res);
                    if (index !== -1) {
                        pendingRequests.splice(index, 1);
                        res.status(503).send('Sitemap generation in progress, please try again');
                        reject(new Error('Timeout waiting for sitemap generation'));
                    }
                }, 10000);
            });
        }

        // Generate fresh sitemap
        generationInProgress = true;
        cacheStats.misses++;
        log('🔄 Generating fresh sitemap...');

        const result = await generateSitemapXml(page);
        
        // Cache only page 1 (with static URLs)
        if (page === 1) {
            cachedXml = result.xml;
            cachedAt = now;
        }

        // Set response headers
        res.header('Content-Type', 'application/xml');
        res.header('Cache-Control', 'public, max-age=900');
        res.header('Last-Modified', new Date().toUTCString());
        res.header('ETag', `"${generateETag(result.xml)}"`);
        res.header('X-Cache', 'MISS');
        res.header('X-Cache-Stats', `Hits: ${cacheStats.hits}, Misses: ${cacheStats.misses}, Stale: ${cacheStats.stale}`);
        res.header('X-Sitemap-Count', result.count.toString());
        res.header('X-Sitemap-Total-Posts', result.totalPosts.toString());
        res.header('X-Sitemap-Generation-Ms', result.duration.toString());

        res.send(result.xml);

        // Process pending requests with the new cache
        const pending = [...pendingRequests];
        pendingRequests = [];
        pending.forEach(({ resolve, res: pendingRes }) => {
            try {
                pendingRes.header('Content-Type', 'application/xml');
                pendingRes.header('Cache-Control', 'public, max-age=900');
                pendingRes.header('X-Cache', 'PENDING');
                pendingRes.send(cachedXml || result.xml);
                resolve();
            } catch (error) {
                console.error('Failed to serve pending request:', error);
            }
        });

    } catch (error) {
        console.error('❌ Sitemap generation failed:', error);
        
        // Serve stale cache if available
        if (cachedXml) {
            cacheStats.stale++;
            log('⚠️ Serving stale cache due to error');
            
            res.header('Content-Type', 'application/xml');
            res.header('Cache-Control', 'public, max-age=60'); // 1 minute only
            res.header('X-Cache', 'STALE');
            res.header('X-Cache-Stats', `Hits: ${cacheStats.hits}, Misses: ${cacheStats.misses}, Stale: ${cacheStats.stale}`);
            return res.send(cachedXml);
        }
        
        res.status(500).json({
            error: 'Failed to generate sitemap',
            message: error.message
        });
    } finally {
        generationInProgress = false;
    }
});

// ===================== PAGINATED SITEMAP ENDPOINTS =====================
router.get('/sitemap-:page.xml', async (req, res) => {
    try {
        const page = parseInt(req.params.page);
        if (isNaN(page) || page < 2) {
            return res.redirect('/sitemap.xml');
        }

        const result = await generateSitemapXml(page);

        res.header('Content-Type', 'application/xml');
        res.header('Cache-Control', 'public, max-age=3600'); // 1 hour
        res.header('Last-Modified', new Date().toUTCString());
        res.header('X-Sitemap-Count', result.count.toString());
        res.header('X-Sitemap-Page', page.toString());
        res.header('X-Sitemap-Total-Pages', result.totalPages.toString());
        
        res.send(result.xml);
    } catch (error) {
        console.error(`Failed to generate sitemap page ${req.params.page}:`, error);
        res.status(500).send('Failed to generate sitemap');
    }
});

// ===================== STATS & MONITORING =====================
router.get('/sitemap-stats', async (_req, res) => {
    try {
        const totalPosts = await Post.countDocuments({ in_stock: true });
        const totalStatic = staticUrls.length;
        
        res.json({
            cache: {
                isCached: !!cachedXml,
                cacheAge: getCacheAge(),
                cacheTTL: CACHE_TTL / 1000 + 's',
                stats: cacheStats,
                size: cachedXml ? Math.round(cachedXml.length / 1024) + 'KB' : 'N/A'
            },
            urls: {
                static: totalStatic,
                posts: totalPosts,
                total: totalStatic + totalPosts,
                maxPerSitemap: MAX_URLS_PER_SITEMAP
            },
            sitemapPages: Math.ceil((totalStatic + totalPosts) / MAX_URLS_PER_SITEMAP),
            config: {
                baseUrl: BASE_URL,
                compression: ENABLE_COMPRESSION,
                logging: ENABLE_LOGGING
            },
            pendingRequests: pendingRequests.length,
            generationInProgress
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===================== PING SEARCH ENGINES =====================
router.get('/sitemap-ping', async (_req, res) => {
    const searchEngines = [
        `https://www.google.com/ping?sitemap=${encodeURIComponent(BASE_URL)}/sitemap.xml`,
        `https://www.bing.com/ping?sitemap=${encodeURIComponent(BASE_URL)}/sitemap.xml`,
    ];

    try {
        const results = await Promise.allSettled(
            searchEngines.map(async (url) => {
                const response = await fetch(url);
                return { url, status: response.status };
            })
        );

        res.json({
            success: true,
            results: results.map((result, index) => ({
                engine: index === 0 ? 'Google' : 'Bing',
                status: result.status === 'fulfilled' ? result.value.status : 'failed',
                error: result.status === 'rejected' ? result.reason : undefined
            }))
        });
    } catch (error) {
        console.error('Failed to ping search engines:', error);
        res.status(500).json({ error: 'Failed to ping search engines' });
    }
});

// ===================== EXPORTS =====================
module.exports = router;
module.exports.invalidateSitemapCache = invalidateSitemapCache;