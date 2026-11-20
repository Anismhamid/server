const TYPE_ALIASES = {
    // ========================================================
    // House
    // ========================================================

    kitchen: [
        'kitchen',
        'kitchens',
        'مطبخ',
        'مطابخ',
        'أغراض مطبخ',
        'أدوات مطبخ',
        'מטבח',
        'מטבחים',
    ],

    storage: [
        'storage',
        'organizer',
        'organizers',
        'تخزين',
        'منظم',
        'منظمات',
        'خزائن تخزين',
        'אחסון',
        'ארגון',
    ],

    decor: [
        'decor',
        'decoration',
        'home decor',
        'ديكور',
        'ديكورات',
        'زينة',
        'ديكور منزلي',
        'עיצוב',
        'קישוט',
    ],

    maintenance: ['maintenance', 'repair', 'صيانة', 'تصليح', 'תחזוקה', 'תיקון'],

    // ========================================================
    // Garden
    // ========================================================

    plants: ['plants', 'plant', 'نباتات', 'نبتة', 'نبات', 'צמחים', 'צמח'],

    watering: [
        'watering',
        'irrigation',
        'ري',
        'سقاية',
        'ري النباتات',
        'השקיה',
        'השקיית צמחים',
    ],

    tools: [
        'tools',
        'garden tools',
        'أدوات',
        'أدوات حديقة',
        'أدوات بستنة',
        'כלים',
        'כלי גינה',
    ],

    outdoorDecor: [
        'outdoor decor',
        'garden decor',
        'ديكور خارجي',
        'ديكور حديقة',
        'زينة حديقة',
        'עיצוב חוץ',
        'עיצוב גינה',
    ],

    // ========================================================
    // Cars
    // ========================================================

    private: [
        'private',
        'private car',
        'personal car',
        'سيارة خاصة',
        'سيارات خاصة',
        'רכב פרטי',
        'רכבים פרטיים',
    ],

    electric: [
        'electric',
        'electric car',
        'electric vehicle',
        'سيارة كهربائية',
        'سيارات كهربائية',
        'مركبة كهربائية',
        'רכב חשמלי',
        'מכונית חשמלית',
    ],

    parts: [
        'parts',
        'car parts',
        'spare parts',
        'قطع غيار',
        'قطع سيارة',
        'قطع سيارات',
        'חלפים',
        'חלקי חילוף',
    ],

    // ========================================================
    // Bikes
    // ========================================================

    kids: [
        'kids',
        'kids bike',
        'children bike',
        'دراجة أطفال',
        'دراجات أطفال',
        'אופניים לילדים',
    ],

    mountain: [
        'mountain',
        'mountain bike',
        'دراجة جبلية',
        'دراجات جبلية',
        'אופני הרים',
    ],

    road: ['road', 'road bike', 'دراجة طريق', 'دراجات طريق', 'אופני כביש'],

    // ========================================================
    // Trucks
    // ========================================================

    light: [
        'light truck',
        'light trucks',
        'شاحنة خفيفة',
        'شاحنات خفيفة',
        'משאית קלה',
    ],

    heavy: [
        'heavy truck',
        'heavy trucks',
        'شاحنة ثقيلة',
        'شاحنات ثقيلة',
        'משאית כבדה',
    ],

    // ========================================================
    // Electric Vehicles
    // ========================================================

    cars: [
        'electric cars',
        'electric car',
        'سيارات كهربائية',
        'سيارة كهربائية',
        'מכוניות חשמליות',
    ],

    scooters: [
        'scooter',
        'scooters',
        'electric scooter',
        'سكوتر',
        'سكوترات',
        'سكوتر كهربائي',
        'קורקינט',
        'קורקינט חשמלי',
    ],

    // ========================================================
    // Clothes
    // ========================================================

    casual: [
        'casual',
        'casual clothes',
        'ملابس كاجوال',
        'ملابس عادية',
        'كاجوال',
        'בגדים קזואליים',
    ],

    formal: ['formal', 'formal clothes', 'ملابس رسمية', 'رسمي', 'בגדים רשמיים'],

    shoes: [
        'shoes',
        'shoe',
        'أحذية',
        'حذاء',
        'أحذية رجالية',
        'أحذية نسائية',
        'נעליים',
        'נעל',
    ],

    dresses: ['dress', 'dresses', 'فستان', 'فساتين', 'שמלות', 'שמלה'],

    // ========================================================
    // Women Bags
    // ========================================================

    handbags: [
        'handbag',
        'handbags',
        'حقيبة يد',
        'حقائب يد',
        'شنطة يد',
        'תיק יד',
        'תיקי יד',
    ],

    toteBags: [
        'tote',
        'tote bag',
        'tote bags',
        'حقيبة توت',
        'حقائب توت',
        'תיק tote',
    ],

    backpacks: [
        'backpack',
        'backpacks',
        'حقيبة ظهر',
        'حقائب ظهر',
        'شنطة ظهر',
        'תיק גב',
        'תיקי גב',
    ],

    clutches: [
        'clutch',
        'clutches',
        'كلتش',
        'حقيبة كلتش',
        'حقائب كلتش',
        'קלאץ׳',
    ],

    // ========================================================
    // Baby
    // ========================================================

    clothes: ['baby clothes', 'ملابس أطفال', 'ملابس رضع', 'בגדי תינוקות'],

    care: [
        'baby care',
        'رعاية أطفال',
        'مستلزمات رعاية الأطفال',
        'טיפול בתינוקות',
    ],

    feeding: [
        'baby feeding',
        'feeding',
        'رضاعة',
        'تغذية أطفال',
        'مستلزمات رضاعة',
        'האכלה',
    ],

    // ========================================================
    // Kids
    // ========================================================

    educational: [
        'educational',
        'education',
        'تعليمي',
        'تعليمية',
        'ألعاب تعليمية',
        'חינוכי',
        'חינוכיים',
    ],

    toys: ['toys', 'toy', 'ألعاب', 'لعبة', 'ألعاب أطفال', 'צעצועים', 'צעצוע'],

    outdoor: [
        'outdoor',
        'outdoor toys',
        'outdoor furniture',
        'garden furniture',
        'ألعاب خارجية',
        'أغراض خارجية',
        'أثاث خارجي',
        'أثاث حديقة',
        'أثاث حدائق',
        'ציוד חוץ',
        'ריהוט גן',
        'ריהוט חוץ',
    ],

    // ========================================================
    // Health
    // ========================================================

    personalCare: [
        'personal care',
        'العناية الشخصية',
        'عناية شخصية',
        'טיפוח אישי',
    ],

    medical: [
        'medical',
        'medical equipment',
        'معدات طبية',
        'أجهزة طبية',
        'ציוד רפואי',
    ],

    fitness: [
        'fitness',
        'gym',
        'exercise',
        'لياقة',
        'رياضة',
        'معدات رياضية',
        'כושר',
        'ספורט',
    ],

    // ========================================================
    // Beauty
    // ========================================================

    makeup: [
        'makeup',
        'cosmetics',
        'مكياج',
        'مستحضرات تجميل',
        'איפור',
        'קוסמטיקה',
    ],

    skincare: [
        'skincare',
        'skin care',
        'عناية بالبشرة',
        'العناية بالبشرة',
        'טיפוח העור',
    ],

    hair: [
        'hair',
        'hair care',
        'العناية بالشعر',
        'عناية بالشعر',
        'مستلزمات شعر',
        'טיפוח שיער',
    ],

    // ========================================================
    // Watches
    // ========================================================

    classic: [
        'classic watch',
        'classic watches',
        'ساعة كلاسيكية',
        'ساعات كلاسيكية',
        'שעון קלאסי',
    ],

    smart: [
        'smart watch',
        'smartwatch',
        'smart watches',
        'ساعة ذكية',
        'ساعات ذكية',
        'שעון חכם',
        'שעונים חכמים',
    ],

    hand: [
        'hand watch',
        'wrist watch',
        'wristwatch',
        'ساعة يد',
        'ساعات يد',
        'שעון יד',
        'שעוני יד',
    ],

    // ========================================================
    // Cleaning
    // ========================================================

    detergents: ['detergents', 'detergent', 'منظفات', 'منظف', 'חומרי ניקוי'],

    disinfection: [
        'disinfection',
        'disinfectant',
        'تعقيم',
        'مطهر',
        'مواد تعقيم',
        'חיטוי',
        'חומר חיטוי',
    ],

    // ========================================================
    // Motorcycles
    // ========================================================

    street: [
        'street motorcycle',
        'street bike',
        'دراجة نارية شارع',
        'دراجة شارع',
        'אופנוע כביש',
    ],

    sport: [
        'sport motorcycle',
        'sports bike',
        'دراجة نارية رياضية',
        'موتوسيكل رياضي',
        'אופנוע ספורט',
    ],

    cruiser: [
        'cruiser',
        'cruiser motorcycle',
        'كروزر',
        'دراجة كروزر',
        'אופנוע קרוזר',
    ],

    offRoad: [
        'off road',
        'off-road',
        'دراجة نارية أوف رود',
        'أوف رود',
        'שטח',
        'אופנוע שטח',
    ],

    scooter: ['scooter', 'سكوتر', 'سكوترات', 'קטנוע', 'קטנועים'],

    // ========================================================
    // Electronics
    // ========================================================

    smartphones: [
        'smartphone',
        'smartphones',
        'phone',
        'phones',
        'mobile',
        'mobile phone',
        'هاتف',
        'هواتف',
        'جوال',
        'جوالات',
        'موبايل',
        'موبايلات',
        'טלפון',
        'טלפונים',
    ],

    laptops: [
        'laptop',
        'laptops',
        'notebook',
        'notebooks',
        'لابتوب',
        'لابتوبات',
        'حاسوب محمول',
        'מחשב נייד',
        'מחשבים ניידים',
    ],

    tablets: [
        'tablet',
        'tablets',
        'تابلت',
        'تابلتات',
        'جهاز لوحي',
        'أجهزة لوحية',
        'טאבלט',
        'טאבלטים',
    ],

    accessories: [
        'accessories',
        'accessory',
        'إكسسوارات',
        'اكسسوارات',
        'ملحقات',
        'אביזרים',
    ],

    audio: [
        'audio',
        'headphones',
        'earphones',
        'speakers',
        'سماعات',
        'سماعة',
        'مكبر صوت',
        'مكبرات صوت',
        'אוזניות',
        'רמקולים',
    ],

    // ========================================================
    // Art
    // ========================================================

    paintings: [
        // English
        'painting',
        'paintings',
        'oil painting',
        'oil paintings',
        'oil artwork',

        // Arabic
        'لوحة',
        'لوحات',
        'لوحة زيتية',
        'لوحات زيتية',
        'لوحه',
        'لوحات',
        'لوحه زيتيه',
        'لوحات زيتيه',
        'لوحة زيتيه',
        'لوحات زيتية',
        'رسم زيتي',
        'رسم زيتيه',
        'رسمة زيتية',
        'رسمة زيتيه',
        'رسومات زيتية',
        'رسومات زيتيه',

        // Hebrew
        'ציור',
        'ציורים',
        'ציור שמן',
        'ציורי שמן',
    ],

    sculptures: [
        'sculpture',
        'sculptures',
        'تمثال',
        'تماثيل',
        'منحوتة',
        'منحوتات',
        'פסל',
        'פסלים',
    ],

    photography: [
        'photography',
        'photo',
        'photos',
        'تصوير',
        'صور',
        'تصوير فوتوغرافي',
        'צילום',
        'תצלומים',
    ],

    crafts: [
        'craft',
        'crafts',
        'handmade',
        'أشغال يدوية',
        'حرف يدوية',
        'أعمال يدوية',
        'م handmade',
        'מלאכת יד',
        'עבודות יד',
    ],

    collectibles: [
        'collectibles',
        'collectible',
        'مقتنيات',
        'تحف',
        'قطع نادرة',
        'אספנות',
        'פריטי אספנות',
    ],

    // ========================================================
    // Gaming
    // ========================================================

    consoles: [
        'console',
        'consoles',
        'playstation',
        'xbox',
        'nintendo',
        'بلايستيشن',
        'إكس بوكس',
        'اكس بوكس',
        'نينتندو',
        'קונסולה',
        'פלייסטיישן',
        'אקסבוקס',
    ],

    games: [
        'game',
        'games',
        'video game',
        'video games',
        'لعبة',
        'ألعاب',
        'لعبة فيديو',
        'ألعاب فيديو',
        'משחק',
        'משחקים',
    ],

    pc_gaming: [
        'pc gaming',
        'gaming pc',
        'gaming computer',
        'كمبيوتر ألعاب',
        'كمبيوتر قيمنق',
        'بي سي ألعاب',
        'מחשב גיימינג',
    ],

    // ========================================================
    // Real Estate
    // ========================================================

    apartment: [
        'apartment',
        'apartments',
        'flat',
        'شقة',
        'شقق',
        'דירה',
        'דירות',
    ],

    house: ['house', 'houses', 'بيت', 'بيوت', 'منزل', 'منازل', 'בית', 'בתים'],

    villa: ['villa', 'villas', 'فيلا', 'فلل', 'וילה', 'וילות'],

    commercial: [
        'commercial',
        'commercial property',
        'محل',
        'محلات',
        'عقار تجاري',
        'مكتب تجاري',
        'נכס מסחרי',
        'חנות',
    ],

    land: ['land', 'plot', 'plots', 'أرض', 'أراضي', 'قطعة أرض', 'קרקע', 'מגרש'],

    // ========================================================
    // Pets
    // ========================================================

    dogs: ['dog', 'dogs', 'كلب', 'كلاب', 'כלב', 'כלבים'],

    cats: ['cat', 'cats', 'قطة', 'قطط', 'חתול', 'חתולים'],

    birds: ['bird', 'birds', 'طائر', 'طيور', 'ציפור', 'ציפורים'],

    fish: ['fish', 'سمك', 'أسماك', 'דגים'],

    small_animals: [
        'small animals',
        'hamster',
        'rabbit',
        'أرانب',
        'هامستر',
        'حيوانات صغيرة',
        'ארנב',
        'אוגר',
    ],

    supplies: [
        'pet supplies',
        'animal supplies',
        'مستلزمات حيوانات',
        'مستلزمات حيوانات أليفة',
        'ציוד לחיות',
    ],

    // ========================================================
    // Furniture
    // ========================================================

    living_room: [
        'living room',
        'living room furniture',
        'غرفة معيشة',
        'غرفة جلوس',
        'أثاث غرفة المعيشة',
        'סלון',
        'רהיטי סלון',
    ],

    bedroom: [
        'bedroom',
        'bedroom furniture',
        'غرفة نوم',
        'أثاث غرفة نوم',
        'חדר שינה',
        'רהיטי חדר שינה',
    ],

    dining: [
        'dining',
        'dining room',
        'غرفة طعام',
        'غرفة سفرة',
        'أثاث سفرة',
        'פינת אוכל',
        'חדר אוכל',
    ],

    office: [
        'office',
        'office furniture',
        'مكتب',
        'أثاث مكتبي',
        'غرفة مكتب',
        'משרד',
        'ריהוט משרדי',
    ],


    // Garden
    trees: [
        'trees',
        'tree',
        'fruit trees',
        'fruit tree',
        'أشجار',
        'شجر',
        'أشجار مثمرة',
        'עצים',
        'עצי פרי',
    ],

    // Cameras
    cameras: [
        'cameras',
        'camera',
        'digital cameras',
        'كاميرات',
        'كاميرا',
        'מצלמות',
        'מצלמה',
    ],

    lenses: [
        'lenses',
        'lens',
        'camera lenses',
        'عدسات',
        'عدسة',
        'עדשות',
        'עדשה',
    ],

    video: [
        'video',
        'video cameras',
        'camcorders',
        'فيديو',
        'كاميرات فيديو',
        'מצלמות וידאו',
    ],

    // Books
    school: [
        'school',
        'school books',
        'textbooks',
        'كتب مدرسية',
        'كتب المدرسة',
        'ספרי לימוד',
    ],

    university: [
        'university',
        'academic books',
        'college books',
        'كتب جامعية',
        'كتب أكاديمية',
        'ספרים אקדמיים',
    ],

    novels: [
        'novels',
        'novel',
        'fiction',
        'روايات',
        'رواية',
        'רומנים',
    ],

    children: [
        'children',
        'childrens books',
        'kids books',
        'كتب أطفال',
        'قصص أطفال',
        'ספרי ילדים',
    ],

    religious: [
        'religious',
        'religious books',
        'كتب دينية',
        'كتب إسلامية',
        'ספרי דת',
    ],

    language: [
        'language',
        'language learning',
        'كتب لغات',
        'تعلم اللغات',
        'ספרי שפות',
    ],

    business: [
        'business',
        'business books',
        'كتب أعمال',
        'كتب إدارة',
        'ספרי עסקים',
    ],

    other: [
        'other',
        'others',
        'other books',
        'أخرى',
        'أخرى متنوعة',
        'متفرقات',
        'אחר',
        'אחרים',
    ],

    // Musical Instruments
    guitars: [
        'guitars',
        'guitar',
        'acoustic guitar',
        'electric guitar',
        'قيثارات',
        'جيتار',
        'غيتار',
        'גיטרות',
        'גיטרה',
    ],

    pianos: [
        'pianos',
        'piano',
        'grand piano',
        'digital piano',
        'بيانو',
        'بيانوهات',
        'פסנתרים',
        'פסנתר',
    ],

    keyboards: [
        'keyboards',
        'keyboard',
        'musical keyboard',
        'synthesizer',
        'أورغ',
        'أورج',
        'لوحات مفاتيح موسيقية',
        'קלידים',
        'אורגנים',
    ],

    drums: [
        'drums',
        'drum',
        'drum set',
        'طبول',
        'طبل',
        'درامز',
        'תופים',
    ],

    violins: [
        'violins',
        'violin',
        'كمان',
        'كمنجة',
        'كمانات',
        'כינורות',
        'כינור',
    ],

    wind: [
        'wind',
        'wind instruments',
        'flute',
        'saxophone',
        'trumpet',
        'آلات نفخ',
        'ناي',
        'فلوت',
        'ساكسفون',
        'כלי נשיפה',
    ],

    percussion: [
        'percussion',
        'percussion instruments',
        'آلات إيقاعية',
        'إيقاع',
        'دفوف',
        'כלי הקשה',
    ],

    // Construction Equipment
    excavators: [
        'excavators',
        'excavator',
        'حفارات',
        'حفارة',
        'מחפרים',
        'מחפר',
    ],

    loaders: [
        'loaders',
        'loader',
        'جرافات تحميل',
        'لودر',
        'מעמיסים',
    ],

    cranes: [
        'cranes',
        'crane',
        'رافعات',
        'رافعة',
        'מנופים',
        'מנוף',
    ],

    concrete_equipment: [
        'concrete equipment',
        'concrete mixers',
        'معدات خرسانة',
        'خلاطات خرسانة',
        'ציוד בטון',
    ],

    scaffolding: [
        'scaffolding',
        'scaffold',
        'سقالات',
        'سقالة',
        'פיגומים',
    ],

    cutting_equipment: [
        'cutting equipment',
        'cutting machines',
        'معدات قص',
        'معدات تقطيع',
        'ציוד חיתוך',
    ],

    compaction_equipment: [
        'compaction equipment',
        'compactors',
        'معدات دك',
        'معدات ضغط التربة',
        'ציוד הידוק',
    ],

    // Industrial Equipment
    industrial_machines: [
        'industrial machines',
        'industrial machinery',
        'آلات صناعية',
        'ماكينات صناعية',
        'מכונות תעשייתיות',
    ],

    compressors: [
        'compressors',
        'compressor',
        'ضواغط',
        'كمبروسر',
        'מדחסים',
    ],

    generators: [
        'generators',
        'generator',
        'مولدات',
        'مولد كهرباء',
        'גנרטורים',
    ],

    production_equipment: [
        'production equipment',
        'production machines',
        'معدات إنتاج',
        'معدات تصنيع',
        'ציוד ייצור',
    ],

    packaging_equipment: [
        'packaging equipment',
        'packaging machines',
        'معدات تغليف',
        'آلات تعبئة وتغليف',
        'ציוד אריזה',
    ],

    material_handling: [
        'material handling',
        'material handling equipment',
        'معدات مناولة',
        'معدات نقل المواد',
        'ציוד שינוע',
    ],

    // Welding Equipment
    welding_machines: [
        'welding machines',
        'welding machine',
        'ماكينات لحام',
        'أجهزة لحام',
        'מכונות ריתוך',
    ],

    plasma_cutters: [
        'plasma cutters',
        'plasma cutter',
        'قواطع بلازما',
        'جهاز بلازما',
        'חותכי פלזמה',
    ],

    welding_accessories: [
        'welding accessories',
        'ملحقات لحام',
        'اكسسوارات لحام',
        'אביזרי ריתוך',
    ],

    protective_equipment: [
        'protective equipment',
        'safety equipment',
        'معدات حماية',
        'معدات سلامة',
        'ציוד מגן',
    ],

    // Office Equipment
    printers: [
        'printers',
        'printer',
        'طابعات',
        'طابعة',
        'מדפסות',
    ],

    scanners: [
        'scanners',
        'scanner',
        'ماسحات ضوئية',
        'سكانر',
        'סורקים',
    ],

    copiers: [
        'copiers',
        'copier',
        'photocopiers',
        'آلات تصوير',
        'ماكينات تصوير',
        'מכונות צילום',
    ],

    projectors: [
        'projectors',
        'projector',
        'أجهزة عرض',
        'بروجكتور',
        'מקרנים',
    ],

    shredders: [
        'shredders',
        'paper shredders',
        'فرامات ورق',
        'ماكينات إتلاف الورق',
        'מגרסות נייר',
    ],

    laminators: [
        'laminators',
        'laminator',
        'آلات تغليف حراري',
        'ماكينات تغليف',
        'מכשירי למינציה',
    ],

    // Services
    electrical: [
        'electrical',
        'electrician',
        'electrical services',
        'كهرباء',
        'كهربائي',
        'خدمات كهربائية',
        'חשמל',
        'חשמלאי',
    ],

    plumbing: [
        'plumbing',
        'plumber',
        'سباكة',
        'سباك',
        'تمديدات مياه',
        'אינסטלציה',
        'אינסטלטור',
    ],

    cleaning: [
        'cleaning',
        'cleaning services',
        'خدمات تنظيف',
        'تنظيف',
        'ניקיון',
        'שירותי ניקיון',
    ],

    transportation: [
        'transportation',
        'transport',
        'نقل',
        'خدمات نقل',
        'مواصلات',
        'הובלה',
        'תחבורה',
    ],

    moving: [
        'moving',
        'moving services',
        'نقل عفش',
        'نقل أثاث',
        'نقل منازل',
        'הובלות',
    ],

    automotive: [
        'automotive',
        'car services',
        'خدمات سيارات',
        'صيانة سيارات',
        'שירותי רכב',
    ],

    programming: [
        'programming',
        'software development',
        'برمجة',
        'تطوير برمجيات',
        'תכנות',
    ],

    design: [
        'design',
        'graphic design',
        'تصميم',
        'تصميم جرافيك',
        'עיצוב',
    ],

    marketing: [
        'marketing',
        'digital marketing',
        'تسويق',
        'تسويق إلكتروني',
        'שיווק',
    ],

    education: [
        'education',
        'tutoring',
        'teaching',
        'تعليم',
        'دروس خصوصية',
        'تدريس',
        'חינוך',
        'שיעורים פרטיים',
    ],

    beauty: [
        'beauty',
        'beauty services',
        'خدمات تجميل',
        'تجميل',
        'קוסמטיקה',
    ],

    // Real Estate
    room: [
        'room',
        'rooms',
        'private room',
        'غرفة',
        'غرف',
        'غرفة للإيجار',
        'חדר',
        'חדרים',
    ],
};

module.exports = {
    TYPE_ALIASES,
};
