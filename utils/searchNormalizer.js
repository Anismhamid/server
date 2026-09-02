const { CATEGORY_ALIASES } = require('./categoryAliases');
const { CONDITION_ALIASES } = require('./conditionAliases');
const { normalizeBrand } = require('./brandAliases');
const { FUEL_ALIASES } = require('./fuelAliases');
const { TYPE_ALIASES } = require('./typeAliases');

// ============================================================
// Configuration
// ============================================================

/**
 * Defines which types are valid inside each category.
 *
 * IMPORTANT:
 * Keep canonical values only.
 * Aliases belong to their own files.
 */
const CATEGORY_TYPES = {
    House: ['kitchen', 'storage', 'decor', 'maintenance'],

    Garden: ['plants', 'watering', 'tools', 'outdoorDecor'],

    Cars: ['private', 'electric', 'parts'],

    Bikes: ['kids', 'mountain', 'road'],

    Trucks: ['light', 'heavy'],

    ElectricVehicles: ['cars', 'scooters'],

    MenClothes: ['casual', 'formal', 'shoes'],

    WomenClothes: ['casual', 'dresses', 'shoes'],

    WomenBags: ['handbags', 'toteBags', 'backpacks', 'clutches'],

    Baby: ['clothes', 'care', 'feeding'],

    Kids: ['educational', 'toys', 'outdoor'],

    Health: ['personalCare', 'medical', 'fitness'],

    Beauty: ['makeup', 'skincare', 'hair'],

    Watches: ['classic', 'smart', 'hand'],

    Cleaning: ['detergents', 'tools', 'disinfection'],

    Motorcycles: ['street', 'sport', 'cruiser', 'offRoad', 'scooter', 'parts'],

    Electronics: ['smartphones', 'laptops', 'tablets', 'accessories', 'audio'],

    Art: ['paintings', 'sculptures', 'photography', 'crafts', 'collectibles'],

    Gaming: ['consoles', 'games', 'accessories', 'pc_gaming'],

    RealEstate: ['apartment', 'house', 'villa', 'commercial', 'land'],

    Pets: ['dogs', 'cats', 'birds', 'fish', 'small_animals', 'supplies'],

    Furniture: [
        'living_room',
        'bedroom',
        'dining',
        'office',
        'outdoor',
        'kitchen',
    ],
};

// ============================================================
// Constants
// ============================================================

const EMPTY_FILTERS = {
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

const ILS_ALIASES = new Set([
    'ils',
    'ILS',
    'nis',
    '₪',
    'shekel',
    'shekels',

    'شيكل',
    'شيكل اسرائيلي',
    'شيكل إسرائيلي',

    'שקל',
    'שקלים',
]);

// ============================================================
// Basic Helpers
// ============================================================

function cleanValue(value) {
    if (value === null || value === undefined) {
        return null;
    }

    const cleaned = String(value).trim();

    return cleaned || null;
}

/**
 * Normalize text ONLY for comparison.
 *
 * The original value is never modified.
 *
 * Examples:
 *
 * لوحة زيتية
 * لوحه زيتيه
 *
 * become:
 *
 * لوحه زيتيه
 */
function normalizeText(value) {
    const text = cleanValue(value);

    if (!text) {
        return null;
    }

    return (
        text
            .toLowerCase()
            .normalize('NFKC')

            // Arabic letters
            .replace(/[إأآٱ]/g, 'ا')
            .replace(/ى/g, 'ي')
            .replace(/ة/g, 'ه')
            .replace(/ؤ/g, 'و')
            .replace(/ئ/g, 'ي')

            // Arabic tatweel
            .replace(/ـ/g, '')

            // Multiple spaces
            .replace(/\s+/g, ' ')

            .trim()
    );
}

// ============================================================
// Alias Lookup
// ============================================================

/**
 * Converts an aliases object into a Map.
 *
 * Example:
 *
 * {
 *     paintings: [
 *         'painting',
 *         'لوحة زيتية'
 *     ]
 * }
 *
 * becomes:
 *
 * Map {
 *     'painting' => 'paintings',
 *     'لوحه زيتيه' => 'paintings'
 * }
 *
 * This is created ONCE when the server starts.
 */
function createAliasLookup(aliasesMap) {
    const lookup = new Map();

    if (!aliasesMap || typeof aliasesMap !== 'object') {
        return lookup;
    }

    for (const [canonical, aliases] of Object.entries(aliasesMap)) {
        if (!Array.isArray(aliases)) {
            continue;
        }

        // Canonical value itself
        const normalizedCanonical = normalizeText(canonical);

        if (normalizedCanonical) {
            lookup.set(normalizedCanonical, canonical);
        }

        // Aliases
        for (const alias of aliases) {
            const normalizedAlias = normalizeText(alias);

            if (!normalizedAlias) {
                continue;
            }

            lookup.set(normalizedAlias, canonical);
        }
    }

    return lookup;
}

// ============================================================
// Pre-built Lookups
// ============================================================

const CATEGORY_LOOKUP = createAliasLookup(CATEGORY_ALIASES);

const CONDITION_LOOKUP = createAliasLookup(CONDITION_ALIASES);

const FUEL_LOOKUP = createAliasLookup(FUEL_ALIASES);

const TYPE_LOOKUP = createAliasLookup(TYPE_ALIASES);

// ============================================================
// Canonical Lookup
// ============================================================

function findCanonicalValue(value, lookup) {
    const normalizedValue = normalizeText(value);

    if (!normalizedValue) {
        return null;
    }

    return lookup.get(normalizedValue) || null;
}

// ============================================================
// Category
// ============================================================

function normalizeCategory(value) {
    return findCanonicalValue(value, CATEGORY_LOOKUP);
}

// ============================================================
// Brand
// ============================================================

function getBrandCanonical(value) {
    const cleaned = cleanValue(value);

    if (!cleaned) {
        return null;
    }

    return normalizeBrand(cleaned) || null;
}

// ============================================================
// Fuel
// ============================================================

function normalizeFuel(value) {
    return findCanonicalValue(value, FUEL_LOOKUP);
}

// ============================================================
// Type
// ============================================================

function normalizeType(value, category) {
    if (!value || !category) {
        return null;
    }

    const canonicalType = findCanonicalValue(value, TYPE_LOOKUP);

    if (!canonicalType) {
        return null;
    }

    const allowedTypes = CATEGORY_TYPES[category];

    if (!allowedTypes) {
        return null;
    }

    return allowedTypes.includes(canonicalType) ? canonicalType : null;
}

// ============================================================
// Find Category By Type
// ============================================================

/**
 * Used when the parser detects a type
 * but the category was not explicitly detected.
 *
 * Example:
 *
 * "لوحه زيتيه"
 *
 * → paintings
 * → Art
 */
function findCategoryByType(type) {
    if (!type) {
        return null;
    }

    for (const [category, types] of Object.entries(CATEGORY_TYPES)) {
        if (types.includes(type)) {
            return category;
        }
    }

    return null;
}

// ============================================================
// Condition
// ============================================================

function normalizeCondition(value) {
    return findCanonicalValue(value, CONDITION_LOOKUP);
}

// ============================================================
// Number
// ============================================================

function normalizeNumber(value) {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    /*
     * Accept strings such as:
     *
     * "1000"
     * "1,000"
     * "1000.50"
     */
    const cleaned = String(value).replace(/,/g, '').trim();

    const number = Number(cleaned);

    return Number.isFinite(number) ? number : null;
}

// ============================================================
// Currency
// ============================================================

function normalizeCurrency(value) {
    const normalized = normalizeText(value);

    if (!normalized) {
        return null;
    }

    return ILS_ALIASES.has(normalized) ? 'ILS' : null;
}

// ============================================================
// Boolean
// ============================================================

function normalizeBoolean(value) {
    return typeof value === 'boolean' ? value : null;
}

// ============================================================
// Storage
// ============================================================

function normalizeStorage(value) {
    const cleaned = cleanValue(value);

    if (!cleaned) {
        return null;
    }

    /*
     * Keep storage flexible.
     *
     * Examples:
     *
     * 256GB
     * 256 GB
     * 1TB
     * 128
     */
    return cleaned.replace(/\s+/g, '').toUpperCase();
}

// ============================================================
// Empty Filters
// ============================================================

function createEmptyFilters() {
    return {
        ...EMPTY_FILTERS,
    };
}

// ============================================================
// Normalize Filters
// ============================================================

function normalizeSearchFilters(filters) {
    if (!filters || typeof filters !== 'object' || Array.isArray(filters)) {
        return createEmptyFilters();
    }

    // --------------------------------------------------------
    // Category
    // --------------------------------------------------------

    let category = normalizeCategory(filters.category);

    // --------------------------------------------------------
    // Type
    // --------------------------------------------------------

    let type = normalizeType(filters.type, category);

    /*
     * If parser gave us a valid type but no category,
     * infer category from the type.
     *
     * Example:
     *
     * type = paintings
     * category = null
     *
     * becomes:
     *
     * category = Art
     */
    if (!category && filters.type) {
        const rawType = findCanonicalValue(filters.type, TYPE_LOOKUP);

        const inferredCategory = findCategoryByType(rawType);

        if (inferredCategory) {
            category = inferredCategory;

            type = normalizeType(rawType, category);
        }
    }

    // --------------------------------------------------------
    // Build Result
    // --------------------------------------------------------

    const result = {
        /*
         * Keep original query.
         *
         * normalizeText() is only used
         * internally for matching.
         */
        query: cleanValue(filters.query),

        brand: getBrandCanonical(filters.brand),

        model: cleanValue(filters.model),

        category,

        type,

        subcategory: cleanValue(filters.subcategory),

        storage: normalizeStorage(filters.storage),

        condition: normalizeCondition(filters.condition),

        fuel: normalizeFuel(filters.fuel),

        maxPrice: normalizeNumber(filters.maxPrice),

        minPrice: normalizeNumber(filters.minPrice),

        currency: normalizeCurrency(filters.currency),

        location: cleanValue(filters.location),

        nearMe: normalizeBoolean(filters.nearMe),
    };

    // ========================================================
    // Price Range Validation
    // ========================================================

    if (
        result.minPrice !== null &&
        result.maxPrice !== null &&
        result.minPrice > result.maxPrice
    ) {
        [result.minPrice, result.maxPrice] = [result.maxPrice, result.minPrice];
    }

    return result;
}

// ============================================================
// Exports
// ============================================================

module.exports = {
    normalizeSearchFilters,

    normalizeCategory,
    normalizeCondition,
    normalizeFuel,
    normalizeType,
    normalizeCurrency,
    normalizeStorage,

    findCategoryByType,

    getBrandCanonical,

    cleanValue,
    normalizeText,

    createEmptyFilters,
};
