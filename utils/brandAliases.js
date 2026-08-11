const BRAND_ALIASES = {
    apple: [
        'apple',
        'آبل',
        'ابل',
        'אפל',
    ],

    samsung: [
        'samsung',
        'سامسونج',
        'سامسنغ',
        'סמסונג',
    ],

    huawei: [
        'huawei',
        'هواوي',
        'וואווי',
    ],

    xiaomi: [
        'xiaomi',
        'شاومي',
        'شياومي',
        'שיאומי',
    ],

    toyota: [
        'toyota',
        'تويوتا',
        'טויוטה',
    ],

    hyundai: [
        'hyundai',
        'هيونداي',
        'هيونداي',
        'יונדאי',
    ],

    mercedes: [
        'mercedes',
        'mercedes-benz',
        'مرسيدس',
        'مرسيدس بنز',
        'מרצדס',
    ],

    bmw: [
        'bmw',
        'بي ام دبليو',
        'بي إم دبليو',
        'ב.מ.וו',
        'במוו',
    ],

    kia: [
        'kia',
        'كيا',
        'קאיה',
    ],

    ford: [
        'ford',
        'فورد',
        'פורד',
    ],
};



function normalizeBrand(value) {
    if (!value) {
        return null;
    }

    const input = String(value)
        .trim()
        .toLowerCase();

    for (const [canonical, aliases] of Object.entries(
        BRAND_ALIASES
    )) {
        if (
            aliases.some(
                (alias) =>
                    alias.toLowerCase() === input
            )
        ) {
            return canonical;
        }
    }

    return input;
}

function getBrandAliases(value) {
    const canonical = normalizeBrand(value);

    if (!canonical) {
        return [];
    }

    return BRAND_ALIASES[canonical] || [value];
}

module.exports = {
    BRAND_ALIASES,
    normalizeBrand,
    getBrandAliases,
};