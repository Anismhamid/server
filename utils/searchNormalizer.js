const { CATEGORY_ALIASES } = require('./categoryAliases');
const { BRAND_ALIASES, normalizeBrand } = require('./brandAliases');
const { FUEL_ALIASES } = require('./fuelAliases');
const { TYPE_ALIASES } = require('./typeAliases');

// ========================================
// Helpers
// ========================================

function cleanValue(value) {
    if (value === null || value === undefined) {
        return null;
    }

    const cleaned = String(value).trim();

    return cleaned || null;
}

function normalizeText(value) {
    const text = cleanValue(value);

    if (!text) {
        return null;
    }

    return text
        .toLowerCase()
        .normalize('NFKC')
        .replace(/\s+/g, ' ')
        .trim();
}

function findCanonicalValue(value, aliasesMap) {
    const normalizedValue = normalizeText(value);

    if (!normalizedValue) {
        return null;
    }

    for (const [canonical, aliases] of Object.entries(aliasesMap)) {
        const normalizedAliases = aliases.map(
            (alias) => normalizeText(alias),
        );

        if (normalizedAliases.includes(normalizedValue)) {
            return canonical;
        }
    }

    return null;
}

// ========================================
// Category
// ========================================

function normalizeCategory(value) {
    const canonical = findCanonicalValue(
        value,
        CATEGORY_ALIASES,
    );

    return canonical || cleanValue(value);
}

// ========================================
// Brand
// ========================================

function getBrandCanonical(value) {
    return normalizeBrand(value);
}

// ========================================
// Fuel
// ========================================

function normalizeFuel(value) {
    const canonical = findCanonicalValue(
        value,
        FUEL_ALIASES,
    );

    return canonical || null;
}

// ========================================
// Type
// ========================================

function normalizeType(value, category) {
    if (!value) {
        return null;
    }

    const normalizedValue = normalizeText(value);

    if (!normalizedValue) {
        return null;
    }

    /*
     * إذا لم توجد category، لا نحاول تخمين type
     * لأن بعض الـtypes مشتركة بين أكثر من category.
     */
    if (!category) {
        return cleanValue(value);
    }

    /*
     * الحالات التي فيها نفس الـtype موجود بأكثر
     * من category.
     *
     * نحن نبحث أولًا عن alias مطابق،
     * وبعدها نتحقق أن الـtype منطقي للفئة.
     */

    const possibleTypes = [];

    for (const [canonical, aliases] of Object.entries(
        TYPE_ALIASES,
    )) {
        const normalizedAliases = aliases.map(
            (alias) => normalizeText(alias),
        );

        if (normalizedAliases.includes(normalizedValue)) {
            possibleTypes.push(canonical);
        }
    }

    if (possibleTypes.length === 0) {
        return cleanValue(value);
    }

    /*
     * قائمة الـtypes الصحيحة لكل category.
     */

    const categoryTypes = {
        House: [
            'kitchen',
            'storage',
            'decor',
            'maintenance',
        ],

        Garden: [
            'plants',
            'watering',
            'tools',
            'outdoorDecor',
        ],

        Cars: [
            'private',
            'electric',
            'parts',
        ],

        Bikes: [
            'kids',
            'mountain',
            'road',
        ],

        Trucks: [
            'light',
            'heavy',
        ],

        ElectricVehicles: [
            'cars',
            'scooters',
        ],

        MenClothes: [
            'casual',
            'formal',
            'shoes',
        ],

        WomenClothes: [
            'casual',
            'dresses',
            'shoes',
        ],

        WomenBags: [
            'handbags',
            'toteBags',
            'backpacks',
            'clutches',
        ],

        Baby: [
            'clothes',
            'care',
            'feeding',
        ],

        Kids: [
            'educational',
            'toys',
            'outdoor',
        ],

        Health: [
            'personalCare',
            'medical',
            'fitness',
        ],

        Beauty: [
            'makeup',
            'skincare',
            'hair',
        ],

        Watches: [
            'classic',
            'smart',
            'hand',
        ],

        Cleaning: [
            'detergents',
            'tools',
            'disinfection',
        ],

        Motorcycles: [
            'street',
            'sport',
            'cruiser',
            'offRoad',
            'scooter',
            'parts',
        ],

        Electronics: [
            'smartphones',
            'laptops',
            'tablets',
            'accessories',
            'audio',
        ],

        Art: [
            'paintings',
            'sculptures',
            'photography',
            'crafts',
            'collectibles',
        ],

        Gaming: [
            'consoles',
            'games',
            'accessories',
            'pc_gaming',
        ],

        RealEstate: [
            'apartment',
            'house',
            'villa',
            'commercial',
            'land',
        ],

        Pets: [
            'dogs',
            'cats',
            'birds',
            'fish',
            'small_animals',
            'supplies',
        ],

        Furniture: [
            'living_room',
            'bedroom',
            'dining',
            'office',
            'outdoor',
            'kitchen',
        ],
    };

    const allowedTypes = categoryTypes[category];

    if (!allowedTypes) {
        return null;
    }

    const matchedType = possibleTypes.find(
        (type) => allowedTypes.includes(type),
    );

    return matchedType || null;
}

// ========================================
// Condition
// ========================================

const CONDITION_ALIASES = {
    new: [
        'new',
        'brand new',
        'جديد',
        'جديدة',
        'جديد تمامًا',
        'חדש',
        'חדשה',
    ],

    like_new: [
        'like new',
        'like_new',
        'شبه جديد',
        'شبه جديدة',
        'كالجديد',
        'כמו חדש',
        'כמו חדשה',
    ],

    excellent: [
        'excellent',
        'ممتاز',
        'ممتازة',
        'ممتاز جدًا',
        'מצוין',
        'מצוינת',
    ],

    good: [
        'good',
        'جيد',
        'جيدة',
        'حالة جيدة',
        'טוב',
        'טובה',
    ],

    fair: [
        'fair',
        'مقبول',
        'مقبولة',
        'حالة مقبولة',
        'סביר',
        'סבירה',
    ],

    used: [
        'used',
        'مستعمل',
        'مستعملة',
        'مستخدم',
        'مستخدمة',
        'يد ثانية',
        'יד שנייה',
        'יד שניה',
    ],
};

function normalizeCondition(value) {
    const canonical = findCanonicalValue(
        value,
        CONDITION_ALIASES,
    );

    return canonical || null;
}

// ========================================
// Number
// ========================================

function normalizeNumber(value) {
    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {
        return null;
    }

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : null;
}

// ========================================
// Main
// ========================================

function normalizeSearchFilters(filters) {
    if (!filters || typeof filters !== 'object') {
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

    const category = normalizeCategory(
        filters.category,
    );

    return {
        query: cleanValue(filters.query),

        brand: getBrandCanonical(
            filters.brand,
        ),

        model: cleanValue(filters.model),

        category,

        type: normalizeType(
            filters.type,
            category,
        ),

        subcategory: cleanValue(
            filters.subcategory,
        ),

        storage: cleanValue(
            filters.storage,
        ),

        condition: normalizeCondition(
            filters.condition,
        ),

        fuel: normalizeFuel(
            filters.fuel,
        ),

        maxPrice: normalizeNumber(
            filters.maxPrice,
        ),

        minPrice: normalizeNumber(
            filters.minPrice,
        ),

        currency:
            filters.currency === 'ILS'
                ? 'ILS'
                : null,

        location: cleanValue(
            filters.location,
        ),

        nearMe:
            typeof filters.nearMe === 'boolean'
                ? filters.nearMe
                : null,
    };
}

module.exports = {
    normalizeSearchFilters,
    normalizeCategory,
    normalizeCondition,
    normalizeFuel,
    normalizeType,
    getBrandCanonical,
};