// ============================================================
// Search Parser
// ============================================================

const { CATEGORY_ALIASES } = require('../utils/categoryAliases');
const { CONDITION_ALIASES } = require('../utils/conditionAliases');
const {
    normalizeBrand,
    BRAND_ALIASES,
} = require('../utils/brandAliases');
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

// Escape regex characters safely
function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================================
// Alias Boundary
// ============================================================

function isAliasBoundary(text, start, end) {
    const before = start === 0 ? '' : text[start - 1];

    const after =
        end >= text.length
            ? ''
            : text[end];

    const boundaryRegex =
        /[\s\-_/.,!?؟،:;()[\]{}]/u;

    const isBoundaryBefore =
        !before || boundaryRegex.test(before);

    const isBoundaryAfter =
        !after || boundaryRegex.test(after);

    return isBoundaryBefore && isBoundaryAfter;
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

        const allAliases = [
            canonical,
            ...aliases,
        ];

        for (const alias of allAliases) {
            const normalizedAlias = normalizeText(alias);

            if (!normalizedAlias) {
                continue;
            }

            // Exact query
            if (normalizedQuery === normalizedAlias) {
                matches.push({
                    canonical,
                    alias: normalizedAlias,
                    length: normalizedAlias.length,
                    exact: true,
                });

                continue;
            }

            let startIndex = 0;

            while (true) {
                const index = normalizedQuery.indexOf(
                    normalizedAlias,
                    startIndex,
                );

                if (index === -1) {
                    break;
                }

                const endIndex =
                    index + normalizedAlias.length;

                if (
                    isAliasBoundary(
                        normalizedQuery,
                        index,
                        endIndex,
                    )
                ) {
                    matches.push({
                        canonical,
                        alias: normalizedAlias,
                        length: normalizedAlias.length,
                        exact: false,
                    });

                    break;
                }

                startIndex = index + 1;
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

        const allAliases = [
            canonical,
            ...aliases,
        ];

        let bestMatch = null;

        for (const alias of allAliases) {
            const normalizedAlias = normalizeText(alias);

            if (!normalizedAlias) {
                continue;
            }

            let startIndex = 0;

            while (true) {
                const index = normalizedQuery.indexOf(
                    normalizedAlias,
                    startIndex,
                );

                if (index === -1) {
                    break;
                }

                const endIndex =
                    index + normalizedAlias.length;

                if (
                    isAliasBoundary(
                        normalizedQuery,
                        index,
                        endIndex,
                    )
                ) {
                    if (
                        !bestMatch ||
                        normalizedAlias.length >
                            bestMatch.length
                    ) {
                        bestMatch = normalizedAlias;
                    }

                    break;
                }

                startIndex = index + 1;
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

    matches.sort(
        (a, b) => b.length - a.length,
    );

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

    const aliasMatch = findAliasInQuery(
        normalizedQuery,
        BRAND_ALIASES,
    );

    if (aliasMatch) {
        return normalizeBrand(aliasMatch) || null;
    }

    return null;
}

// ============================================================
// Get Brand Entry
// ============================================================

function getBrandModelMap(brand) {
    if (!brand || !MODEL_ALIASES) {
        return null;
    }

    const normalizedBrand = normalizeText(brand);

    const entry = Object.entries(
        MODEL_ALIASES,
    ).find(([brandName]) => {
        return (
            normalizeText(brandName) ===
            normalizedBrand
        );
    });

    return entry ? entry[1] : null;
}

// ============================================================
// Get Model Aliases
// ============================================================

function getBrandModelAliases(brand, model) {
    if (!brand || !model) {
        return [];
    }

    const models = getBrandModelMap(brand);

    if (!models) {
        return [];
    }

    const normalizedModel = normalizeText(model);

    const entry = Object.entries(models).find(
        ([modelName]) => {
            return (
                normalizeText(modelName) ===
                normalizedModel
            );
        },
    );

    if (!entry) {
        return [];
    }

    return Array.isArray(entry[1])
        ? entry[1]
        : [];
}

// ============================================================
// Category + Type
// ============================================================

function findCategoryAndType(query) {
    const category = findAliasInQuery(
        query,
        CATEGORY_ALIASES,
    );

    const type = findAliasInQuery(
        query,
        TYPE_ALIASES,
    );

    if (category) {
        return {
            category,
            type,
        };
    }

    if (type) {
        const inferredCategory =
            findCategoryByType(type);

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
    return findAliasInQuery(
        query,
        FUEL_ALIASES,
    );
}

// ============================================================
// Condition
// ============================================================

function findConditionInQuery(query) {
    return findAliasInQuery(
        query,
        CONDITION_ALIASES,
    );
}

// ============================================================
// Storage
// ============================================================

function findStorageInQuery(query) {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
        return null;
    }

    const match = normalizedQuery.match(
        /(?:^|[\s\-_/.,])(\d+(?:\.\d+)?)\s*(gb|tb)(?=$|[\s\-_/.,])/i,
    );

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
    // --------------------------------------------------------

    const rangeMatch = normalizedQuery.match(
        /(\d[\d,]*)\s*(?:-|to|حتى|الى|إلى|עד)\s*(\d[\d,]*)/i,
    );

    if (rangeMatch) {
        minPrice = Number(
            rangeMatch[1].replace(/,/g, ''),
        );

        maxPrice = Number(
            rangeMatch[2].replace(/,/g, ''),
        );

        return {
            minPrice: Number.isFinite(minPrice)
                ? minPrice
                : null,

            maxPrice: Number.isFinite(maxPrice)
                ? maxPrice
                : null,
        };
    }

    // --------------------------------------------------------
    // Maximum
    // --------------------------------------------------------

    const maxMatch = normalizedQuery.match(
        /(?:under|below|up to|maximum|max|أقل من|اقل من|حد أقصى|حتى|עד)\s*(\d[\d,]*)/i,
    );

    if (maxMatch) {
        maxPrice = Number(
            maxMatch[1].replace(/,/g, ''),
        );
    }

    // --------------------------------------------------------
    // Minimum
    // --------------------------------------------------------

    const minMatch = normalizedQuery.match(
        /(?:over|above|minimum|min|أكثر من|اكثر من|ابتداء من|مעל|לפחות)\s*(\d[\d,]*)/i,
    );

    if (minMatch) {
        minPrice = Number(
            minMatch[1].replace(/,/g, ''),
        );
    }

    return {
        minPrice: Number.isFinite(minPrice)
            ? minPrice
            : null,

        maxPrice: Number.isFinite(maxPrice)
            ? maxPrice
            : null,
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
        const normalizedCurrency =
            normalizeText(currency);

        if (
            normalizedCurrency &&
            normalizedQuery.includes(
                normalizedCurrency,
            )
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

    const found = aliases.some((alias) => {
        return normalizedQuery.includes(
            normalizeText(alias),
        );
    });

    return found ? true : null;
}

// ============================================================
// Model
// ============================================================

function findModelInQuery(query, brand = null) {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
        return null;
    }

    const matches = [];

    // ========================================================
    // Search within known brand
    // ========================================================

    if (brand) {
        const models = getBrandModelMap(brand);

        if (models) {
            for (const [
                canonicalModel,
                aliases,
            ] of Object.entries(models)) {
                const allAliases = [
                    canonicalModel,
                    ...(Array.isArray(aliases)
                        ? aliases
                        : []),
                ];

                for (const alias of allAliases) {
                    const normalizedAlias =
                        normalizeText(alias);

                    if (!normalizedAlias) {
                        continue;
                    }

                    const index =
                        normalizedQuery.indexOf(
                            normalizedAlias,
                        );

                    if (index === -1) {
                        continue;
                    }

                    const endIndex =
                        index +
                        normalizedAlias.length;

                    if (
                        !isAliasBoundary(
                            normalizedQuery,
                            index,
                            endIndex,
                        )
                    ) {
                        continue;
                    }

                    matches.push({
                        brand,
                        model: canonicalModel,
                        alias: normalizedAlias,
                        length:
                            normalizedAlias.length,
                    });

                    break;
                }
            }
        }
    }

    // ========================================================
    // Search all brands if brand unknown
    // ========================================================

    if (!matches.length && !brand) {
        for (const [
            brandName,
            models,
        ] of Object.entries(MODEL_ALIASES || {})) {
            for (const [
                canonicalModel,
                aliases,
            ] of Object.entries(models || {})) {
                const allAliases = [
                    canonicalModel,
                    ...(Array.isArray(aliases)
                        ? aliases
                        : []),
                ];

                for (const alias of allAliases) {
                    const normalizedAlias =
                        normalizeText(alias);

                    if (!normalizedAlias) {
                        continue;
                    }

                    const index =
                        normalizedQuery.indexOf(
                            normalizedAlias,
                        );

                    if (index === -1) {
                        continue;
                    }

                    const endIndex =
                        index +
                        normalizedAlias.length;

                    if (
                        !isAliasBoundary(
                            normalizedQuery,
                            index,
                            endIndex,
                        )
                    ) {
                        continue;
                    }

                    matches.push({
                        brand: brandName,
                        model: canonicalModel,
                        alias: normalizedAlias,
                        length:
                            normalizedAlias.length,
                    });

                    break;
                }
            }
        }
    }

    if (!matches.length) {
        return null;
    }

    // Longest model wins
    matches.sort((a, b) => {
        return b.length - a.length;
    });

    return matches[0].model;
}

// ============================================================
// Find Brand By Model
// ============================================================

function findBrandByModel(model) {
    if (!model) {
        return null;
    }

    const normalizedModel =
        normalizeText(model);

    for (const [
        brand,
        models,
    ] of Object.entries(MODEL_ALIASES || {})) {
        for (const modelName of Object.keys(
            models || {},
        )) {
            if (
                normalizeText(modelName) ===
                normalizedModel
            ) {
                return brand;
            }
        }
    }

    return null;
}

// ============================================================
// Build Model Query
// ============================================================

function buildModelQuery(model, brand) {
    if (!model) {
        return null;
    }

    const aliases =
        getBrandModelAliases(
            brand,
            model,
        );

    const values = [
        model,
        ...aliases,
    ];

    const uniqueValues = [
        ...new Set(
            values
                .filter(Boolean)
                .map((value) =>
                    String(value).trim(),
                )
                .filter(Boolean),
        ),
    ];

    if (!uniqueValues.length) {
        return null;
    }

    return {
        $in: uniqueValues.map(
            (value) =>
                new RegExp(
                    `^${escapeRegex(value)}$`,
                    'i',
                ),
        ),
    };
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

    const {
        category,
        type,
    } = findCategoryAndType(cleanQuery);

    // --------------------------------------------------------
    // Brand
    // --------------------------------------------------------

    let brand =
        findBrandInQuery(cleanQuery);

    // --------------------------------------------------------
    // Model
    // --------------------------------------------------------

    let model =
        findModelInQuery(
            cleanQuery,
            brand,
        );

    // --------------------------------------------------------
    // Infer brand from model
    // --------------------------------------------------------

    if (!brand && model) {
        brand =
            findBrandByModel(model);
    }

    // --------------------------------------------------------
    // If brand was inferred, search model again
    // --------------------------------------------------------

    if (brand && !model) {
        model =
            findModelInQuery(
                cleanQuery,
                brand,
            );
    }

    // --------------------------------------------------------
    // Condition
    // --------------------------------------------------------

    const condition =
        findConditionInQuery(
            cleanQuery,
        );

    // --------------------------------------------------------
    // Fuel
    // --------------------------------------------------------

    const fuel =
        findFuelInQuery(cleanQuery);

    // --------------------------------------------------------
    // Storage
    // --------------------------------------------------------

    const storage =
        findStorageInQuery(
            cleanQuery,
        );

    // --------------------------------------------------------
    // Price
    // --------------------------------------------------------

    const {
        minPrice,
        maxPrice,
    } = findPriceInQuery(
        cleanQuery,
    );

    // --------------------------------------------------------
    // Currency
    // --------------------------------------------------------

    const currency =
        findCurrencyInQuery(
            cleanQuery,
        );

    // --------------------------------------------------------
    // Near Me
    // --------------------------------------------------------

    const nearMe =
        findNearMeInQuery(
            cleanQuery,
        );

    // --------------------------------------------------------
    // Raw Filters
    // --------------------------------------------------------

    const rawFilters = {
        query: cleanQuery,

        brand: brand || null,

        model: model || null,

        category:
            category || null,

        type:
            type || null,

        subcategory: null,

        storage:
            storage || null,

        condition:
            condition || null,

        fuel:
            fuel || null,

        maxPrice:
            maxPrice ?? null,

        minPrice:
            minPrice ?? null,

        currency:
            currency || null,

        location: null,

        nearMe:
            nearMe || null,
    };

    // --------------------------------------------------------
    // Final normalization
    // --------------------------------------------------------

    const filters =
        normalizeSearchFilters(
            rawFilters,
        );

    console.log(
        '🧠 Parsed Search:',
        filters,
    );

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

    findBrandByModel,

    getBrandModelAliases,

    buildModelQuery,

    escapeRegex,
};