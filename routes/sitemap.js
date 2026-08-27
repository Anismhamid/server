// server/routes/sitemap.js
const { Router } = require('express');
const Post = require('../models/post');

const router = Router();
const BASE_URL = 'https://client-qqq1.vercel.app';

const staticUrls = [
    { loc: '/', priority: '1.0' },
    { loc: '/about', priority: '0.7' },
    { loc: '/contact', priority: '0.7' },
    { loc: '/categories', priority: '0.8' },
    { loc: '/discounts-and-offers', priority: '0.8' },
    { loc: '/blog', priority: '0.6' },
    { loc: '/category/Cars', priority: '0.9' },
    { loc: '/category/Motorcycles', priority: '0.9' },
    { loc: '/category/Bikes', priority: '0.9' },
    { loc: '/category/Trucks', priority: '0.9' },
    { loc: '/category/ElectricVehicles', priority: '0.9' },
    { loc: '/category/House', priority: '0.8' },
    { loc: '/category/Garden', priority: '0.8' },
    { loc: '/category/Baby', priority: '0.8' },
    { loc: '/category/Electronics', priority: '0.9' },
    { loc: '/category/Kids', priority: '0.8' },
    { loc: '/category/Beauty', priority: '0.8' },
    { loc: '/category/Cleaning', priority: '0.7' },
    { loc: '/category/Health', priority: '0.8' },
    { loc: '/category/Watches', priority: '0.8' },
    { loc: '/category/WomenClothes', priority: '0.8' },
    { loc: '/category/MenClothes', priority: '0.8' },
    { loc: '/category/WomenBags', priority: '0.8' },
    { loc: '/category/Art', priority: '0.7' },
    { loc: '/category/Gaming', priority: '0.8' },
    { loc: '/category/RealEstate', priority: '0.9' },
    { loc: '/category/Pets', priority: '0.8' },
    { loc: '/category/Furniture', priority: '0.8' },
    { loc: '/help/selling', priority: '0.6' },
    { loc: '/help/safety', priority: '0.6' },
    { loc: '/help/disputes', priority: '0.6' },
    { loc: '/privacy-and-policy', priority: '0.3' },
    { loc: '/term-of-use', priority: '0.3' },
];

let cachedXml = null;
let cachedAt = 0;
const CACHE_TTL = 1000 * 60 * 15; // 15 دقيقة

const invalidateSitemapCache = () => {
    cachedXml = null;
};

router.get('/sitemap.xml', async (_req, res) => {
    try {
        const now = Date.now();
        if (cachedXml && now - cachedAt < CACHE_TTL) {
            res.header('Content-Type', 'application/xml');
            return res.send(cachedXml);
        }

        const posts = await Post.find({ isActive: true })
            .select('_id category brand updatedAt')
            .lean();

        const postUrls = posts.map((post) => {
            const loc =
                post.category && post.brand
                    ? `${BASE_URL}/posts/${post.category}/${post.brand}/${post._id}`
                    : `${BASE_URL}/posts/${post._id}`;
            const lastmod = post.updatedAt
                ? new Date(post.updatedAt).toISOString().split('T')[0]
                : undefined;
            return { loc, lastmod, priority: '0.9' };
        });

        const allUrls = [
            ...staticUrls.map((u) => ({ ...u, loc: `${BASE_URL}${u.loc}` })),
            ...postUrls,
        ];

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
    .map(
        (u) => `  <url>
    <loc>${u.loc}</loc>
${u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : ''}    <priority>${u.priority}</priority>
  </url>`,
    )
    .join('\n')}
</urlset>`;

        cachedXml = xml;
        cachedAt = now;

        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (err) {
        console.error('Sitemap generation failed:', err);
        res.status(500).send('Failed to generate sitemap');
    }
});

module.exports = router;
module.exports.invalidateSitemapCache = invalidateSitemapCache;