// services/searchParser.js

// ============================================================
// Safqa - Fast Multilingual Search Parser
// Arabic + Hebrew + English
// No AI / No Ollama / No external API
// ============================================================

// ============================================================
// BRAND ALIASES
// ============================================================

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

// ============================================================
// FUEL ALIASES
// ============================================================

const FUEL_ALIASES = {
    gasoline: [
        'gasoline',
        'petrol',
        'gas',
        'بنزين',
        'بنزينه',
        'בנזין',
    ],

    diesel: [
        'diesel',
        'ديزل',
        'דיזל',
    ],

    hybrid: [
        'hybrid',
        'هجين',
        'هايبرد',
        'היברידי',
        'היברידית',
    ],

    electric: [
        'electric',
        'كهرباء',
        'كهربائي',
        'كهربائية',
        'חשמלי',
        'חשמלית',
    ],
};

// ============================================================
// CATEGORY ALIASES
// ============================================================

const CATEGORY_ALIASES = {
    House: [
        'household',
        'home',
        'house',
        'منزل',
        'بيت',
        'ادوات منزلية',
        'أدوات منزلية',
        'المنزل',
        'בית',
        'מוצרי בית',
    ],

    Garden: [
        'garden',
        'gardening',
        'حديقة',
        'حدائق',
        'زراعة',
        'بستنة',
        'גינה',
        'גינון',
    ],

    Cars: [
        'car',
        'cars',
        'vehicle',
        'سيارة',
        'سياره',
        'سيارات',
        'רכב',
        'רכבים',
        'מכונית',
        'מכוניות',
    ],

    Bikes: [
        'bike',
        'bikes',
        'bicycle',
        'bicycles',
        'دراجة',
        'دراجه',
        'دراجات',
        'אופניים',
    ],

    Trucks: [
        'truck',
        'trucks',
        'شاحنة',
        'شاحنه',
        'شاحنات',
        'משאית',
        'משאיות',
    ],

    ElectricVehicles: [
        'electric vehicle',
        'electric vehicles',
        'ev',
        'مركبة كهربائية',
        'مركبات كهربائية',
        'קורקינט חשמלי',
        'רכב חשמלי',
    ],

    MenClothes: [
        'men clothes',
        'mens clothes',
        'mens clothing',
        'ملابس رجالية',
        'ملابس رجال',
        'בגדי גברים',
    ],

    WomenClothes: [
        'women clothes',
        'womens clothes',
        'womens clothing',
        'ملابس نسائية',
        'ملابس نساء',
        'בגדי נשים',
    ],

    WomenBags: [
        'women bags',
        'womens bags',
        'handbag',
        'handbags',
        'شنطة نسائية',
        'شنط نسائية',
        'حقائب نسائية',
        'תיקים לנשים',
    ],

    Baby: [
        'baby',
        'babies',
        'طفل',
        'أطفال رضّع',
        'اطفال رضع',
        'مستلزمات أطفال',
        'תינוק',
        'תינוקות',
    ],

    Kids: [
        'kids',
        'children',
        'toys',
        'أطفال',
        'العاب',
        'ألعاب',
        'لعب أطفال',
        'ילדים',
        'צעצועים',
    ],

    Health: [
        'health',
        'medical',
        'صحة',
        'صحي',
        'طبي',
        'مستلزمات طبية',
        'בריאות',
        'רפואי',
    ],

    Beauty: [
        'beauty',
        'makeup',
        'cosmetics',
        'تجميل',
        'مكياج',
        'مستحضرات تجميل',
        'יופי',
        'איפור',
    ],

    Watches: [
        'watch',
        'watches',
        'ساعة',
        'ساعات',
        'שעון',
        'שעונים',
    ],

    Cleaning: [
        'cleaning',
        'منظفات',
        'تنظيف',
        'مواد تنظيف',
        'ניקיון',
        'חומרי ניקוי',
    ],

    Motorcycles: [
        'motorcycle',
        'motorcycles',
        'motorbike',
        'motorbikes',
        'bike motorcycle',
        'دراجة نارية',
        'دراجه ناريه',
        'دراجات نارية',
        'אופנוע',
        'אופנועים',
    ],

    Electronics: [
        'electronics',
        'electronic',
        'phone',
        'phones',
        'smartphone',
        'smartphones',
        'iphone',
        'android',
        'laptop',
        'laptops',
        'computer',
        'computers',
        'tablet',
        'tablets',
        'هاتف',
        'هاتف ذكي',
        'هواتف',
        'موبايل',
        'موبايلات',
        'جوال',
        'لابتوب',
        'حاسوب',
        'كمبيوتر',
        'تابلت',
        'إلكترونيات',
        'الكترونيات',
        'טלפון',
        'טלפונים',
        'סמארטפון',
        'מחשב',
        'מחשבים',
        'טאבלט',
        'אלקטרוניקה',
    ],

    Art: [
        'art',
        'painting',
        'paintings',
        'sculpture',
        'photography',
        'لوحات',
        'لوحة',
        'فن',
        'منحوتات',
        'تصوير',
        'אומנות',
        'ציורים',
        'פסלים',
    ],

    Gaming: [
        'gaming',
        'game',
        'games',
        'playstation',
        'xbox',
        'nintendo',
        'ألعاب فيديو',
        'العاب فيديو',
        'بلايستيشن',
        'إكس بوكس',
        'نينتندو',
        'גיימינג',
        'פלייסטיישן',
        'אקסבוקס',
    ],

    RealEstate: [
        'real estate',
        'property',
        'apartment',
        'house',
        'villa',
        'land',
        'عقار',
        'عقارات',
        'شقة',
        'شقق',
        'بيت',
        'فيلا',
        'أرض',
        'أراضي',
        'נדלן',
        'נדל״ן',
        'דירה',
        'דירות',
        'וילה',
        'קרקע',
    ],

    Pets: [
        'pet',
        'pets',
        'dog',
        'dogs',
        'cat',
        'cats',
        'bird',
        'birds',
        'حيوان',
        'حيوانات',
        'كلب',
        'كلاب',
        'قطة',
        'قطط',
        'طيور',
        'חיות',
        'כלב',
        'כלבים',
        'חתול',
        'חתולים',
    ],

    Furniture: [
        'furniture',
        'sofa',
        'couch',
        'table',
        'chair',
        'bed',
        'أثاث',
        'كنبة',
        'كنب',
        'طاولة',
        'كرسي',
        'سرير',
        'ריהוט',
        'ספה',
        'שולחן',
        'כיסא',
        'מיטה',
    ],
};

// ============================================================
// TYPE ALIASES
// ============================================================

const TYPE_ALIASES = {
    Electronics: {
        smartphones: [
            'smartphone',
            'smartphones',
            'phone',
            'phones',
            'iphone',
            'هاتف',
            'هواتف',
            'موبايل',
            'موبايلات',
            'جوال',
            'جوالات',
            'טלפון',
            'טלפונים',
            'סמארטפון',
        ],

        laptops: [
            'laptop',
            'laptops',
            'notebook',
            'لابتوب',
            'لابتوبات',
            'حاسوب محمول',
            'מחשב נייד',
            'מחשבים ניידים',
        ],

        tablets: [
            'tablet',
            'tablets',
            'ipad',
            'تابلت',
            'تابلتات',
            'ايباد',
            'آيباد',
            'טאבלט',
            'אייפד',
        ],

        accessories: [
            'accessory',
            'accessories',
            'charger',
            'chargers',
            'سماعة',
            'شاحن',
            'شواحن',
            'إكسسوارات',
            'اكسسوارات',
            'אביזרים',
        ],

        audio: [
            'audio',
            'headphones',
            'earphones',
            'airpods',
            'سماعات',
            'سماعة رأس',
            'אוזניות',
        ],
    },

    Cars: {
        private: [
            'private',
            'private car',
            'سيارة خاصة',
            'سيارات خاصة',
            'רכב פרטי',
        ],

        electric: [
            'electric car',
            'سيارة كهربائية',
            'سياره كهربائيه',
            'רכב חשמלי',
        ],

        parts: [
            'car parts',
            'parts',
            'قطع سيارات',
            'قطع غيار',
            'قطع سيارة',
            'חלפים',
            'חלקי רכב',
        ],
    },

    Bikes: {
        kids: [
            'kids bike',
            'children bike',
            'دراجة أطفال',
            'دراجات أطفال',
            'אופניים לילדים',
        ],

        mountain: [
            'mountain bike',
            'دراجة جبلية',
            'دراجة جبال',
            'אופני הרים',
        ],

        road: [
            'road bike',
            'دراجة طريق',
            'אופני כביש',
        ],
    },

    Trucks: {
        light: [
            'light truck',
            'شاحنة خفيفة',
            'משאית קלה',
        ],

        heavy: [
            'heavy truck',
            'شاحنة ثقيلة',
            'משאית כבדה',
        ],
    },

    ElectricVehicles: {
        cars: [
            'electric car',
            'electric cars',
            'سيارة كهربائية',
            'سيارات كهربائية',
            'רכב חשמלי',
        ],

        scooters: [
            'electric scooter',
            'scooter',
            'سكوتر كهربائي',
            'سكوتر',
            'קורקינט',
            'קורקינט חשמלי',
        ],
    },

    MenClothes: {
        casual: [
            'casual',
            'كاجوال',
            'ملابس كاجوال',
            'קזואל',
        ],

        formal: [
            'formal',
            'رسمي',
            'ملابس رسمية',
            'חליפה',
            'רשמי',
        ],

        shoes: [
            'shoes',
            'shoe',
            'أحذية',
            'حذاء',
            'נעליים',
        ],
    },

    WomenClothes: {
        casual: [
            'casual',
            'كاجوال',
            'ملابس كاجوال',
            'קזואל',
        ],

        dresses: [
            'dress',
            'dresses',
            'فستان',
            'فساتين',
            'שמלות',
        ],

        shoes: [
            'shoes',
            'shoe',
            'أحذية',
            'حذاء',
            'נעליים',
        ],
    },

    WomenBags: {
        handbags: [
            'handbag',
            'handbags',
            'حقيبة يد',
            'حقائب يد',
            'תיק יד',
        ],

        toteBags: [
            'tote',
            'tote bag',
            'شنطة توت',
            'תיק tote',
        ],

        backpacks: [
            'backpack',
            'backpacks',
            'حقيبة ظهر',
            'حقائب ظهر',
            'תיק גב',
        ],

        clutches: [
            'clutch',
            'clutches',
            'كلتش',
            'حقائب كلتش',
            'קלאץ',
        ],
    },

    Baby: {
        clothes: [
            'baby clothes',
            'ملابس أطفال',
            'ملابس رضيع',
            'בגדי תינוקות',
        ],

        care: [
            'baby care',
            'رعاية أطفال',
            'مستلزمات أطفال',
            'טיפוח תינוקות',
        ],

        feeding: [
            'baby feeding',
            'رضاعة',
            'مستلزمات رضاعة',
            'האכלת תינוקות',
        ],
    },

    Kids: {
        educational: [
            'educational',
            'تعليمي',
            'ألعاب تعليمية',
            'משחקים חינוכיים',
        ],

        toys: [
            'toy',
            'toys',
            'لعبة',
            'ألعاب',
            'צעצוע',
            'צעצועים',
        ],

        outdoor: [
            'outdoor',
            'خارجي',
            'ألعاب خارجية',
            'חוץ',
        ],
    },

    Health: {
        personalCare: [
            'personal care',
            'عناية شخصية',
            'العناية الشخصية',
            'טיפוח אישי',
        ],

        medical: [
            'medical',
            'طبي',
            'مستلزمات طبية',
            'רפואי',
        ],

        fitness: [
            'fitness',
            'لياقة',
            'رياضة',
            'כושר',
        ],
    },

    Beauty: {
        makeup: [
            'makeup',
            'مكياج',
            'איפור',
        ],

        skincare: [
            'skincare',
            'skin care',
            'عناية بالبشرة',
            'טיפוח עור',
        ],

        hair: [
            'hair',
            'عناية بالشعر',
            'شعر',
            'טיפוח שיער',
        ],
    },

    Watches: {
        classic: [
            'classic watch',
            'ساعة كلاسيكية',
            'שעון קלאסי',
        ],

        smart: [
            'smart watch',
            'smartwatch',
            'ساعة ذكية',
            'שעון חכם',
        ],

        hand: [
            'hand watch',
            'ساعة يد',
            'שעاعات يد',
            'שעון יד',
        ],
    },

    Cleaning: {
        detergents: [
            'detergents',
            'منظفات',
            'مواد تنظيف',
            'חומרי ניקוי',
        ],

        tools: [
            'cleaning tools',
            'أدوات تنظيف',
            'כלי ניקוי',
        ],

        disinfection: [
            'disinfection',
            'تعقيم',
            'مطهرات',
            'חיטוי',
        ],
    },

    Motorcycles: {
        street: [
            'street motorcycle',
            'street bike',
            'دراجة نارية شارع',
            'دراجة شارع',
            'אופנוע כביש',
        ],

        sport: [
            'sport motorcycle',
            'sport bike',
            'دراجة نارية رياضية',
            'אופנוע ספורט',
        ],

        cruiser: [
            'cruiser',
            'كروزر',
            'دراجة كروزر',
            'קרוזר',
        ],

        offRoad: [
            'off road',
            'offroad',
            'دراجة طرق وعرة',
            'دراجة أوف رود',
            'אופנוע שטח',
        ],

        scooter: [
            'scooter',
            'سكوتر',
            'קטנוע',
        ],

        parts: [
            'motorcycle parts',
            'motorcycle part',
            'قطع دراجات نارية',
            'قطع غيار دراجات',
            'חלקי אופנוע',
        ],
    },

    Art: {
        paintings: [
            'painting',
            'paintings',
            'لوحة',
            'لوحات',
            'ציור',
            'ציורים',
        ],

        sculptures: [
            'sculpture',
            'sculptures',
            'منحوتة',
            'منحوتات',
            'פסל',
            'פסלים',
        ],

        photography: [
            'photography',
            'photo',
            'تصوير',
            'صور',
            'צילום',
        ],

        crafts: [
            'craft',
            'crafts',
            'أعمال يدوية',
            'حرف يدوية',
            'מלאכת יד',
        ],

        collectibles: [
            'collectible',
            'collectibles',
            'مقتنيات',
            'تحف',
            'פריטי אספנות',
        ],
    },

    Gaming: {
        consoles: [
            'console',
            'consoles',
            'playstation',
            'xbox',
            'nintendo',
            'بلايستيشن',
            'اكس بوكس',
            'نينتندو',
            'קונסולה',
        ],

        games: [
            'game',
            'games',
            'لعبة',
            'ألعاب',
            'משחק',
            'משחקים',
        ],

        accessories: [
            'gaming accessories',
            'ملحقات ألعاب',
            'اكسسوارات ألعاب',
            'אביזרי גיימינג',
        ],

        pc_gaming: [
            'pc gaming',
            'gaming pc',
            'كمبيوتر ألعاب',
            'بي سي ألعاب',
            'מחשב גיימינג',
        ],
    },

    RealEstate: {
        apartment: [
            'apartment',
            'apartments',
            'شقة',
            'شقق',
            'דירה',
            'דירות',
        ],

        house: [
            'house',
            'houses',
            'بيت',
            'بيوت',
            'منزل',
            'בתים',
        ],

        villa: [
            'villa',
            'فيلا',
            'فلل',
            'וילה',
        ],

        commercial: [
            'commercial',
            'commercial property',
            'تجاري',
            'عقار تجاري',
            'נכס מסחרי',
        ],

        land: [
            'land',
            'أرض',
            'أراضي',
            'קרקע',
        ],
    },

    Pets: {
        dogs: [
            'dog',
            'dogs',
            'كلب',
            'كلاب',
            'כלב',
            'כלבים',
        ],

        cats: [
            'cat',
            'cats',
            'قطة',
            'قطط',
            'חתול',
            'חתולים',
        ],

        birds: [
            'bird',
            'birds',
            'طير',
            'طيور',
            'ציפור',
            'ציפורים',
        ],

        fish: [
            'fish',
            'سمك',
            'أسماك',
            'דגים',
        ],

        small_animals: [
            'small animals',
            'حيوانات صغيرة',
            'חיות קטנות',
        ],

        supplies: [
            'pet supplies',
            'مستلزمات حيوانات',
            'مستلزمات حيوانات أليفة',
            'ציוד לחיות',
        ],
    },

    Furniture: {
        living_room: [
            'living room',
            'غرفة جلوس',
            'غرفة معيشة',
            'صالون',
            'סלון',
        ],

        bedroom: [
            'bedroom',
            'غرفة نوم',
            'חדר שינה',
        ],

        dining: [
            'dining',
            'dining room',
            'غرفة سفرة',
            'طاولة سفرة',
            'פינת אוכל',
        ],

        office: [
            'office',
            'مكتب',
            'أثاث مكتب',
            'משרד',
        ],

        outdoor: [
            'outdoor furniture',
            'أثاث خارجي',
            'ריהוט גן',
        ],

        kitchen: [
            'kitchen furniture',
            'أثاث مطبخ',
            'مطبخ',
            'מטבח',
        ],
    },
};

// ============================================================
// HELPERS
// ============================================================

function normalizeText(value) {
    if (!value) return '';

    return String(value)
        .toLowerCase()
        .normalize('NFKC')
        .replace(/[؟?!.,،؛:()[\]{}"'`]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function containsAlias(text, alias) {
    const normalizedText = normalizeText(text);
    const normalizedAlias = normalizeText(alias);

    if (!normalizedAlias) return false;

    // Arabic/Hebrew/English phrase matching
    return normalizedText.includes(normalizedAlias);
}

function findAlias(text, aliases) {
    const normalizedText = normalizeText(text);

    let bestMatch = null;

    for (const alias of aliases) {
        const normalizedAlias = normalizeText(alias);

        if (!normalizedAlias) continue;

        if (normalizedText.includes(normalizedAlias)) {
            if (
                !bestMatch ||
                normalizedAlias.length > bestMatch.length
            ) {
                bestMatch = normalizedAlias;
            }
        }
    }

    return bestMatch;
}

// ============================================================
// BRAND
// ============================================================

function detectBrand(query) {
    for (const [brand, aliases] of Object.entries(BRAND_ALIASES)) {
        if (findAlias(query, aliases)) {
            return brand;
        }
    }

    return null;
}

// ============================================================
// CATEGORY
// ============================================================

function detectCategory(query) {
    let detected = null;
    let longestMatch = 0;

    for (const [category, aliases] of Object.entries(
        CATEGORY_ALIASES
    )) {
        const match = findAlias(query, aliases);

        if (match && match.length > longestMatch) {
            detected = category;
            longestMatch = match.length;
        }
    }

    return detected;
}

// ============================================================
// TYPE
// ============================================================

function detectType(query, category) {
    if (!category || !TYPE_ALIASES[category]) {
        return null;
    }

    let detected = null;
    let longestMatch = 0;

    for (const [type, aliases] of Object.entries(
        TYPE_ALIASES[category]
    )) {
        const match = findAlias(query, aliases);

        if (match && match.length > longestMatch) {
            detected = type;
            longestMatch = match.length;
        }
    }

    return detected;
}

// ============================================================
// FUEL
// ============================================================

function detectFuel(query, category) {
    if (!['Cars', 'Motorcycles'].includes(category)) {
        return null;
    }

    for (const [fuel, aliases] of Object.entries(FUEL_ALIASES)) {
        if (findAlias(query, aliases)) {
            if (
                category === 'Motorcycles' &&
                !['gasoline', 'electric'].includes(fuel)
            ) {
                continue;
            }

            return fuel;
        }
    }

    return null;
}

// ============================================================
// CONDITION
// ============================================================

function detectCondition(query) {
    const text = normalizeText(query);

    if (
        containsAlias(text, 'new') ||
        containsAlias(text, 'جديد') ||
        containsAlias(text, 'جديدة') ||
        containsAlias(text, 'חדש') ||
        containsAlias(text, 'חדשה')
    ) {
        return 'new';
    }

    if (
        containsAlias(text, 'like new') ||
        containsAlias(text, 'like_new') ||
        containsAlias(text, 'شبه جديد') ||
        containsAlias(text, 'شبه جديدة') ||
        containsAlias(text, 'כמו חדש')
    ) {
        return 'like_new';
    }

    if (
        containsAlias(text, 'excellent') ||
        containsAlias(text, 'ممتاز') ||
        containsAlias(text, 'ممتازة') ||
        containsAlias(text, 'מצוין')
    ) {
        return 'excellent';
    }

    if (
        containsAlias(text, 'good') ||
        containsAlias(text, 'جيد') ||
        containsAlias(text, 'جيدة') ||
        containsAlias(text, 'טוב')
    ) {
        return 'good';
    }

    if (
        containsAlias(text, 'fair') ||
        containsAlias(text, 'مقبول') ||
        containsAlias(text, 'מצב סביר')
    ) {
        return 'fair';
    }

    return null;
}

// ============================================================
// STORAGE
// ============================================================

function detectStorage(query) {
    const text = normalizeText(query);

    const match = text.match(
        /(\d+(?:\.\d+)?)\s*(gb|g|tb|t|جيجا|غيغا|جيجابايت|تيرا|тера)/i
    );

    if (!match) {
        return null;
    }

    let value = match[1];
    let unit = match[2].toLowerCase();

    if (
        ['tb', 't', 'تيرا', 'тера'].includes(unit)
    ) {
        return `${value}TB`;
    }

    return `${value}GB`;
}

// ============================================================
// PRICE
// ============================================================

function detectPrice(query) {
    const text = normalizeText(query);

    let maxPrice = null;
    let minPrice = null;

    // under / less than / below
    const maxMatch = text.match(
        /(?:under|below|less than|أقل من|تحت|حدود|بحدود|עד|מתחת ל)\s*(\d[\d,.\s]*)/
    );

    if (maxMatch) {
        maxPrice = parseNumber(maxMatch[1]);
    }

    // from X
    const minMatch = text.match(
        /(?:from|starting from|من|ابتداء من|מ|ממחיר)\s*(\d[\d,.\s]*)/
    );

    if (minMatch) {
        minPrice = parseNumber(minMatch[1]);
    }

    // between X and Y
    const betweenMatch = text.match(
        /(?:between|بين|من)\s*(\d[\d,.\s]*)\s*(?:and|و|الى|إلى|עד)\s*(\d[\d,.\s]*)/
    );

    if (betweenMatch) {
        minPrice = parseNumber(betweenMatch[1]);
        maxPrice = parseNumber(betweenMatch[2]);
    }

    // explicit currency + number
    if (maxPrice === null) {
        const explicitMax = text.match(
            /(?:₪|nis|ils|شيكل|شيقل|שקל)\s*(\d[\d,.\s]*)/
        );

        if (explicitMax) {
            maxPrice = parseNumber(explicitMax[1]);
        }
    }

    return {
        minPrice,
        maxPrice,
    };
}

function parseNumber(value) {
    if (!value) return null;

    const cleaned = String(value)
        .replace(/[^\d.]/g, '');

    const number = Number(cleaned);

    return Number.isFinite(number)
        ? number
        : null;
}

// ============================================================
// CURRENCY
// ============================================================

function detectCurrency(query) {
    const text = normalizeText(query);

    if (
        containsAlias(text, '₪') ||
        containsAlias(text, 'nis') ||
        containsAlias(text, 'ils') ||
        containsAlias(text, 'شيكل') ||
        containsAlias(text, 'شيقل') ||
        containsAlias(text, 'שקל')
    ) {
        return 'ILS';
    }

    return null;
}

// ============================================================
// LOCATION
// ============================================================

function detectNearMe(query) {
    const text = normalizeText(query);

    const aliases = [
        'near me',
        'nearby',
        'close to me',
        'قريب مني',
        'بالقرب مني',
        'جنب مني',
        'حدي',
        'قريب',
        'קרוב אלי',
        'קרוב אליי',
        'לידי',
    ];

    return aliases.some((alias) =>
        containsAlias(text, alias)
    )
        ? true
        : null;
}

function detectLocation(query) {
    const text = normalizeText(query);

    // Basic known Israeli locations.
    // We can expand this later from your /api/cities.
    const locations = [
        'nazareth',
        'נצרת',
        'الناصرة',

        'haifa',
        'חיפה',
        'حيفا',

        'tel aviv',
        'תל אביב',
        'تل ابيب',
        'تل أبيب',

        'jerusalem',
        'ירושלים',
        'القدس',

        'acre',
        'akko',
        'עכו',
        'عكا',

        'safed',
        'צפת',
        'صفد',

        'tiberias',
        'טבריה',
        'طبريا',

        'netanya',
        'נתניה',
        'نتانيا',

        'ramallah',
        'רמאללה',
        'رام الله',

        'jenin',
        'ג׳נין',
        'جنين',
    ];

    for (const location of locations) {
        if (containsAlias(text, location)) {
            return location;
        }
    }

    return null;
}

// ============================================================
// MODEL
// ============================================================

function detectModel(query, brand) {
    const text = normalizeText(query);

    if (!brand) {
        return null;
    }

    // iPhone
    if (brand === 'apple') {
        const iphone = text.match(
            /\biphone\s*([0-9]+(?:\s*(?:pro|max|plus|mini))*)/i
        );

        if (iphone) {
            return `iPhone ${iphone[1].trim()}`
                .replace(/\s+/g, ' ');
        }
    }

    // Samsung Galaxy
    if (brand === 'samsung') {
        const samsung = text.match(
            /\b(?:galaxy\s*)?([aszm]\s*\d+(?:\s*(?:ultra|plus|\+|fe))?)/i
        );

        if (samsung) {
            return samsung[1]
                .replace(/\s+/g, ' ')
                .trim();
        }
    }

    return null;
}

// ============================================================
// QUERY CLEANUP
// ============================================================

function buildQuery(query) {
    if (!query) return null;

    const cleaned = String(query)
        .trim()
        .replace(/\s+/g, ' ');

    return cleaned || null;
}

// ============================================================
// MAIN PARSER
// ============================================================

function parseSearchQuery(userQuery) {
    if (
        !userQuery ||
        typeof userQuery !== 'string' ||
        !userQuery.trim()
    ) {
        throw new Error('Search query is required');
    }

    const query = userQuery.trim();

    const category = detectCategory(query);

    const brand = detectBrand(query);

    const type = detectType(query, category);

    const fuel = detectFuel(query, category);

    const condition = detectCondition(query);

    const storage = detectStorage(query);

    const price = detectPrice(query);

    const currency = detectCurrency(query);

    const nearMe = detectNearMe(query);

    const location = detectLocation(query);

    const model = detectModel(query, brand);

    return {
        query: buildQuery(query),

        brand,

        model,

        category,

        type,

        subcategory: type,

        storage,

        condition,

        fuel,

        maxPrice: price.maxPrice,

        minPrice: price.minPrice,

        currency,

        location,

        nearMe,
    };
}

// ============================================================
// EXPORT
// ============================================================

module.exports = {
    parseSearchQuery,
    BRAND_ALIASES,
    FUEL_ALIASES,
    CATEGORY_ALIASES,
    TYPE_ALIASES,
};