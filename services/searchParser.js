// ============================================================
// Search Parser
// ============================================================

const { CATEGORY_ALIASES } = require('../utils/categoryAliases');

const { CONDITION_ALIASES } = require('../utils/conditionAliases');

const { normalizeBrand } = require('../utils/brandAliases');

const { BRAND_ALIASES } = require('../utils/brandAliases');

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

/**
 * Finds the best alias inside the user's query.
 *
 * Example:
 *
 * "بدي سيارة هيونداي بنزين"
 *
 * can detect:
 *
 * Hyundai
 * gasoline
 * Cars
 *
 * Longest alias wins.
 */
function findAliasInQuery(query, aliasesMap) {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
        return null;
    }

    const matches = [];

    for (const [canonical, aliases] of Object.entries(aliasesMap || {})) {
        if (!Array.isArray(aliases)) {
            continue;
        }

        for (const alias of aliases) {
            const normalizedAlias = normalizeText(alias);

            if (!normalizedAlias) {
                continue;
            }

            /*
             * Exact query
             */
            if (normalizedQuery === normalizedAlias) {
                matches.push({
                    canonical,
                    alias: normalizedAlias,
                    length: normalizedAlias.length,
                    exact: true,
                });

                continue;
            }

            /*
             * Search inside the sentence.
             *
             * We use spaces around the query
             * to reduce partial-word matches.
             */
            const paddedQuery = ` ${normalizedQuery} `;
            const paddedAlias = ` ${normalizedAlias} `;

            if (paddedQuery.includes(paddedAlias)) {
                matches.push({
                    canonical,
                    alias: normalizedAlias,
                    length: normalizedAlias.length,
                    exact: false,
                });

                continue;
            }

            /*
             * For multi-word aliases and cases where
             * punctuation exists.
             */
            const index = normalizedQuery.indexOf(normalizedAlias);

            if (index !== -1) {
                const before = index === 0 ? '' : normalizedQuery[index - 1];

                const after =
                    index + normalizedAlias.length >= normalizedQuery.length
                        ? ''
                        : normalizedQuery[index + normalizedAlias.length];

                const isBoundaryBefore =
                    !before || /[\s\-_/.,!?؟،:;()[\]{}]/u.test(before);

                const isBoundaryAfter =
                    !after || /[\s\-_/.,!?؟،:;()[\]{}]/u.test(after);

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
    }

    if (matches.length === 0) {
        return null;
    }

    /*
     * Exact match first.
     * Then longest alias.
     */
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

            if (!normalizedQuery.includes(normalizedAlias)) {
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

    /*
     * First use the aliases map.
     */
    const aliasMatch = findAliasInQuery(normalizedQuery, BRAND_ALIASES);

    if (aliasMatch) {
        return normalizeBrand(aliasMatch) || null;
    }

    /*
     * Fallback:
     *
     * Check every canonical brand.
     */
    for (const canonical of Object.keys(BRAND_ALIASES)) {
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
    /*
     * Try explicit category first.
     */
    const category = findAliasInQuery(query, CATEGORY_ALIASES);

    /*
     * Then try type.
     */
    const type = findAliasInQuery(query, TYPE_ALIASES);

    /*
     * If category exists,
     * validate the detected type later
     * inside normalizeSearchFilters().
     */
    if (category) {
        return {
            category,
            type,
        };
    }

    /*
     * If there is no category but
     * we found a type, infer category.
     *
     * Example:
     *
     * "لوحه زيتيه"
     *
     * type = paintings
     * category = Art
     */
    if (type) {
        const inferredCategory = findCategoryByType(type);

        return {
            category: inferredCategory,
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

    /*
     * Examples:
     *
     * 128GB
     * 256GB
     * 512 GB
     * 1TB
     * 2 TB
     */
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

    /*
     * 1000 - 5000
     * 1000 to 5000
     * 1000 עד 5000
     */
    const rangeMatch = normalizedQuery.match(
        /(\d[\d,]*)\s*(?:-|to|حتى|الى|إلى|עד)\s*(\d[\d,]*)/,
    );

    if (rangeMatch) {
        minPrice = Number(rangeMatch[1].replace(/,/g, ''));

        maxPrice = Number(rangeMatch[2].replace(/,/g, ''));

        return {
            minPrice,
            maxPrice,
        };
    }

    /*
     * max / up to / under
     */
    const maxMatch = normalizedQuery.match(
        /(?:under|below|up to|maximum|max|أقل من|اقل من|حد أقصى|حتى|עד)\s*(\d[\d,]*)/,
    );

    if (maxMatch) {
        maxPrice = Number(maxMatch[1].replace(/,/g, ''));
    }

    /*
     * min / above / from
     */
    const minMatch = normalizedQuery.match(
        /(?:over|above|minimum|min|أكثر من|اكثر من|من|ابتداء من|מעל|לפחות)\s*(\d[\d,]*)/,
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

function findModelInQuery(query, brand = null) {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
        return null;
    }

    // --------------------------------------------------------
    // If brand is known, search only inside that brand
    // --------------------------------------------------------

    if (brand) {
        const brandKey = Object.keys(MODEL_ALIASES || {}).find(
            (key) => normalizeText(key) === normalizeText(brand),
        );

        if (brandKey) {
            return findAliasInQuery(normalizedQuery, MODEL_ALIASES[brandKey]);
        }
    }

    // --------------------------------------------------------
    // If brand is unknown, search across all brands
    // --------------------------------------------------------

    const matches = [];

    for (const [brandName, models] of Object.entries(MODEL_ALIASES || {})) {
        if (!models || typeof models !== 'object' || Array.isArray(models)) {
            continue;
        }

        const model = findAliasInQuery(normalizedQuery, models);

        if (!model) {
            continue;
        }

        matches.push({
            brand: brandName,
            model,
            length: normalizeText(model).length,
        });
    }

    if (!matches.length) {
        return null;
    }

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

    const normalizedModel = normalizeText(model);

    for (const [brand, models] of Object.entries(MODEL_ALIASES || {})) {
        if (!models || typeof models !== 'object') {
            continue;
        }

        for (const [canonicalModel] of Object.entries(models)) {
            if (normalizeText(canonicalModel) === normalizedModel) {
                return brand;
            }
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
        return {
            query: null,
            brand: null,
            model: null,
            category: null,
            type: null,
            subcategory: null,
            storage: null,
            condition: null,
            fuel: null,
            maxPrice: null,
            minPrice: null,
            currency: null,
            location: null,
            nearMe: null,
        };
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
    // Result
    // --------------------------------------------------------
    console.log('🧪 Model Result:', model);

    console.log('🧠 Parsed Search:', {
        query: cleanQuery,
        brand,
        model,
        category,
        type,
        condition,
        fuel,
        storage,
        minPrice,
        maxPrice,
        currency,
        nearMe,
    });
    return {
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
}

// ============================================================
// Model
// ============================================================

function findModelInQuery(query, brand = null) {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
        return null;
    }

    /*
     * If brand is known, search only inside
     * that brand's models.
     */
    if (brand && MODEL_ALIASES[brand]) {
        return findAliasInQuery(normalizedQuery, MODEL_ALIASES[brand]);
    }

    /*
     * If brand was not detected,
     * search across all brands.
     */
    const matches = [];

    for (const [brandName, models] of Object.entries(MODEL_ALIASES || {})) {
        if (!models || typeof models !== 'object') {
            continue;
        }

        const model = findAliasInQuery(normalizedQuery, models);

        if (model) {
            const aliases = models[model];

            let longestAlias = normalizeText(model).length;

            if (Array.isArray(aliases)) {
                for (const alias of aliases) {
                    const normalizedAlias = normalizeText(alias);

                    if (
                        normalizedAlias &&
                        normalizedQuery.includes(normalizedAlias)
                    ) {
                        longestAlias = Math.max(
                            longestAlias,
                            normalizedAlias.length,
                        );
                    }
                }
            }

            matches.push({
                brand: brandName,
                model,
                length: longestAlias,
            });
        }
    }

    if (!matches.length) {
        return null;
    }

    matches.sort((a, b) => b.length - a.length);

    return matches[0].model;
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
