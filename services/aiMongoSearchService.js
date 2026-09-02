const Posts = require('../models/post');

const {
    getBrandAliases,
} = require('../utils/brandAliases');

const {
    FUEL_ALIASES,
} = require('../utils/fuelAliases');

function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildModelQuery(model, brand) {
    const aliases = getBrandModelAliases(brand, model) || [];

    const values = [
        model,
        ...aliases,
    ];

    const uniqueValues = [
        ...new Set(
            values
                .filter(Boolean)
                .map(String)
        ),
    ];

    return {
        $in: uniqueValues.map(
            value =>
                new RegExp(
                    `^${escapeRegex(value)}$`,
                    'i'
                )
        ),
    };
}

function aliasesToRegex(aliases) {
    return aliases.map(
        (alias) =>
            new RegExp(
                `^${escapeRegex(alias)}$`,
                'i'
            )
    );
}

function buildMongoQuery(filters) {
    const query = {
        in_stock: true,

        status: {
            $ne: 'sold',
        },
    };

    // ========================================
    // Category
    // ========================================

    if (filters.category) {
        query.category = filters.category;
    }

    // ========================================
    // Type
    // ========================================

    if (filters.type) {
        query.type = filters.type;
    }

    // ========================================
    // Subcategory
    // ========================================

    if (filters.subcategory) {
        query.subcategory =
            filters.subcategory;
    }

    // ========================================
    // Brand - Multilingual
    // ========================================

    if (filters.brand) {
        const aliases =
            getBrandAliases(filters.brand);

        if (aliases.length > 0) {
            query.brand = {
                $in: aliasesToRegex(aliases),
            };
        } else {
            query.brand = {
                $regex: escapeRegex(
                    filters.brand
                ),
                $options: 'i',
            };
        }
    }

    // ========================================
    // Model
    // ========================================

    if (filters.model) {
        query.model = {
            $regex: escapeRegex(
                filters.model
            ),
            $options: 'i',
        };
    }

    // ========================================
    // Fuel - Multilingual
    // ========================================

    if (filters.fuel) {
        const fuelAliases =
            FUEL_ALIASES[
                filters.fuel
            ];

        if (
            Array.isArray(fuelAliases) &&
            fuelAliases.length > 0
        ) {
            query.fuel = {
                $in: aliasesToRegex(
                    fuelAliases
                ),
            };
        } else {
            query.fuel = {
                $regex: escapeRegex(
                    filters.fuel
                ),
                $options: 'i',
            };
        }
    }

    // ========================================
    // Condition
    // ========================================

    if (filters.condition) {
        query.condition =
            filters.condition;
    }

    // ========================================
    // Price
    // ========================================

    if (
        typeof filters.minPrice ===
            'number' ||
        typeof filters.maxPrice ===
            'number'
    ) {
        query.price = {};

        if (
            typeof filters.minPrice ===
            'number'
        ) {
            query.price.$gte =
                filters.minPrice;
        }

        if (
            typeof filters.maxPrice ===
            'number'
        ) {
            query.price.$lte =
                filters.maxPrice;
        }
    }

    // ========================================
    // Location
    // ========================================

    if (filters.location) {
        query.location = {
            $regex: escapeRegex(
                filters.location
            ),
            $options: 'i',
        };
    }

    return query;
}

async function searchPosts(filters) {
    const mongoQuery =
        buildMongoQuery(filters);

    const posts = await Posts.find(
        mongoQuery
    )
        .sort({
            featured: -1,
            createdAt: -1,
        })
        .limit(20)
        .lean();

    return {
        mongoQuery,
        posts,
        count: posts.length,
    };
}

module.exports = {
    buildMongoQuery,
    searchPosts,
};