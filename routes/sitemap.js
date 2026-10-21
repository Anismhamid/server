const express = require('express');
const crypto = require('crypto');
const compression = require('compression');
const Post = require('../models/post');
const { BASE_URL, escapeXml, buildPostUrl } = require('../utils/postUrl');

const router = express.Router();

// ===================== CONFIG =====================
const MAX_URLS_PER_SITEMAP = 50000;
const CACHE_TTL = 1000 * 60 * 15;
const ENABLE_LOGGING =
    process.env.NODE_ENV !== 'production' || process.env.LOG_SITEMAP === 'true';

const publicPostFilter = { in_stock: true, status: 'accepted' };

const staticUrls = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/about', priority: '0.7', changefreq: 'monthly' },
    { loc: '/contact', priority: '0.7', changefreq: 'monthly' },
    { loc: '/categories', priority: '0.8', changefreq: 'weekly' },
    { loc: '/discounts-and-offers', priority: '0.8', changefreq: 'daily' },
    { loc: '/blog', priority: '0.6', changefreq: 'weekly' },
    { loc: '/jobs', priority: '0.8', changefreq: 'weekly' },

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
    { loc: '/category/cameras', priority: '0.8', changefreq: 'weekly' },
    { loc: '/category/books', priority: '0.8', changefreq: 'weekly' },
    { loc: '/category/musicalInstruments', priority: '0.8', changefreq: 'weekly' },
    { loc: '/category/constructionEquipment', priority: '0.8', changefreq: 'weekly' },
    { loc: '/category/industrialEquipment', priority: '0.8', changefreq: 'weekly' },
    { loc: '/category/weldingEquipment', priority: '0.8', changefreq: 'weekly' },
    { loc: '/category/officeEquipment', priority: '0.8', changefreq: 'weekly' },
    { loc: '/category/Services', priority: '0.8', changefreq: 'weekly' },

    { loc: '/help/selling', priority: '0.6', changefreq: 'monthly' },
    { loc: '/help/safety', priority: '0.6', changefreq: 'monthly' },
    { loc: '/help/disputes', priority: '0.6', changefreq: 'monthly' },

    { loc: '/privacy-and-policy', priority: '0.3', changefreq: 'yearly' },
    { loc: '/term-of-use', priority: '0.3', changefreq: 'yearly' },
];

// ===================== STATE =====================
const cache = new Map(); // page -> { xml, at, count, totalPages }
const inflight = new Map(); // page -> Promise
const stats = { hits: 0, misses: 0, stale: 0 };

const log = (...args) => ENABLE_LOGGING && console.log('[Sitemap]', ...args);

router.use(compression({ threshold: 1024, level: 6 }));

// ===================== GENERATION =====================
const getLayout = async () => {
    const totalPosts = await Post.countDocuments(publicPostFilter);
    const firstPageCapacity = MAX_URLS_PER_SITEMAP - staticUrls.length;
    const remaining = Math.max(0, totalPosts - firstPageCapacity);
    const totalPages =
        totalPosts <= firstPageCapacity
            ? 1
            : 1 + Math.ceil(remaining / MAX_URLS_PER_SITEMAP);
    return { totalPosts, firstPageCapacity, totalPages };
};

const generateSitemapXml = async (page) => {
    const startedAt = Date.now();
    const { totalPosts, firstPageCapacity, totalPages } = await getLayout();

    if (!Number.isInteger(page) || page < 1 || page > totalPages) {
        const err = new Error(`Invalid sitemap page: ${page}`);
        err.status = 404;
        throw err;
    }

    const limit = page === 1 ? firstPageCapacity : MAX_URLS_PER_SITEMAP;
    const skip =
        page === 1 ? 0 : firstPageCapacity + (page - 2) * MAX_URLS_PER_SITEMAP;

    const posts = await Post.find(publicPostFilter)
        .select('_id category product_name seller updatedAt')
        .populate({ path: 'seller', select: 'slug' })
        .sort({ updatedAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .maxTimeMS(10000);

    const postUrls = posts.map((post) => ({
        loc: buildPostUrl(post),
        lastmod: post.updatedAt
            ? new Date(post.updatedAt).toISOString().split('T')[0]
            : undefined,
        priority: '0.9',
        changefreq: 'weekly',
    }));

    const allUrls =
        page === 1
            ? [
                  ...staticUrls.map((u) => ({
                      ...u,
                      loc: `${BASE_URL}${u.loc}`,
                  })),
                  ...postUrls,
              ]
            : postUrls;

    const body = allUrls
        .map(
            (u) =>
                `  <url>\n    <loc>${escapeXml(u.loc)}</loc>\n` +
                (u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : '') +
                `    <changefreq>${u.changefreq}</changefreq>\n` +
                `    <priority>${u.priority}</priority>\n  </url>`,
        )
        .join('\n');

    const xml =
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;

    log(
        `page ${page}/${totalPages}: ${allUrls.length} URLs in ${Date.now() - startedAt}ms`,
    );

    return { xml, count: allUrls.length, totalPages, totalPosts };
};

// cache + dedupe: أكتر من request على نفس الصفحة بيشاركوا نفس الـ promise
const getSitemap = async (page) => {
    const hit = cache.get(page);
    if (hit && Date.now() - hit.at < CACHE_TTL) {
        stats.hits++;
        return { ...hit, cacheStatus: 'HIT' };
    }

    if (inflight.has(page)) return inflight.get(page);

    stats.misses++;
    const promise = generateSitemapXml(page)
        .then((result) => {
            const entry = { ...result, at: Date.now() };
            cache.set(page, entry);
            return { ...entry, cacheStatus: 'MISS' };
        })
        .catch((err) => {
            // لو في نسخة قديمة، قدّمها بدل ما تفشل (إلا لو الصفحة غير موجودة)
            if (hit && err.status !== 404) {
                stats.stale++;
                return { ...hit, cacheStatus: 'STALE' };
            }
            throw err;
        })
        .finally(() => inflight.delete(page));

    inflight.set(page, promise);
    return promise;
};

const sendSitemap = async (res, page) => {
    try {
        const r = await getSitemap(page);
        const etag = `"${crypto.createHash('md5').update(r.xml).digest('hex')}"`;

        res.type('application/xml; charset=utf-8');
        res.set(
            'Cache-Control',
            `public, max-age=${r.cacheStatus === 'STALE' ? 60 : 900}`,
        );
        res.set('Last-Modified', new Date(r.at).toUTCString());
        res.set('ETag', etag);
        res.set('X-Cache', r.cacheStatus);
        res.set('X-Sitemap-Count', String(r.count));
        res.set('X-Sitemap-Total-Pages', String(r.totalPages));
        return res.send(r.xml);
    } catch (error) {
        if (error.status === 404)
            return res.status(404).send('Sitemap not found');
        console.error('Sitemap generation failed:', error);
        return res.status(500).send('Failed to generate sitemap');
    }
};

// ===================== ROUTES =====================
router.get('/sitemap.xml', (_req, res) => sendSitemap(res, 1));

router.get('/sitemap-:page.xml', (req, res) => {
    const page = Number.parseInt(req.params.page, 10);
    if (!Number.isInteger(page) || page < 2) {
        return res.status(400).send('Invalid sitemap page');
    }
    return sendSitemap(res, page);
});

router.get('/sitemap-index.xml', async (_req, res) => {
    try {
        const { totalPages } = await getLayout();
        const lastmod = new Date().toISOString();

        const items = Array.from({ length: totalPages }, (_, i) => {
            const page = i + 1;
            const loc =
                page === 1
                    ? `${BASE_URL}/sitemap.xml`
                    : `${BASE_URL}/sitemap-${page}.xml`;
            return `  <sitemap>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`;
        }).join('\n');

        res.type('application/xml; charset=utf-8');
        res.set('Cache-Control', 'public, max-age=900');
        res.send(
            `<?xml version="1.0" encoding="UTF-8"?>\n` +
                `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>`,
        );
    } catch (error) {
        console.error('Sitemap index failed:', error);
        res.status(500).send('Failed to generate sitemap index');
    }
});

// محمي بـ token (ضيف SITEMAP_STATS_TOKEN بالـ env)
router.get('/sitemap-stats', async (req, res) => {
    const token = process.env.SITEMAP_STATS_TOKEN;
    if (!token || req.get('x-admin-token') !== token) {
        return res.status(404).end();
    }
    try {
        const { totalPosts, totalPages } = await getLayout();
        res.json({
            cache: {
                pages: [...cache.entries()].map(([page, e]) => ({
                    page,
                    ageSec: Math.floor((Date.now() - e.at) / 1000),
                    sizeKB: Math.round(e.xml.length / 1024),
                })),
                stats,
                ttlSec: CACHE_TTL / 1000,
            },
            urls: {
                static: staticUrls.length,
                posts: totalPosts,
                pages: totalPages,
            },
            inflight: [...inflight.keys()],
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===================== EXPORTS =====================
const invalidateSitemapCache = () => {
    cache.clear();
    log('🗑️ Cache invalidated');
};

module.exports = router;
module.exports.invalidateSitemapCache = invalidateSitemapCache;
