const router = require('express').Router();
const BlogPost = require('../models/BlogPost');
const auth = require('../middlewares/auth');
const { requireRole } = require('../middlewares/userPermissions');

const staff = [auth, requireRole('Admin', 'Moderator')];

const STATUSES = ['draft', 'published'];

const slugify = (s) =>
    s
        .trim()
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);

const uniqueSlug = async (title) => {
    const base = slugify(title) || 'post';
    let slug = base;
    while (await BlogPost.exists({ slug })) {
        slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    }
    return slug;
};

const normalizeTags = (tags) =>
    Array.isArray(tags)
        ? [...new Set(tags.map((t) => String(t).trim()).filter(Boolean))].slice(
              0,
              10,
          )
        : [];

const handleError = (res, e) => {
    if (e.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid id' });
    }
    if (e.name === 'ValidationError') {
        return res.status(400).json({ message: e.message });
    }
    console.error('Blog error:', e);
    return res.status(500).json({ message: 'Server error' });
};

// sitemap handler (also mounted in app.js at /sitemap/blog.xml)
const blogSitemap = async (req, res) => {
    try {
        const base = process.env.CLIENT_URL || 'https://client-qqq1.vercel.app';
        const posts = await BlogPost.find({ status: 'published' })
            .select('slug updatedAt')
            .lean();
        const urls = [
            `<url><loc>${base}/blog</loc></url>`,
            ...posts.map(
                (p) =>
                    `<url><loc>${base}/blog/${encodeURIComponent(p.slug)}</loc><lastmod>${p.updatedAt.toISOString()}</lastmod></url>`,
            ),
        ].join('');
        res.set('Cache-Control', 'public, max-age=3600');
        res.type('application/xml').send(
            `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
        );
    } catch (e) {
        handleError(res, e);
    }
};

// public: list
router.get('/', async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(20, parseInt(req.query.limit) || 9);
        const filter = { status: 'published' };
        if (req.query.tag) filter.tags = String(req.query.tag);

        const [items, total] = await Promise.all([
            BlogPost.find(filter)
                .select('-content')
                .sort({ publishedAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            BlogPost.countDocuments(filter),
        ]);
        res.json({ items, total, pages: Math.ceil(total / limit) });
    } catch (e) {
        handleError(res, e);
    }
});

// public: sitemap
router.get('/sitemap.xml', blogSitemap);

// staff: list all (including drafts)
router.get('/admin/list', ...staff, async (req, res) => {
    try {
        const items = await BlogPost.find()
            .select('-content')
            .sort({ createdAt: -1 })
            .lean();
        res.json(items);
    } catch (e) {
        handleError(res, e);
    }
});

// staff: get one by id (for editing)
router.get('/admin/:id', ...staff, async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id).lean();
        if (!post) return res.status(404).json({ message: 'Not found' });
        res.json(post);
    } catch (e) {
        handleError(res, e);
    }
});

// public: related posts
router.get('/:slug/related', async (req, res) => {
    try {
        const current = await BlogPost.findOne({
            slug: req.params.slug,
            status: 'published',
        })
            .select('tags')
            .lean();
        if (!current) return res.json([]);

        const base = { status: 'published', slug: { $ne: req.params.slug } };

        let items = await BlogPost.find({
            ...base,
            tags: { $in: current.tags },
        })
            .select('-content')
            .sort({ publishedAt: -1 })
            .limit(3)
            .lean();

        if (items.length < 3) {
            const more = await BlogPost.find({
                ...base,
                _id: { $nin: items.map((i) => i._id) },
            })
                .select('-content')
                .sort({ publishedAt: -1 })
                .limit(3 - items.length)
                .lean();
            items = [...items, ...more];
        }
        res.json(items);
    } catch (e) {
        handleError(res, e);
    }
});

// public: single
router.get('/:slug', async (req, res) => {
    try {
        const post = await BlogPost.findOneAndUpdate(
            { slug: req.params.slug, status: 'published' },
            { $inc: { views: 1 } },
            { new: true },
        ).lean();
        if (!post) return res.status(404).json({ message: 'Not found' });
        res.json(post);
    } catch (e) {
        handleError(res, e);
    }
});

// staff: create
router.post('/', ...staff, async (req, res) => {
    try {
        const { title, content, excerpt, coverImage, tags, status } = req.body;

        if (!title?.trim() || !content?.trim()) {
            return res
                .status(400)
                .json({ message: 'title and content required' });
        }
        if (status !== undefined && !STATUSES.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const isDraft = status === 'draft';

        const post = await BlogPost.create({
            title: title.trim(),
            content,
            excerpt,
            coverImage,
            tags: normalizeTags(tags),
            status: isDraft ? 'draft' : 'published',
            publishedAt: isDraft ? undefined : new Date(),
            slug: await uniqueSlug(title),
            authorName:
                [req.user?.name?.first, req.user?.name?.last]
                    .filter(Boolean)
                    .join(' ') || 'صفقة',
        });
        res.status(201).json(post);
    } catch (e) {
        handleError(res, e);
    }
});

// staff: update
router.patch('/:id', ...staff, async (req, res) => {
    try {
        const allowed = [
            'title',
            'content',
            'excerpt',
            'coverImage',
            'tags',
            'status',
        ];
        const update = {};
        for (const k of allowed) {
            if (req.body[k] !== undefined) update[k] = req.body[k];
        }

        if (update.status !== undefined && !STATUSES.includes(update.status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        if (update.tags !== undefined) update.tags = normalizeTags(update.tags);

        const current = await BlogPost.findById(req.params.id);
        if (!current) return res.status(404).json({ message: 'Not found' });

        if (update.status === 'published' && !current.publishedAt) {
            update.publishedAt = new Date();
        }

        Object.assign(current, update);
        await current.save();
        res.json(current);
    } catch (e) {
        handleError(res, e);
    }
});

// staff: delete
router.delete('/:id', ...staff, async (req, res) => {
    try {
        const deleted = await BlogPost.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Not found' });
        res.status(204).end();
    } catch (e) {
        handleError(res, e);
    }
});

module.exports = router;
module.exports.blogSitemap = blogSitemap;