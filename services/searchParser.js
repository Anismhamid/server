// ============================================================
// Search Parser
// ============================================================

const { CATEGORY_ALIASES } = require('../utils/categoryAliases');

const { CONDITION_ALIASES } = require('../utils/conditionAliases');

const { normalizeBrand, BRAND_ALIASES } = require('../utils/brandAliases');

const { FUEL_ALIASES } = require('../utils/fuelAliases');

const { TYPE_ALIASES } = require('../utils/typeAliases');

const { MODEL_ALIASES } = require('../utils/modelAliases');

const {
    normalizeText,
    normalizeSearchFilters,
    findCategoryByType,
} = require('../utils/searchNormalizer');

// ============================================================
// Helpers
// ============================================================

function cleanValue(value) {
    if (value === null || value === undefined) {
        return null;
    }

    const cleaned = String(value).trim();

    return cleaned || null;
}

// ============================================================
// Find Alias In Query
// ============================================================

function findAliasInQuery(query, aliasesMap) {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
        return null;
    }

    if (!aliasesMap || typeof aliasesMap !== 'object') {
        return null;
    }

    const matches = [];

    for (const [canonical, aliases] of Object.entries(aliasesMap)) {
        if (!Array.isArray(aliases)) {
            continue;
        }

        const allAliases = [canonical, ...aliases];

        for (const alias of allAliases) {
            const normalizedAlias = normalizeText(alias);

            if (!normalizedAlias) {
                continue;
            }

            // ----------------------------------------------
            // Exact query
            // ----------------------------------------------

            if (normalizedQuery === normalizedAlias) {
                matches.push({
                    canonical,
                    alias: normalizedAlias,
                    length: normalizedAlias.length,
                    exact: true,
                });

                continue;
            }

            // ----------------------------------------------
            // Word-boundary matching
            // ----------------------------------------------

            const index = normalizedQuery.indexOf(normalizedAlias);

            if (index === -1) {
                continue;
            }

            const before = index === 0 ? '' : normalizedQuery[index - 1];

            const afterIndex = index + normalizedAlias.length;

            const after =
                afterIndex >= normalizedQuery.length
                    ? ''
                    : normalizedQuery[afterIndex];

            const boundaryRegex = /[\s\-_/.,!?؟،:;()[\]{}]/u;

            const isBoundaryBefore = !before || boundaryRegex.test(before);

            const isBoundaryAfter = !after || boundaryRegex.test(after);

            if (isBoundaryBefore && isBoundaryAfter) {
                matches.push({
                    canonical,
                    alias: normalizedAlias,
                    length: normalizedAlias.length,
                    exact: false,
                });
            }
        }
    }

    if (!matches.length) {
        return null;
    }

    matches.sort((a, b) => {
        if (a.exact !== b.exact) {
            return a.exact ? -1 : 1;
        }

        return b.length - a.length;
    });

    return matches[0].canonical;
}

// ============================================================
// Find All Aliases
// ============================================================

function findAllAliasesInQuery(query, aliasesMap) {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
        return [];
    }

    if (!aliasesMap || typeof aliasesMap !== 'object') {
        return [];
    }

    const matches = [];

    for (const [canonical, aliases] of Object.entries(aliasesMap)) {
        if (!Array.isArray(aliases)) {
            continue;
        }

        const allAliases = [canonical, ...aliases];

        let bestMatch = null;

        for (const alias of allAliases) {
            const normalizedAlias = normalizeText(alias);

            if (!normalizedAlias) {
                continue;
            }

            const index = normalizedQuery.indexOf(normalizedAlias);

            if (index === -1) {
                continue;
            }

            if (!bestMatch || normalizedAlias.length > bestMatch.length) {
                bestMatch = normalizedAlias;
            }
        }

        if (bestMatch) {
            matches.push({
                canonical,
                alias: bestMatch,
                length: bestMatch.length,
            });
        }
    }

    matches.sort((a, b) => b.length - a.length);

    return matches;
}

// ============================================================
// Brand
// ============================================================

function findBrandInQuery(query) {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
        return null;
    }

    const aliasMatch = findAliasInQuery(normalizedQuery, BRAND_ALIASES);

    if (aliasMatch) {
        return normalizeBrand(aliasMatch) || null;
    }

    for (const canonical of Object.keys(BRAND_ALIASES || {})) {
        const normalizedCanonical = normalizeText(canonical);

        if (
            normalizedCanonical &&
            normalizedQuery.includes(normalizedCanonical)
        ) {
            return normalizeBrand(canonical) || null;
        }
    }

    return null;
}

// ============================================================
// Category + Type
// ============================================================

function findCategoryAndType(query) {
    const category = findAliasInQuery(query, CATEGORY_ALIASES);

    const type = findAliasInQuery(query, TYPE_ALIASES);

    if (category) {
        return {
            category,
            type,
        };
    }

    if (type) {
        const inferredCategory = findCategoryByType(type);

        return {
            category: inferredCategory || null,
            type,
        };
    }

    return {
        category: null,
        type: null,
    };
}

// ============================================================
// Fuel
// ============================================================

function findFuelInQuery(query) {
    return findAliasInQuery(query, FUEL_ALIASES);
}

// ============================================================
// Condition
// ============================================================

function findConditionInQuery(query) {
    return findAliasInQuery(query, CONDITION_ALIASES);
}

// ============================================================
// Storage
// ============================================================

function findStorageInQuery(query) {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
        return null;
    }

    const match = normalizedQuery.match(/\b(\d+(?:\.\d+)?)\s*(gb|tb)\b/i);

    if (!match) {
        return null;
    }

    return `${match[1]}${match[2].toUpperCase()}`;
}

// ============================================================
// Price
// ============================================================

function findPriceInQuery(query) {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
        return {
            minPrice: null,
            maxPrice: null,
        };
    }

    let minPrice = null;
    let maxPrice = null;

    // --------------------------------------------------------
    // Range
    //
    // 1000 - 5000
    // 1000 to 5000
    // 1000 حتى 5000
    // 1000 עד 5000
    // --------------------------------------------------------

    const rangeMatch = normalizedQuery.match(
        /(\d[\d,]*)\s*(?:-|to|حتى|الى|إلى|עד)\s*(\d[\d,]*)/i,
    );

    if (rangeMatch) {
        minPrice = Number(rangeMatch[1].replace(/,/g, ''));

        maxPrice = Number(rangeMatch[2].replace(/,/g, ''));

        return {
            minPrice: Number.isFinite(minPrice) ? minPrice : null,

            maxPrice: Number.isFinite(maxPrice) ? maxPrice : null,
        };
    }

    // --------------------------------------------------------
    // Maximum
    // --------------------------------------------------------

    const maxMatch = normalizedQuery.match(
        /(?:under|below|up to|maximum|max|أقل من|اقل من|حد أقصى|حتى|עד)\s*(\d[\d,]*)/i,
    );

    if (maxMatch) {
        maxPrice = Number(maxMatch[1].replace(/,/g, ''));
    }

    // --------------------------------------------------------
    // Minimum
    // --------------------------------------------------------

    const minMatch = normalizedQuery.match(
        /(?:over|above|minimum|min|أكثر من|اكثر من|من|ابتداء من|מעל|לפחות)\s*(\d[\d,]*)/i,
    );

    if (minMatch) {
        minPrice = Number(minMatch[1].replace(/,/g, ''));
    }

    return {
        minPrice: Number.isFinite(minPrice) ? minPrice : null,

        maxPrice: Number.isFinite(maxPrice) ? maxPrice : null,
    };
}

// ============================================================
// Currency
// ============================================================

function findCurrencyInQuery(query) {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
        return null;
    }

    const currencies = [
        'ils',
        'nis',
        '₪',

        'shekel',
        'shekels',

        'شيكل',
        'شيكل اسرائيلي',
        'شيكل إسرائيلي',

        'שקל',
        'שקלים',
    ];

    for (const currency of currencies) {
        const normalizedCurrency = normalizeText(currency);

        if (
            normalizedCurrency &&
            normalizedQuery.includes(normalizedCurrency)
        ) {
            return 'ILS';
        }
    }

    return null;
}

// ============================================================
// Near Me
// ============================================================

function findNearMeInQuery(query) {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
        return null;
    }

    const aliases = [
        'near me',
        'nearby',
        'around me',

        'بالقرب مني',
        'قريب مني',
        'بالمنطقة',

        'לידי',
        'קרוב אלי',
        'באזור שלי',
    ];

    return aliases.some((alias) =>
        normalizedQuery.includes(normalizeText(alias)),
    )
        ? true
        : null;
}

// ============================================================
// Model
// ============================================================

function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildModelQuery(model, brand) {
    const aliases = getBrandModelAliases(brand, model) || [];

    const values = [model, ...aliases];

    const uniqueValues = [...new Set(values.filter(Boolean).map(String))];

    return {
        $in: uniqueValues.map(
            (value) => new RegExp(`^${escapeRegex(value)}$`, 'i'),
        ),
    };
}

function findModelInQuery(query, brand = null) {
    const normalizedQuery = normalizeText(query);

    // إذا عرفنا البراند، ابحث داخله فقط
    if (brand && MODEL_ALIASES[brand]) {
        const models = MODEL_ALIASES[brand];

        const matches = [];

        for (const [canonicalModel, aliases] of Object.entries(models)) {
            const allAliases = [
                canonicalModel,
                ...(Array.isArray(aliases) ? aliases : []),
            ];

            for (const alias of allAliases) {
                const normalizedAlias = normalizeText(alias);

                if (!normalizedAlias) continue;

                const regex = new RegExp(
                    `(^|[\\s\\-_/.,!?؟،:;()[\\]{}])${escapeRegExp(normalizedAlias)}(?=$|[\\s\\-_/.,!?؟،:;()[\\]{}])`,
                    'iu',
                );

                if (regex.test(normalizedQuery)) {
                    matches.push({
                        model: canonicalModel,
                        alias: normalizedAlias,
                        length: normalizedAlias.length,
                    });

                    break;
                }
            }
        }

        if (matches.length > 0) {
            matches.sort((a, b) => b.length - a.length);
            return matches[0].model;
        }
    }

    // إذا لم نعرف البراند، ابحث في جميع البراندات
    const matches = [];

    for (const [brandName, models] of Object.entries(MODEL_ALIASES)) {
        for (const [canonicalModel, aliases] of Object.entries(models)) {
            const allAliases = [
                canonicalModel,
                ...(Array.isArray(aliases) ? aliases : []),
            ];

            for (const alias of allAliases) {
                const normalizedAlias = normalizeText(alias);

                if (!normalizedAlias) continue;

                const regex = new RegExp(
                    `(^|[\\s\\-_/.,!?؟،:;()[\\]{}])${escapeRegExp(normalizedAlias)}(?=$|[\\s\\-_/.,!?؟،:;()[\\]{}])`,
                    'iu',
                );

                if (regex.test(normalizedQuery)) {
                    matches.push({
                        brand: brandName,
                        model: canonicalModel,
                        alias: normalizedAlias,
                        length: normalizedAlias.length,
                    });

                    break;
                }
            }
        }
    }

    if (matches.length === 0) {
        return null;
    }

    // الأطول أولاً حتى:
    // iPhone 15 Pro Max
    // يتغلب على:
    // iPhone 15 Pro
    // ويتغلب على:
    // iPhone 15
    matches.sort((a, b) => b.length - a.length);

    return matches[0].model;
}

// ============================================================
// Find Brand By Model
// ============================================================

function findBrandByModel(model) {
    if (!model) {
        return null;
    }

    for (const [brand, models] of Object.entries(MODEL_ALIASES)) {
        if (Object.prototype.hasOwnProperty.call(models, model)) {
            return brand;
        }
    }

    return null;
}

// ============================================================
// Parse Search Query
// ============================================================

function parseSearchQuery(query) {
    const cleanQuery = cleanValue(query);

    if (!cleanQuery) {
        return normalizeSearchFilters({});
    }

    // --------------------------------------------------------
    // Category + Type
    // --------------------------------------------------------

    const { category, type } = findCategoryAndType(cleanQuery);

    // --------------------------------------------------------
    // Brand
    // --------------------------------------------------------

    let brand = findBrandInQuery(cleanQuery);

    // --------------------------------------------------------
    // Model
    // --------------------------------------------------------

    const model = findModelInQuery(cleanQuery, brand);

    // --------------------------------------------------------
    // Infer brand from model
    // --------------------------------------------------------

    if (!brand && model) {
        brand = findBrandByModel(model);
    }

    // --------------------------------------------------------
    // Condition
    // --------------------------------------------------------

    const condition = findConditionInQuery(cleanQuery);

    // --------------------------------------------------------
    // Fuel
    // --------------------------------------------------------

    const fuel = findFuelInQuery(cleanQuery);

    // --------------------------------------------------------
    // Storage
    // --------------------------------------------------------

    const storage = findStorageInQuery(cleanQuery);

    // --------------------------------------------------------
    // Price
    // --------------------------------------------------------

    const { minPrice, maxPrice } = findPriceInQuery(cleanQuery);

    // --------------------------------------------------------
    // Currency
    // --------------------------------------------------------

    const currency = findCurrencyInQuery(cleanQuery);

    // --------------------------------------------------------
    // Near Me
    // --------------------------------------------------------

    const nearMe = findNearMeInQuery(cleanQuery);

    // --------------------------------------------------------
    // Raw filters
    // --------------------------------------------------------

    const rawFilters = {
        query: cleanQuery,

        brand,
        model,

        category,
        type,

        subcategory: null,

        storage,

        condition,

        fuel,

        maxPrice,
        minPrice,

        currency,

        location: null,

        nearMe,
    };

    // --------------------------------------------------------
    // Final normalization
    // --------------------------------------------------------

    const filters = normalizeSearchFilters(rawFilters);

    console.log('🧠 Parsed Search:', filters);

    return filters;
}

// ============================================================
// Exports
// ============================================================

module.exports = {
    parseSearchQuery,

    findModelInQuery,

    findAliasInQuery,

    findAllAliasesInQuery,

    findBrandInQuery,

    findCategoryAndType,

    findFuelInQuery,

    findConditionInQuery,

    findStorageInQuery,

    findPriceInQuery,

    findCurrencyInQuery,

    findNearMeInQuery,
};
