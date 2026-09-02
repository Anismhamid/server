const BRAND_ALIASES = {
    Apple: [
        'apple',
        'آبل',
        'ابل',
        'אפל',
    ],

    Samsung: [
        'samsung',
        'سامسونج',
        'سامسنغ',
        'סמסונג',
    ],

    Huawei: [
        'huawei',
        'هواوي',
        'هواوى',
        'וואווי',
        'וואוויי',
    ],

    Xiaomi: [
        'xiaomi',
        'شاومي',
        'شياومي',
        'שיומי',
    ],

    Honor: [
        'honor',
        'هونر',
        'הונור',
    ],

    Google: [
        'google',
        'جوجل',
        'غوغل',
        'גוגל',
    ],

    OnePlus: [
        'oneplus',
        'one plus',
        'ون بلس',
        'וואן פלוס',
    ],

    Oppo: [
        'oppo',
        'اوبو',
        'أوبو',
        'אופו',
    ],

    Vivo: [
        'vivo',
        'فيفو',
        'ויוו',
    ],

    Realme: [
        'realme',
        'ريلمي',
        'רילמי',
    ],

    Motorola: [
        'motorola',
        'موتورولا',
        'מוטורולה',
    ],

    Nokia: [
        'nokia',
        'نوكيا',
        'נוקיה',
    ],

    Sony: [
        'sony',
        'سوني',
        'סוני',
    ],

    LG: [
        'lg',
        'ال جي',
        'إل جي',
        'אל ג׳י',
    ],

    Asus: [
        'asus',
        'اسوس',
        'أسوس',
        'אסוס',
    ],

    Lenovo: [
        'lenovo',
        'لينوفو',
        'לנובו',
    ],

    TCL: [
        'tcl',
        'تي سي ال',
        'تي سي إل',
        'טי סי אל',
    ],

    Tecno: [
        'tecno',
        'تكنو',
        'טכנו',
    ],

    Infinix: [
        'infinix',
        'انفنكس',
        'إنفينيكس',
        'אינפיניקס',
    ],

    Nothing: [
        'nothing',
        'ناثينج',
        'נאת׳ינג',
    ],

    ZTE: [
        'zte',
        'زد تي اي',
        'זד טי אי',
    ],

    Nubia: [
        'nubia',
        'نيوبيا',
        'נוביה',
    ],

    Meizu: [
        'meizu',
        'ميزو',
        'מייזו',
    ],

    HTC: [
        'htc',
        'اتش تي سي',
        'إتش تي سي',
        'אייץ׳ טי סי',
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