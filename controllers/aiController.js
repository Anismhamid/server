const { parseSearchQuery } = require('../services/searchParser');
const { buildMongoQuery } = require('../services/aiMongoSearchService');
const Posts = require('../models/post');

const aiSearch = async (req, res) => {
    try {
        const { query } = req.body;

        if (!query || typeof query !== 'string' || !query.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required',
            });
        }

        if (query.length > 500) {
            return res.status(400).json({
                success: false,
                message: 'Search query is too long',
            });
        }

        // 1. Natural language → filters
        const filters = parseSearchQuery(req.body.query);

        // 2. Filters → MongoDB
        const mongoQuery = buildMongoQuery(filters);

        console.log('🔍 Search Filters:', filters);
        console.log('🔎 MongoDB Query:', mongoQuery);

        // 3. Search
        const posts = await Posts.find(mongoQuery)
            .sort({
                featured: -1,
                createdAt: -1,
            })
            .limit(20)
            .lean();

        return res.status(200).json({
            success: true,
            filters,
            count: posts.length,
            posts,
        });
    } catch (error) {
        console.error('Search error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to process search',
        });
    }
};

module.exports = {
    aiSearch,
};
