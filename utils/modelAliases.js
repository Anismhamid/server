const MODEL_ALIASES = {
    Apple: {
        iPhone: ['iphone', 'ايفون', 'آيفون', 'أيفون', 'ايفن', 'אייפון'],

        'iPhone 11': ['iphone 11', 'ايفون 11', 'آيفون 11', 'אייפון 11'],

        'iPhone 11 Pro': [
            'iphone 11 pro',
            'ايفون 11 برو',
            'آيفون 11 برو',
            'אייפון 11 פרו',
        ],

        'iPhone 11 Pro Max': [
            'iphone 11 pro max',
            'ايفون 11 برو ماكس',
            'آيفون 11 برو ماكس',
            'אייפון 11 פרו מקס',
        ],

        'iPhone 12': ['iphone 12', 'ايفون 12', 'آيفون 12', 'אייפון 12'],

        'iPhone 12 Pro': [
            'iphone 12 pro',
            'ايفون 12 برو',
            'آيفون 12 برو',
            'אייפון 12 פרו',
        ],

        'iPhone 12 Pro Max': [
            'iphone 12 pro max',
            'ايفون 12 برو ماكس',
            'آيفون 12 برو ماكس',
            'אייפון 12 פרו מקס',
        ],

        'iPhone 13': ['iphone 13', 'ايفون 13', 'آيفون 13', 'אייפון 13'],

        'iPhone 13 Pro': [
            'iphone 13 pro',
            'ايفون 13 برو',
            'آيفون 13 برو',
            'אייפון 13 פרו',
        ],

        'iPhone 13 Pro Max': [
            'iphone 13 pro max',
            'ايفون 13 برو ماكس',
            'آيفون 13 برو ماكس',
            'אייפון 13 פרו מקס',
        ],

        'iPhone 14': ['iphone 14', 'ايفون 14', 'آيفون 14', 'אייפון 14'],

        'iPhone 14 Pro': [
            'iphone 14 pro',
            'ايفون 14 برو',
            'آيفون 14 برو',
            'אייפון 14 פרו',
        ],

        'iPhone 14 Pro Max': [
            'iphone 14 pro max',
            'ايفون 14 برو ماكس',
            'آيفون 14 برو ماكس',
            'אייפון 14 פרו מקס',
        ],

        'iPhone 15': ['iphone 15', 'ايفون 15', 'آيفون 15', 'אייפון 15'],

        'iPhone 15 Pro': [
            'iphone 15 pro',
            'ايفون 15 برو',
            'آيفون 15 برو',
            'אייפון 15 פרו',
        ],

        'iPhone 15 Pro Max': [
            'iphone 15 pro max',
            'ايفون 15 برو ماكس',
            'آيفون 15 برو ماكس',
            'אייפון 15 פרו מקס',
        ],

        'iPhone 16': ['iphone 16', 'ايفون 16', 'آيفون 16', 'אייפון 16'],

        'iPhone 16 Pro': [
            'iphone 16 pro',
            'ايفون 16 برو',
            'آيفون 16 برو',
            'אייפון 16 פרו',
        ],

        'iPhone 16 Pro Max': [
            'iphone 16 pro max',
            'ايفون 16 برو ماكس',
            'آيفون 16 برو ماكس',
            'אייפון 16 פרו מקס',
        ],

        'iPhone 17': ['iphone 17', 'ايفون 17', 'آيفون 17', 'אייפון 17'],

        'iPhone 17 Pro': [
            'iphone 17 pro',
            'ايفون 17 برو',
            'آيفون 17 برو',
            'אייפון 17 פרו',
        ],

        'iPhone 17 Pro Max': [
            'iphone 17 pro max',
            'ايفون 17 برو ماكس',
            'آيفون 17 برو ماكس',
            'אייפון 17 פרו מקס',
        ],
        iPad: ['ipad', 'ايباد', 'آيباد', 'أيباد', 'אייפד'],

        'iPad Air': ['ipad air', 'ايباد اير', 'آيباد اير', 'אייפד אייר'],

        'iPad Pro': [
            'ipad pro',
            'ا ipad pro',
            'ايباد برو',
            'آيباد برو',
            'אייפד פרו',
        ],

        'iPad Mini': [
            'ipad mini',
            'ipad mini',
            'ايباد ميني',
            'آيباد ميني',
            'אייפד מיני',
        ],

        'iPad 10': [
            'ipad 10',
            'ipad 10th generation',
            'ايباد 10',
            'آيباد 10',
            'אייפד 10',
        ],

        'iPad Air 5': [
            'ipad air 5',
            'ايباد اير 5',
            'آيباد اير 5',
            'אייפד אייר 5',
        ],

        'iPad Air 6': [
            'ipad air 6',
            'ايباد اير 6',
            'آيباد اير 6',
            'אייפד אייר 6',
        ],

        'iPad Pro 11': [
            'ipad pro 11',
            'ايباد برو 11',
            'آيباد برو 11',
            'אייפד פרו 11',
        ],

        'iPad Pro 12.9': [
            'ipad pro 12.9',
            'ايباد برو 12.9',
            'آيباد برو 12.9',
            'אייפד פרו 12.9',
        ],
    },

    Samsung: {
        'Galaxy S21': [
            'galaxy s21',
            's21',
            'جالكسي s21',
            'سامسونج s21',
            'גלקסי s21',
            'סמסונג s21',
        ],

        'Galaxy S22': [
            'galaxy s22',
            's22',
            'جالكسي s22',
            'سامسونج s22',
            'גלקסי s22',
            'סמסונג s22',
        ],

        'Galaxy S23': [
            'galaxy s23',
            's23',
            'جالكسي s23',
            'سامسونج s23',
            'גלקסי s23',
            'סמסונג s23',
        ],

        'Galaxy S24': [
            'galaxy s24',
            's24',
            'جالكسي s24',
            'سامسونج s24',
            'גלקסי s24',
            'סמסונג s24',
        ],

        'Galaxy S25': [
            'galaxy s25',
            's25',
            'جالكسي s25',
            'سامسونج s25',
            'גלקסי s25',
            'סמסונג s25',
        ],

        'Galaxy S26': [
            'galaxy s26',
            's26',
            'جالكسي s26',
            'سامسونج s26',
            'גלקסי s26',
            'סמסונג s26',
        ],

        'Galaxy A54': [
            'galaxy a54',
            'a54',
            'جالكسي a54',
            'سامسونج a54',
            'גלקסי a54',
            'סמסונג a54',
        ],

        'Galaxy A55': [
            'galaxy a55',
            'a55',
            'جالكسي a55',
            'سامسونج a55',
            'גלקסי a55',
            'סמסונג a55',
        ],

        'Galaxy A56': [
            'galaxy a56',
            'a56',
            'جالكسي a56',
            'سامسونج a56',
            'גלקסי a56',
            'סמסונג a56',
        ],

        'Galaxy Note 20': [
            'galaxy note 20',
            'note 20',
            'نوت 20',
            'جالكسي نوت 20',
            'גלקסי נוט 20',
            'סמסונג נוט 20',
        ],

        'Galaxy Z Fold 5': [
            'galaxy z fold 5',
            'z fold 5',
            'fold 5',
            'جالكسي فولد 5',
            'גלקסי פולד 5',
        ],

        'Galaxy Z Fold 6': [
            'galaxy z fold 6',
            'z fold 6',
            'fold 6',
            'جالكسي فولد 6',
            'גלקסי פולד 6',
        ],

        'Galaxy Z Flip 5': [
            'galaxy z flip 5',
            'z flip 5',
            'flip 5',
            'جالكسي فليب 5',
            'גלקסי פליפ 5',
        ],

        'Galaxy Z Flip 6': [
            'galaxy z flip 6',
            'z flip 6',
            'flip 6',
            'جالكسي فليب 6',
            'גלקסי פליפ 6',
        ],
        'Galaxy Tab S7': [
            'galaxy tab s7',
            'samsung tab s7',
            'تاب s7',
            'جالكسي تاب s7',
            'גלקסי טאב s7',
        ],

        'Galaxy Tab S8': [
            'galaxy tab s8',
            'samsung tab s8',
            'تاب s8',
            'جالكسي تاب s8',
            'גלקסי טאב s8',
        ],

        'Galaxy Tab S9': [
            'galaxy tab s9',
            'samsung tab s9',
            'تاب s9',
            'جالكسي تاب s9',
            'גלקסי טאב s9',
        ],

        'Galaxy Tab S10': [
            'galaxy tab s10',
            'samsung tab s10',
            'تاب s10',
            'جالكسي تاب s10',
            'גלקסי טאב s10',
        ],

        'Galaxy Tab A8': [
            'galaxy tab a8',
            'samsung tab a8',
            'تاب a8',
            'جالكسي تاب a8',
            'גלקסי טאב a8',
        ],

        'Galaxy Tab A9': [
            'galaxy tab a9',
            'samsung tab a9',
            'تاب a9',
            'جالكسي تاب a9',
            'גלקסי טאב a9',
        ],
    },
    Huawei: {
        P30: ['p30', 'huawei p30', 'هواوي p30', 'هواوي بي 30', 'וואווי p30'],

        P40: ['p40', 'huawei p40', 'هواوي p40', 'هواوي بي 40', 'וואווי p40'],

        P50: ['p50', 'huawei p50', 'هواوي p50', 'וואווי p50'],

        P60: ['p60', 'huawei p60', 'هواوي p60', 'וואווי p60'],

        Pura70: [
            'pura 70',
            'pura70',
            'huawei pura 70',
            'هواوي pura 70',
            'וואווי pura 70',
        ],

        Mate20: [
            'mate 20',
            'mate20',
            'huawei mate 20',
            'هواوي ميت 20',
            'ميت 20',
            'וואווי mate 20',
        ],

        Mate30: [
            'mate 30',
            'mate30',
            'huawei mate 30',
            'هواوي ميت 30',
            'ميت 30',
            'וואווי mate 30',
        ],

        Mate40: [
            'mate 40',
            'mate40',
            'huawei mate 40',
            'هواوي ميت 40',
            'ميت 40',
            'וואווי mate 40',
        ],

        Mate50: [
            'mate 50',
            'mate50',
            'huawei mate 50',
            'هواوي ميت 50',
            'ميت 50',
            'וואווי mate 50',
        ],

        Mate60: [
            'mate 60',
            'mate60',
            'huawei mate 60',
            'هواوي ميت 60',
            'ميت 60',
            'וואווי mate 60',
        ],

        Nova9: [
            'nova 9',
            'nova9',
            'huawei nova 9',
            'هواوي نوفا 9',
            'نوفا 9',
            'וואווי nova 9',
        ],

        Nova10: [
            'nova 10',
            'nova10',
            'huawei nova 10',
            'هواوي نوفا 10',
            'نوفا 10',
            'וואווי nova 10',
        ],

        Nova11: [
            'nova 11',
            'nova11',
            'huawei nova 11',
            'هواوي نوفا 11',
            'نوفا 11',
            'וואווי nova 11',
        ],
        MatePad: [
            'huawei matepad',
            'matepad',
            'هواوي ميت باد',
            'هواوي ميتباد',
            'וואווי מייטפד',
        ],

        MatePad10: [
            'huawei matepad 10',
            'matepad 10',
            'هواوي ميت باد 10',
            'וואווי מייטפד 10',
        ],

        MatePad11: [
            'huawei matepad 11',
            'matepad 11',
            'هواوي ميت باد 11',
            'וואווי מייטפד 11',
        ],

        MatePad12: [
            'huawei matepad 12',
            'matepad 12',
            'هواوي ميت باد 12',
            'וואווי מייטפד 12',
        ],
    },

    Xiaomi: {
        RedmiNote10: [
            'redmi note 10',
            'redmi note10',
            'ريدمي نوت 10',
            'نوت 10',
            'שיאומי רדמי נוט 10',
        ],

        RedmiNote11: [
            'redmi note 11',
            'redmi note11',
            'ريدمي نوت 11',
            'נוט 11',
            'שיאומי רדמי נוט 11',
        ],

        RedmiNote12: [
            'redmi note 12',
            'redmi note12',
            'ريدمي نوت 12',
            'נוט 12',
            'שיאומי רדמי נוט 12',
        ],

        RedmiNote13: [
            'redmi note 13',
            'redmi note13',
            'ريدمي نوت 13',
            'נוט 13',
            'שיאומי רדמי נוט 13',
        ],

        RedmiNote14: [
            'redmi note 14',
            'redmi note14',
            'ريدمي نوت 14',
            'נוט 14',
            'שיאומי רדמי נוט 14',
        ],

        RedmiNote15: [
            'redmi note 15',
            'redmi note15',
            'ريدمي نوت 15',
            'נוט 15',
            'שיאומי רדמי נוט 15',
        ],

        PocoX3: ['poco x3', 'pocox3', 'بوكو x3', 'بوكواكس 3', 'שיאומי poco x3'],

        PocoX4: ['poco x4', 'pocox4', 'بوكو x4', 'שיאומי poco x4'],

        PocoX5: ['poco x5', 'pocox5', 'بوكو x5', 'שיאומי poco x5'],

        PocoX6: ['poco x6', 'pocox6', 'بوكو x6', 'שיאומי poco x6'],

        Xiaomi13: ['xiaomi 13', 'شاومي 13', 'שיאומי 13'],

        Xiaomi14: ['xiaomi 14', 'شاومي 14', 'שיאומי 14'],

        Xiaomi15: ['xiaomi 15', 'شاومي 15', 'שיאומי 15'],
        'Xiaomi Pad 5': [
            'xiaomi pad 5',
            'mi pad 5',
            'شاومي باد 5',
            'شياومي باد 5',
            'שיאומי פד 5',
        ],

        'Xiaomi Pad 6': [
            'xiaomi pad 6',
            'mi pad 6',
            'شاومي باد 6',
            'שיאומי פד 6',
        ],

        'Xiaomi Pad 7': [
            'xiaomi pad 7',
            'mi pad 7',
            'شاومي باد 7',
            'שיאומי פד 7',
        ],
    },

    Lenovo: {
        'Tab M10': [
            'lenovo tab m10',
            'tab m10',
            'لينوفو تاب m10',
            'לנובו טאב m10',
        ],

        'Tab M11': [
            'lenovo tab m11',
            'tab m11',
            'لينوفو تاب m11',
            'לנובו טאב m11',
        ],

        'Tab P11': [
            'lenovo tab p11',
            'tab p11',
            'لينوفو تاب p11',
            'לנובו טאב p11',
        ],

        'Tab P12': [
            'lenovo tab p12',
            'tab p12',
            'لينوفو تاب p12',
            'לנובו טאב p12',
        ],
    },

    Honor: {
        Honor50: ['honor 50', 'honour 50', 'اونر 50', 'أونر 50', 'הונור 50'],

        Honor70: ['honor 70', 'honour 70', 'اونر 70', 'أونر 70', 'הונור 70'],

        Honor90: ['honor 90', 'honour 90', 'اونر 90', 'أونر 90', 'הונור 90'],

        Honor200: [
            'honor 200',
            'honour 200',
            'اونر 200',
            'أونر 200',
            'הונור 200',
        ],

        Magic5: [
            'magic 5',
            'honor magic 5',
            'اونر ماجيك 5',
            'ماجيك 5',
            'הונור magic 5',
        ],

        Magic6: [
            'magic 6',
            'honor magic 6',
            'اونر ماجيك 6',
            'ماجيك 6',
            'הונור magic 6',
        ],

        Magic7: [
            'magic 7',
            'honor magic 7',
            'اونر ماجيك 7',
            'ماجيك 7',
            'הונור magic 7',
        ],
    },

    Google: {
        Pixel6: [
            'pixel 6',
            'google pixel 6',
            'جوجل بكسل 6',
            'بيكسل 6',
            'גוגל פיקסל 6',
        ],

        Pixel7: [
            'pixel 7',
            'google pixel 7',
            'جوجل بكسل 7',
            'بيكسل 7',
            'גוגל פיקסל 7',
        ],

        Pixel8: [
            'pixel 8',
            'google pixel 8',
            'جوجل بكسل 8',
            'بيكسل 8',
            'גוגל פיקסל 8',
        ],

        Pixel9: [
            'pixel 9',
            'google pixel 9',
            'جوجل بكسل 9',
            'بيكسل 9',
            'גוגל פיקסל 9',
        ],

        Pixel10: [
            'pixel 10',
            'google pixel 10',
            'جوجل بكسل 10',
            'بيكسل 10',
            'גוגל פיקסל 10',
        ],
    },

    OnePlus: {
        OnePlus9: ['oneplus 9', 'one plus 9', 'وان بلس 9', 'וואן פלוס 9'],

        OnePlus10: ['oneplus 10', 'one plus 10', 'وان بلس 10', 'וואן פלוס 10'],

        OnePlus11: ['oneplus 11', 'one plus 11', 'وان بلس 11', 'וואן פלוס 11'],

        OnePlus12: ['oneplus 12', 'one plus 12', 'وان بلس 12', 'וואן פלוס 12'],

        OnePlus13: ['oneplus 13', 'one plus 13', 'وان بلس 13', 'וואן פלוס 13'],
    },

    Oppo: {
        Reno8: [
            'reno 8',
            'reno8',
            'oppo reno 8',
            'اوبو رينو 8',
            'رينو 8',
            'אופו reno 8',
        ],

        Reno10: [
            'reno 10',
            'reno10',
            'oppo reno 10',
            'اوبو رينو 10',
            'رينو 10',
            'אופו reno 10',
        ],

        Reno12: [
            'reno 12',
            'reno12',
            'oppo reno 12',
            'اوبو رينو 12',
            'رينو 12',
            'אופו reno 12',
        ],

        FindX5: [
            'find x5',
            'findx5',
            'oppo find x5',
            'اوبو فايند x5',
            'אופו find x5',
        ],

        FindX6: [
            'find x6',
            'findx6',
            'oppo find x6',
            'اوبو فايند x6',
            'אופו find x6',
        ],

        FindX7: [
            'find x7',
            'findx7',
            'oppo find x7',
            'اوبو فايند x7',
            'אופו find x7',
        ],
    },

    Vivo: {
        V23: ['vivo v23', 'v23', 'فيفو v23', 'فيفو في 23', 'ויוו v23'],

        V25: ['vivo v25', 'v25', 'فيفو v25', 'ויוו v25'],

        V27: ['vivo v27', 'v27', 'فيفو v27', 'ויוו v27'],

        V29: ['vivo v29', 'v29', 'فيفو v29', 'ויוו v29'],

        V30: ['vivo v30', 'v30', 'فيفو v30', 'ויוו v30'],

        X90: ['vivo x90', 'x90', 'فيفو x90', 'ויוו x90'],

        X100: ['vivo x100', 'x100', 'فيفو x100', 'ויוו x100'],
    },

    Realme: {
        Realme8: ['realme 8', 'realme8', 'ريلمي 8', 'רילמי 8'],

        Realme9: ['realme 9', 'realme9', 'ريلمي 9', 'רילמי 9'],

        Realme10: ['realme 10', 'realme10', 'ريلمي 10', 'רילמי 10'],

        Realme11: ['realme 11', 'realme11', 'ريلمي 11', 'רילמי 11'],

        Realme12: ['realme 12', 'realme12', 'ريلمي 12', 'רילמי 12'],

        Realme13: ['realme 13', 'realme13', 'ريلمي 13', 'רילמי 13'],
    },

    Motorola: {
        MotoG52: [
            'moto g52',
            'motog52',
            'motorola moto g52',
            'موتورولا g52',
            'موتو g52',
            'מוטורולה g52',
        ],

        MotoG53: [
            'moto g53',
            'motog53',
            'motorola moto g53',
            'موتورولا g53',
            'מוטורולה g53',
        ],

        MotoG54: [
            'moto g54',
            'motog54',
            'motorola moto g54',
            'موتورولا g54',
            'מוטורולה g54',
        ],

        MotoG84: [
            'moto g84',
            'motog84',
            'motorola moto g84',
            'موتورولا g84',
            'מוטורולה g84',
        ],

        Edge40: [
            'edge 40',
            'edge40',
            'motorola edge 40',
            'موتورولا edge 40',
            'מוטורולה edge 40',
        ],

        Edge50: [
            'edge 50',
            'edge50',
            'motorola edge 50',
            'موتورولا edge 50',
            'מוטורולה edge 50',
        ],
    },

    Sony: {
        Xperia1: [
            'xperia 1',
            'xperia1',
            'sony xperia 1',
            'سوني اكسبيريا 1',
            'אקספריה 1',
            'סוני xperia 1',
        ],

        Xperia5: [
            'xperia 5',
            'xperia5',
            'sony xperia 5',
            'سوني اكسبيريا 5',
            'אקספריה 5',
            'סוני xperia 5',
        ],

        Xperia10: [
            'xperia 10',
            'xperia10',
            'sony xperia 10',
            'سوني اكسبيريا 10',
            'אקספריה 10',
            'סוני xperia 10',
        ],
    },

    Nokia: {
        G50: ['nokia g50', 'g50', 'نوكيا g50', 'נוקיה g50'],

        G60: ['nokia g60', 'g60', 'نوكيا g60', 'נוקיה g60'],

        X10: ['nokia x10', 'x10', 'نوكيا x10', 'נוקיה x10'],

        X20: ['nokia x20', 'x20', 'نوكيا x20', 'נוקיה x20'],

        C21: ['nokia c21', 'c21', 'نوكيا c21', 'נוקיה c21'],
    },

    Asus: {
        Zenfone9: [
            'zenfone 9',
            'zenfone9',
            'asus zenfone 9',
            'اسوس زينفون 9',
            'אסוס zenfone 9',
        ],

        Zenfone10: [
            'zenfone 10',
            'zenfone10',
            'asus zenfone 10',
            'اسوس زينفون 10',
            'אסוס zenfone 10',
        ],

        ROGPhone6: [
            'rog phone 6',
            'rogphone6',
            'asus rog phone 6',
            'اسوس rog phone 6',
            'אסוס rog phone 6',
        ],

        ROGPhone7: [
            'rog phone 7',
            'rogphone7',
            'asus rog phone 7',
            'اسوس rog phone 7',
            'אסוס rog phone 7',
        ],

        ROGPhone8: [
            'rog phone 8',
            'rogphone8',
            'asus rog phone 8',
            'اسوس rog phone 8',
            'אסוס rog phone 8',
        ],
    },

    Nothing: {
        Phone1: [
            'nothing phone 1',
            'nothing phone1',
            'ناثينج فون 1',
            'נאת׳ינג פון 1',
        ],

        Phone2: [
            'nothing phone 2',
            'nothing phone2',
            'ناثينج فون 2',
            'נאת׳ינג פון 2',
        ],

        Phone2a: [
            'nothing phone 2a',
            'nothing phone2a',
            'ناثينج فون 2a',
            'נאת׳ינג פון 2a',
        ],

        Phone3: [
            'nothing phone 3',
            'nothing phone3',
            'ناثينج فون 3',
            'נאת׳ינג פון 3',
        ],
    },

    TCL: {
        30: ['tcl 30', 'تي سي ال 30', 'tcl 30', 'טי סי אל 30'],

        40: ['tcl 40', 'تي سي ال 40', 'טי סי אל 40'],

        50: ['tcl 50', 'تي سي ال 50', 'טי סי אל 50'],

        60: ['tcl 60', 'تي سي ال 60', 'טי סי אל 60'],
    },

    Tecno: {
        Camon20: [
            'camon 20',
            'camon20',
            'tecno camon 20',
            'تكنو كامون 20',
            'טכנו camon 20',
        ],

        Camon30: [
            'camon 30',
            'camon30',
            'tecno camon 30',
            'تكنو كامون 30',
            'טכנו camon 30',
        ],

        Spark10: [
            'spark 10',
            'spark10',
            'tecno spark 10',
            'تكنو سبارك 10',
            'טכנו spark 10',
        ],

        Spark20: [
            'spark 20',
            'spark20',
            'tecno spark 20',
            'تكنو سبارك 20',
            'טכנו spark 20',
        ],
    },

    Infinix: {
        Note30: [
            'note 30',
            'infinix note 30',
            'انفنكس نوت 30',
            'אינפיניקס note 30',
        ],

        Note40: [
            'note 40',
            'infinix note 40',
            'انفنكس نوت 40',
            'אינפיניקס note 40',
        ],

        Hot30: [
            'hot 30',
            'infinix hot 30',
            'انفنكس هوت 30',
            'אינפיניקס hot 30',
        ],

        Hot40: [
            'hot 40',
            'infinix hot 40',
            'انفنكس هوت 40',
            'אינפיניקס hot 40',
        ],
    },
    Toyota: {
        Corolla: [
            'corolla',
            'تويوتا كورولا',
            'كورولا',
            'טויוטה קורולה',
            'קורולה',
        ],

        Camry: ['camry', 'تويوتا كامري', 'كامري', 'טויוטה קאמרי', 'קאמרי'],

        Yaris: ['yaris', 'تويوتا يارس', 'يارس', 'טויוטה יאריס', 'יאריס'],

        RAV4: [
            'rav4',
            'rav 4',
            'تويوتا راف 4',
            'راف 4',
            'راف4',
            'טויוטה ראב4',
            'ראב4',
        ],

        LandCruiser: [
            'land cruiser',
            'landcruiser',
            'تويوتا لاندكروزر',
            'لاند كروزر',
            'لاندكروزر',
            'טויוטה לנד קרוזר',
            'לנד קרוזר',
        ],

        Hilux: [
            'hilux',
            'تويوتا هايلوكس',
            'هايلوكس',
            'טויוטה היילקס',
            'היילקס',
        ],

        Prius: ['prius', 'تويوتا بريوس', 'بريوس', 'טויוטה פריוס', 'פריוס'],

        'C-HR': [
            'c-hr',
            'chr',
            'c hr',
            'تويوتا c-hr',
            'تويوتا chr',
            'טויוטה c-hr',
        ],

        Avalon: ['avalon', 'تويوتا افالون', 'افالون', 'טויוטה אבלון', 'אבלון'],

        Supra: ['supra', 'تويوتا سوبرا', 'سوبرا', 'טויוטה סופרה', 'סופרה'],

        Fortuner: [
            'fortuner',
            'تويوتا فورتشنر',
            'فورتشنر',
            'טויוטה פורטונר',
            'פורטונר',
        ],

        Venza: ['venza', 'تويوتا فينزا', 'فينزا', 'טויוטה ונזה', 'ונזה'],

        Sequoia: [
            'sequoia',
            'تويوتا سيكويا',
            'سيكويا',
            'טויוטה סקויה',
            'סקויה',
        ],

        Tundra: ['tundra', 'تويوتا تندرا', 'تندرا', 'טויוטה טונדרה', 'טונדרה'],

        Tacoma: ['tacoma', 'تويوتا تاكوما', 'تاكوما', 'טויוטה טקומה', 'טקומה'],
    },
    Hyundai: {
        Elantra: [
            'elantra',
            'hyundai elantra',
            'هيونداي النترا',
            'النترا',
            'יונדאי אלנטרה',
            'אלנטרה',
        ],

        Sonata: [
            'sonata',
            'hyundai sonata',
            'هيونداي سوناتا',
            'سوناتا',
            'יונדאי סונטה',
            'סונטה',
        ],

        Tucson: [
            'tucson',
            'hyundai tucson',
            'هيونداي توسان',
            'توسان',
            'יונדאי טוסון',
            'טוסון',
        ],

        SantaFe: [
            'santa fe',
            'santafe',
            'hyundai santa fe',
            'هيونداي سنتافي',
            'سنتافي',
            'יונדאי סנטה פה',
            'סנטה פה',
        ],

        Kona: [
            'kona',
            'hyundai kona',
            'هيونداي كونا',
            'كونا',
            'יונדאי קונה',
            'קונה',
        ],

        i10: ['i10', 'hyundai i10', 'هيونداي i10', 'יונדאי i10'],

        i20: ['i20', 'hyundai i20', 'هيونداي i20', 'יונדאי i20'],

        i30: ['i30', 'hyundai i30', 'هيونداي i30', 'יונדאי i30'],

        Palisade: [
            'palisade',
            'hyundai palisade',
            'هيونداي باليسايد',
            'باليسايد',
            'יונדאי פליסייד',
            'פליסייד',
        ],
    },

    Kia: {
        Picanto: [
            'picanto',
            'kia picanto',
            'كيا بيكانتو',
            'بيكانتو',
            'קיה פיקנטו',
            'פיקנטו',
        ],

        Rio: ['rio', 'kia rio', 'كيا ريو', 'ريو', 'קיה ריו', 'ריו'],

        Cerato: [
            'cerato',
            'kia cerato',
            'كيا سيراتو',
            'سيراتو',
            'קיה סראטו',
            'סראטו',
        ],

        Forte: [
            'forte',
            'kia forte',
            'كيا فورتي',
            'فورتي',
            'קיה פורטה',
            'פורטה',
        ],

        Sportage: [
            'sportage',
            'kia sportage',
            'كيا سبورتاج',
            'سبورتاج',
            'קיה ספורטאז׳',
            'ספורטאז׳',
        ],

        Sorento: [
            'sorento',
            'kia sorento',
            'كيا سورينتو',
            'سورينتو',
            'קיה סורנטו',
            'סורנטו',
        ],

        Seltos: [
            'seltos',
            'kia seltos',
            'كيا سيلتوس',
            'سيلتوس',
            'קיה סלטוס',
            'סלטוס',
        ],

        Telluride: [
            'telluride',
            'kia telluride',
            'كيا تيلورايد',
            'تيلورايد',
            'קיה טלורייד',
            'טלורייד',
        ],
    },

    Mercedes: {
        'A-Class': [
            'a class',
            'a-class',
            'mercedes a class',
            'مرسيدس a class',
            'مرسيدس a كلاس',
            'מרצדס a קלאס',
        ],

        'C-Class': [
            'c class',
            'c-class',
            'mercedes c class',
            'مرسيدس c class',
            'مرسيدس c كلاس',
            'מרצדס c קלאס',
        ],

        'E-Class': [
            'e class',
            'e-class',
            'mercedes e class',
            'مرسيدس e class',
            'مرسيدس e كلاس',
            'מרצדס e קלאס',
        ],

        'S-Class': [
            's class',
            's-class',
            'mercedes s class',
            'مرسيدس s class',
            'مرسيدس s كلاس',
            'מרצדס s קלאס',
        ],

        GLA: [
            'gla',
            'mercedes gla',
            'مرسيدس gla',
            'مرسيدس جي ال اي',
            'מרצדס gla',
        ],

        GLB: ['glb', 'mercedes glb', 'مرسيدس glb', 'מרצדס glb'],

        GLC: ['glc', 'mercedes glc', 'مرسيدس glc', 'מרצדס glc'],

        GLE: ['gle', 'mercedes gle', 'مرسيدس gle', 'מרצדס gle'],

        GLS: ['gls', 'mercedes gls', 'مرسيدس gls', 'מרצדס gls'],
    },

    BMW: {
        '1 Series': [
            '1 series',
            '1-series',
            'bmw 1 series',
            'بي ام دبليو 1',
            'بي ام دبليو الفئة الاولى',
            'במוו סדרה 1',
        ],

        '3 Series': [
            '3 series',
            '3-series',
            'bmw 3 series',
            'بي ام دبليو 3',
            'بي ام دبليو الفئة الثالثة',
            'במוו סדרה 3',
        ],

        '5 Series': [
            '5 series',
            '5-series',
            'bmw 5 series',
            'بي ام دبليو 5',
            'بي ام دبليو الفئة الخامسة',
            'במוו סדרה 5',
        ],

        '7 Series': [
            '7 series',
            '7-series',
            'bmw 7 series',
            'بي ام دبليو 7',
            'במוו סדרה 7',
        ],

        X1: ['x1', 'bmw x1', 'بي ام دبليو x1', 'במוו x1'],

        X3: ['x3', 'bmw x3', 'بي ام دبليو x3', 'במוו x3'],

        X5: ['x5', 'bmw x5', 'بي ام دبليو x5', 'במוו x5'],

        X6: ['x6', 'bmw x6', 'بي ام دبليو x6', 'במוו x6'],
    },

    Audi: {
        A3: ['a3', 'audi a3', 'أودي a3', 'אאודי a3'],

        A4: ['a4', 'audi a4', 'أودي a4', 'אאודי a4'],

        A6: ['a6', 'audi a6', 'أودي a6', 'אאודי a6'],

        A8: ['a8', 'audi a8', 'أودي a8', 'אאודי a8'],

        Q3: ['q3', 'audi q3', 'أودي q3', 'אאודי q3'],

        Q5: ['q5', 'audi q5', 'أودي q5', 'אאודי q5'],

        Q7: ['q7', 'audi q7', 'أودي q7', 'אאודי q7'],

        Q8: ['q8', 'audi q8', 'أودي q8', 'אאודי q8'],
    },

    Volkswagen: {
        Golf: [
            'golf',
            'volkswagen golf',
            'vw golf',
            'فولكس واجن جولف',
            'جولف',
            'פולקסווגן גולף',
            'גולף',
        ],

        Polo: [
            'polo',
            'volkswagen polo',
            'vw polo',
            'فولكس واجن بولو',
            'بولو',
            'פולקסווגן פולו',
            'פולו',
        ],

        Passat: [
            'passat',
            'volkswagen passat',
            'vw passat',
            'فولكس واجن باسات',
            'باسات',
            'פולקסווגן פאסאט',
            'פאסאט',
        ],

        Tiguan: [
            'tiguan',
            'volkswagen tiguan',
            'vw tiguan',
            'فولكس واجن تيغوان',
            'تيغوان',
            'פולקסווגן טיגואן',
            'טיגואן',
        ],

        'T-Roc': [
            't-roc',
            't roc',
            'troc',
            'volkswagen t-roc',
            'فولكس واجن t-roc',
            'تي روك',
            'פולקסווגן טי רוק',
        ],

        Touareg: [
            'touareg',
            'volkswagen touareg',
            'vw touareg',
            'فولكس واجن طوارق',
            'طوارق',
            'פולקסווגן טוארג',
            'טוארג',
        ],
    },

    Ford: {
        Fiesta: [
            'fiesta',
            'ford fiesta',
            'فورد فييستا',
            'فييستا',
            'פורד פיאסטה',
            'פיאסטה',
        ],

        Focus: [
            'focus',
            'ford focus',
            'فورد فوكس',
            'فوكس',
            'פורד פוקוס',
            'פוקוס',
        ],

        Fusion: [
            'fusion',
            'ford fusion',
            'فورد فيوجن',
            'فيوجن',
            'פורד פיוז׳ן',
            'פיוז׳ן',
        ],

        Mustang: [
            'mustang',
            'ford mustang',
            'فورد موستانج',
            'موستانج',
            'פורד מוסטנג',
            'מוסטנג',
        ],

        Explorer: [
            'explorer',
            'ford explorer',
            'فورد اكسبلورر',
            'اكسبلورر',
            'פורד אקספלורר',
            'אקספלורר',
        ],

        Ranger: [
            'ranger',
            'ford ranger',
            'فورد رينجر',
            'رينجر',
            'פורד ריינג׳ר',
            'ריינג׳ר',
        ],

        Bronco: [
            'bronco',
            'ford bronco',
            'فورد برونكو',
            'برونكو',
            'פורד ברונקו',
            'ברונקו',
        ],
    },

    Nissan: {
        Micra: [
            'micra',
            'nissan micra',
            'نيسان ميكرا',
            'ميكرا',
            'ניסאן מיקרה',
            'מיקרה',
        ],

        Sunny: [
            'sunny',
            'nissan sunny',
            'نيسان صني',
            'صني',
            'ניסאן סאני',
            'סאני',
        ],

        Altima: [
            'altima',
            'nissan altima',
            'نيسان ألتيما',
            'التيما',
            'ניסאן אלטימה',
            'אלטימה',
        ],

        Sentra: [
            'sentra',
            'nissan sentra',
            'نيسان سنترا',
            'سنترا',
            'ניסאן סנטרה',
            'סנטרה',
        ],

        Qashqai: [
            'qashqai',
            'nissan qashqai',
            'نيسان قشقاي',
            'قشقاي',
            'ניסאן קשקאי',
            'קשקאי',
        ],

        XTrail: [
            'x-trail',
            'x trail',
            'xtrail',
            'nissan x-trail',
            'نيسان اكس تريل',
            'اكس تريل',
            'ניסאן אקס טרייל',
            'אקס טרייל',
        ],

        Patrol: [
            'patrol',
            'nissan patrol',
            'نيسان باترول',
            'باترول',
            'ניסאן פטרול',
            'פטרול',
        ],
    },
    Honda: {
        Civic: [
            'civic',
            'honda civic',
            'هوندا سيفيك',
            'سيفيك',
            'הונדה סיוויק',
            'סיוויק',
        ],

        Accord: [
            'accord',
            'honda accord',
            'هوندا أكورد',
            'أكورد',
            'הונדה אקורד',
            'אקורד',
        ],

        City: [
            'city',
            'honda city',
            'هوندا سيتي',
            'سيتي',
            'הונדה סיטי',
            'סיטי',
        ],

        CRV: [
            'cr-v',
            'crv',
            'cr v',
            'honda cr-v',
            'هوندا cr-v',
            'هوندا crv',
            'سي ار في',
            'הונדה cr-v',
            'cr-v',
        ],

        HRV: [
            'hr-v',
            'hrv',
            'hr v',
            'honda hr-v',
            'هوندا hr-v',
            'هوندا hrv',
            'اتش ار في',
            'הונדה hr-v',
        ],

        Pilot: [
            'pilot',
            'honda pilot',
            'هوندا بايلوت',
            'بايلوت',
            'הונדה פיילוט',
            'פיילוט',
        ],

        Odyssey: [
            'odyssey',
            'honda odyssey',
            'هوندا أوديسي',
            'أوديسي',
            'הונדה אודיסיי',
            'אודיסיי',
        ],

        Jazz: ['jazz', 'honda jazz', 'هوندا جاز', 'جاز', 'הונדה ג׳אז', 'ג׳אז'],
    },

    Mazda: {
        Mazda2: ['mazda 2', 'mazda2', '2', 'مازدا 2', 'مازدا2', 'מאזדה 2'],

        Mazda3: ['mazda 3', 'mazda3', '3', 'مازدا 3', 'مازدا3', 'מאזדה 3'],

        Mazda6: ['mazda 6', 'mazda6', '6', 'مازدا 6', 'מאזדה 6'],

        CX3: [
            'cx-3',
            'cx3',
            'cx 3',
            'mazda cx-3',
            'مازدا cx-3',
            'مازدا cx3',
            'מאזדה cx-3',
        ],

        CX30: [
            'cx-30',
            'cx30',
            'cx 30',
            'mazda cx-30',
            'مازدا cx-30',
            'מאזדה cx-30',
        ],

        CX5: [
            'cx-5',
            'cx5',
            'cx 5',
            'mazda cx-5',
            'مازدا cx-5',
            'مازدا cx5',
            'מאזדה cx-5',
        ],

        CX60: [
            'cx-60',
            'cx60',
            'cx 60',
            'mazda cx-60',
            'مازدا cx-60',
            'מאזדה cx-60',
        ],

        CX90: [
            'cx-90',
            'cx90',
            'cx 90',
            'mazda cx-90',
            'مازدا cx-90',
            'מאזדה cx-90',
        ],
    },

    Mitsubishi: {
        Lancer: [
            'lancer',
            'mitsubishi lancer',
            'ميتسوبيشي لانسر',
            'لانسر',
            'מיצובישי לנסר',
            'לנסר',
        ],

        Outlander: [
            'outlander',
            'mitsubishi outlander',
            'ميتسوبيشي أوتلاندر',
            'اوتلاندر',
            'מיצובישי אאוטלנדר',
            'אאוטלנדר',
        ],

        ASX: [
            'asx',
            'mitsubishi asx',
            'ميتسوبيشي asx',
            'ميتسوبيشي اي اس اكس',
            'מיצובישי asx',
        ],

        EclipseCross: [
            'eclipse cross',
            'eclipse-cross',
            'mitsubishi eclipse cross',
            'ميتسوبيشي إكليبس كروس',
            'إكليبس كروس',
            'מיצובישי אקליפס קרוס',
            'אקליפס קרוס',
        ],

        Pajero: [
            'pajero',
            'mitsubishi pajero',
            'ميتسوبيشي باجيرو',
            'باجيرو',
            'מיצובישי פאג׳רו',
            'פאג׳רו',
        ],

        Triton: [
            'triton',
            'mitsubishi triton',
            'ميتسوبيشي تريتون',
            'تريتون',
            'מיצובישי טרייטון',
            'טרייטון',
        ],
    },

    Subaru: {
        Impreza: [
            'impreza',
            'subaru impreza',
            'سوبارو إمبريزا',
            'إمبريزا',
            'סובארו אימפרזה',
            'אימפרזה',
        ],

        Legacy: [
            'legacy',
            'subaru legacy',
            'سوبارو ليجاسي',
            'ليجاسي',
            'סובארו לגאסי',
            'לגאסי',
        ],

        Forester: [
            'forester',
            'subaru forester',
            'سوبارو فورستر',
            'فورستر',
            'סובארו פורסטר',
            'פורסטר',
        ],

        Outback: [
            'outback',
            'subaru outback',
            'سوبارو أوتباك',
            'اوتباك',
            'סובארו אאוטבק',
            'אאוטבק',
        ],

        Crosstrek: [
            'crosstrek',
            'subaru crosstrek',
            'سوبارو كروستريك',
            'كروستريك',
            'סובארו קרוסטרק',
            'קרוסטרק',
        ],

        BRZ: ['brz', 'subaru brz', 'سوبارو brz', 'סובארו brz'],
    },

    Lexus: {
        IS: ['is', 'lexus is', 'لكزس is', 'לקסוס is'],

        ES: ['es', 'lexus es', 'لكزس es', 'לקסוס es'],

        LS: ['ls', 'lexus ls', 'لكزس ls', 'לקסוס ls'],

        UX: ['ux', 'lexus ux', 'لكزس ux', 'לקסוס ux'],

        NX: ['nx', 'lexus nx', 'لكزس nx', 'לקסוס nx'],

        RX: ['rx', 'lexus rx', 'لكزس rx', 'לקסוס rx'],

        GX: ['gx', 'lexus gx', 'لكزس gx', 'לקסוס gx'],

        LX: ['lx', 'lexus lx', 'لكزس lx', 'לקסוס lx'],
    },

    Volvo: {
        S60: ['s60', 'volvo s60', 'فولفو s60', 'וולוו s60'],

        S90: ['s90', 'volvo s90', 'فولفو s90', 'וולוו s90'],

        XC40: ['xc40', 'volvo xc40', 'فولفو xc40', 'וולוו xc40'],

        XC60: ['xc60', 'volvo xc60', 'فولفو xc60', 'וולוו xc60'],

        XC90: ['xc90', 'volvo xc90', 'فولفو xc90', 'וולוו xc90'],

        V40: ['v40', 'volvo v40', 'فولفو v40', 'וולוו v40'],

        V60: ['v60', 'volvo v60', 'فولفو v60', 'וולוו v60'],

        V90: ['v90', 'volvo v90', 'فولفو v90', 'וולוו v90'],
    },

    Tesla: {
        Model3: [
            'model 3',
            'model3',
            'tesla model 3',
            'تسلا موديل 3',
            'موديل 3',
            'טסלה מודל 3',
            'מודל 3',
        ],

        ModelY: [
            'model y',
            'modely',
            'tesla model y',
            'تسلا موديل y',
            'موديل y',
            'טסלה מודל y',
            'מודל y',
        ],

        ModelS: [
            'model s',
            'models',
            'tesla model s',
            'تسلا موديل s',
            'موديل s',
            'טסלה מודל s',
            'מודל s',
        ],

        ModelX: [
            'model x',
            'modelx',
            'tesla model x',
            'تسلا موديل x',
            'موديل x',
            'טסלה מודל x',
            'מודל x',
        ],

        Cybertruck: [
            'cybertruck',
            'cyber truck',
            'tesla cybertruck',
            'تسلا سايبرتراك',
            'سايبرتراك',
            'טסלה סייברטראק',
            'סייברטראק',
        ],
    },

    BYD: {
        Atto3: [
            'atto 3',
            'atto3',
            'byd atto 3',
            'بي واي دي اتو 3',
            'atto 3',
            'byd atto 3',
            'אטו 3',
        ],

        Dolphin: [
            'dolphin',
            'byd dolphin',
            'بي واي دي دولفين',
            'دولفين',
            'byd דולפין',
            'דולפין',
        ],

        Seal: ['seal', 'byd seal', 'بي واي دي سيل', 'سيل', 'byd seal', 'סיל'],

        Han: ['han', 'byd han', 'بي واي دي هان', 'هان', 'byd han', 'האן'],

        Tang: [
            'tang',
            'byd tang',
            'بي واي دي تانغ',
            'تانغ',
            'byd tang',
            'טאנג',
        ],

        Song: [
            'song',
            'byd song',
            'بي واي دي سونغ',
            'سونغ',
            'byd song',
            'סונג',
        ],

        Atto2: ['atto 2', 'atto2', 'byd atto 2', 'بي واي دي اتو 2', 'אטו 2'],
    },

    Geely: {
        Coolray: [
            'coolray',
            'geely coolray',
            'جيلي كولراي',
            'كولراي',
            'ג׳ילי קולראי',
            'קולראי',
        ],

        GeometryC: [
            'geometry c',
            'geometryc',
            'geely geometry c',
            'جيلي جيومتري c',
            'جيومتري c',
            'ג׳ילי ג׳אומטרי c',
            'ג׳אומטרי c',
        ],

        Emgrand: [
            'emgrand',
            'geely emgrand',
            'جيلي إمجراند',
            'إمجراند',
            'ג׳ילי אמגרנד',
            'אמגרנד',
        ],

        Starray: [
            'starray',
            'geely starray',
            'جيلي ستارراي',
            'ستارراي',
            'ג׳ילי סטאריי',
            'סטאריי',
        ],

        Atlas: [
            'atlas',
            'geely atlas',
            'جيلي أطلس',
            'أطلس',
            'ג׳ילי אטלס',
            'אטלס',
        ],
    },

    Chery: {
        Tiggo2: [
            'tiggo 2',
            'tiggo2',
            'chery tiggo 2',
            'شيري تيجو 2',
            'تيجو 2',
            'צ׳רי טיגו 2',
            'טיגו 2',
        ],

        Tiggo4: [
            'tiggo 4',
            'tiggo4',
            'chery tiggo 4',
            'شيري تيجو 4',
            'تيجو 4',
            'צ׳רי טיגו 4',
            'טיגו 4',
        ],

        Tiggo7: [
            'tiggo 7',
            'tiggo7',
            'chery tiggo 7',
            'شيري تيجو 7',
            'تيجو 7',
            'צ׳רי טיגו 7',
            'טיגו 7',
        ],

        Tiggo8: [
            'tiggo 8',
            'tiggo8',
            'chery tiggo 8',
            'شيري تيجو 8',
            'تيجو 8',
            'צ׳רי טיגו 8',
            'טיגו 8',
        ],

        Arrizo5: [
            'arrizo 5',
            'arrizo5',
            'chery arrizo 5',
            'شيري أريزو 5',
            'اريزو 5',
            'צ׳רי אריזו 5',
            'אריזו 5',
        ],
    },

    MG: {
        MG3: ['mg3', 'mg 3', 'mg3 car', 'ام جي 3', 'إم جي 3', 'אם ג׳י 3'],

        MG4: ['mg4', 'mg 4', 'mg4 electric', 'ام جي 4', 'إم جي 4', 'אם ג׳י 4'],

        MG5: ['mg5', 'mg 5', 'ام جي 5', 'إم جي 5', 'אם ג׳י 5'],

        ZS: ['zs', 'mg zs', 'ام جي zs', 'إم جي zs', 'אם ג׳י zs'],

        ZST: ['zst', 'mg zst', 'ام جي zst', 'إم جي zst', 'אם ג׳י zst'],

        HS: ['hs', 'mg hs', 'ام جي hs', 'إم جي hs', 'אם ג׳י hs'],

        MarvelR: [
            'marvel r',
            'marvelr',
            'mg marvel r',
            'ام جي مارفل r',
            'مارفل r',
            'אם ג׳י מארוול r',
        ],
    },

    Jeep: {
        Renegade: [
            'renegade',
            'jeep renegade',
            'جيب رينيجيد',
            'رينيجيد',
            'ג׳יפ רנגייד',
            'רנגייד',
        ],

        Compass: [
            'compass',
            'jeep compass',
            'جيب كومباس',
            'كومباس',
            'ג׳יפ קומפס',
            'קומפס',
        ],

        Cherokee: [
            'cherokee',
            'jeep cherokee',
            'جيب شيروكي',
            'شيروكي',
            'ג׳יפ צ׳ירוקי',
            'צ׳ירוקי',
        ],

        GrandCherokee: [
            'grand cherokee',
            'grand-cherokee',
            'jeep grand cherokee',
            'جيب جراند شيروكي',
            'جراند شيروكي',
            'ג׳יפ גרנד צ׳ירוקי',
            'גרנד צ׳ירוקי',
        ],

        Wrangler: [
            'wrangler',
            'jeep wrangler',
            'جيب رانجلر',
            'رانجلر',
            'ג׳יפ רנגלר',
            'רנגלר',
        ],

        Gladiator: [
            'gladiator',
            'jeep gladiator',
            'جيب جلادياتور',
            'جلادياتور',
            'ג׳יפ גלדיאטור',
            'גלדיאטור',
        ],

        Avenger: [
            'avenger',
            'jeep avenger',
            'جيب أفينجر',
            'افينجر',
            'ג׳יפ אוונג׳ר',
            'אוונג׳ר',
        ],
    },

    Porsche: {
        911: ['911', 'porsche 911', 'بورش 911', 'פורשה 911'],

        Cayenne: [
            'cayenne',
            'porsche cayenne',
            'بورش كايين',
            'كايين',
            'פורשה קאיין',
            'קאיין',
        ],

        Macan: [
            'macan',
            'porsche macan',
            'بورش ماكان',
            'ماكان',
            'פורשה מקאן',
            'מקאן',
        ],

        Panamera: [
            'panamera',
            'porsche panamera',
            'بورش باناميرا',
            'باناميرا',
            'פורשה פנמרה',
            'פנמרה',
        ],

        Taycan: [
            'taycan',
            'porsche taycan',
            'بورش تايكان',
            'تايكان',
            'פורשה טייקאן',
            'טייקאן',
        ],

        '718': ['718', 'porsche 718', 'بورش 718', 'פורשה 718'],
    },

    Peugeot: {
        208: ['208', 'peugeot 208', 'بيجو 208', 'פיג׳ו 208'],

        308: ['308', 'peugeot 308', 'بيجو 308', 'פיג׳ו 308'],

        3008: ['3008', 'peugeot 3008', 'بيجو 3008', 'פיג׳ו 3008'],

        5008: ['5008', 'peugeot 5008', 'بيجو 5008', 'פיג׳ו 5008'],

        2008: ['2008', 'peugeot 2008', 'بيجو 2008', 'פיג׳ו 2008'],

        508: ['508', 'peugeot 508', 'بيجو 508', 'פיג׳ו 508'],

        Partner: [
            'partner',
            'peugeot partner',
            'بيجو بارتنر',
            'بارتنر',
            'פיג׳ו פרטנר',
            'פרטנר',
        ],
    },

    Renault: {
        Clio: [
            'clio',
            'renault clio',
            'رينو كليو',
            'كليو',
            'רנו קליאו',
            'קליאו',
        ],

        Megane: [
            'megane',
            'renault megane',
            'رينو ميجان',
            'ميجان',
            'רנו מגאן',
            'מגאן',
        ],

        Captur: [
            'captur',
            'renault captur',
            'رينو كابتور',
            'كابتور',
            'רנו קפצ׳ור',
            'קפצ׳ור',
        ],

        Kadjar: [
            'kadjar',
            'renault kadjar',
            'رينو كادجار',
            'كادجار',
            'רנו קדג׳אר',
            'קדג׳אר',
        ],

        Koleos: [
            'koleos',
            'renault koleos',
            'رينو كوليوس',
            'كوليوس',
            'רנו קולאוס',
            'קולאוס',
        ],

        Arkana: [
            'arkana',
            'renault arkana',
            'رينو أركانا',
            'أركانا',
            'רנו ארקנה',
            'ארקנה',
        ],

        Austral: [
            'austral',
            'renault austral',
            'رينو أوسترال',
            'اوسترال',
            'רנו אוסטרל',
            'אוסטרל',
        ],
    },

    Fiat: {
        500: ['500', 'fiat 500', 'فيات 500', 'פיאט 500'],

        Panda: [
            'panda',
            'fiat panda',
            'فيات باندا',
            'باندا',
            'פיאט פנדה',
            'פנדה',
        ],

        Tipo: ['tipo', 'fiat tipo', 'فيات تيبو', 'تيبو', 'פיאט טיפו', 'טיפו'],

        Punto: [
            'punto',
            'fiat punto',
            'فيات بونتو',
            'بونتو',
            'פיאט פונטו',
            'פונטו',
        ],

        Doblo: [
            'doblo',
            'fiat doblo',
            'فيات دوبلو',
            'دوبلو',
            'פיאט דובלו',
            'דובלו',
        ],

        Ducato: [
            'ducato',
            'fiat ducato',
            'فيات دوكاتو',
            'دوكاتو',
            'פיאט דוקטו',
            'דוקטו',
        ],
    },

    Opel: {
        Corsa: [
            'corsa',
            'opel corsa',
            'أوبل كورسا',
            'كورسا',
            'אופל קורסה',
            'קורסה',
        ],

        Astra: [
            'astra',
            'opel astra',
            'أوبل أسترا',
            'استرا',
            'אופל אסטרה',
            'אסטרה',
        ],

        Insignia: [
            'insignia',
            'opel insignia',
            'أوبل إنسيجنيا',
            'إنسيجنيا',
            'אופל אינסיגניה',
            'אינסיגניה',
        ],

        Mokka: [
            'mokka',
            'opel mokka',
            'أوبل موكا',
            'موكا',
            'אופל מוקה',
            'מוקה',
        ],

        Crossland: [
            'crossland',
            'opel crossland',
            'أوبل كروسلاند',
            'كروسلاند',
            'אופל קרוסלנד',
            'קרוסלנד',
        ],

        Grandland: [
            'grandland',
            'opel grandland',
            'أوبل جراندلاند',
            'جراندلاند',
            'אופל גרנדלנד',
            'גרנדלנד',
        ],
    },

    Skoda: {
        Fabia: [
            'fabia',
            'skoda fabia',
            'سكودا فابيا',
            'فابيا',
            'סקודה פאביה',
            'פאביה',
        ],

        Octavia: [
            'octavia',
            'skoda octavia',
            'سكودا اوكتافيا',
            'اوكتافيا',
            'סקודה אוקטביה',
            'אוקטביה',
        ],

        Superb: [
            'superb',
            'skoda superb',
            'سكودا سوبيرب',
            'سوبيرب',
            'סקודה סופרב',
            'סופרב',
        ],

        Karoq: [
            'karoq',
            'skoda karoq',
            'سكودا كاروك',
            'كاروك',
            'סקודה קארוק',
            'קארוק',
        ],

        Kodiaq: [
            'kodiaq',
            'skoda kodiaq',
            'سكودا كودياك',
            'كودياك',
            'סקודה קודיאק',
            'קודיאק',
        ],

        Kamiq: [
            'kamiq',
            'skoda kamiq',
            'سكودا كاميك',
            'كاميك',
            'סקודה קאמיק',
            'קאמיק',
        ],

        Scala: [
            'scala',
            'skoda scala',
            'سكودا سكالا',
            'سكالا',
            'סקודה סקאלה',
            'סקאלה',
        ],
    },

    Seat: {
        Ibiza: [
            'ibiza',
            'seat ibiza',
            'سيات إيبيزا',
            'إيبيزا',
            'סיאט איביזה',
            'איביזה',
        ],

        Leon: ['leon', 'seat leon', 'سيات ليون', 'ليون', 'סיאט לאון', 'לאון'],

        Arona: [
            'arona',
            'seat arona',
            'سيات أرونا',
            'ارونا',
            'סיאט ארונה',
            'ארונה',
        ],

        Ateca: [
            'ateca',
            'seat ateca',
            'سيات أتيكا',
            'اتيكا',
            'סיאט אטקה',
            'אטקה',
        ],

        Tarraco: [
            'tarraco',
            'seat tarraco',
            'سيات تاركو',
            'تاركو',
            'סיאט טראקו',
            'טראקו',
        ],
    },

    LandRover: {
        Defender: [
            'defender',
            'land rover defender',
            'landrover defender',
            'لاند روفر ديفندر',
            'ديفندر',
            'לנד רובר דיפנדר',
            'דיפנדר',
        ],

        Discovery: [
            'discovery',
            'land rover discovery',
            'لاند روفر ديسكفري',
            'ديسكفري',
            'לנד רובר דיסקברי',
            'דיסקברי',
        ],

        DiscoverySport: [
            'discovery sport',
            'discovery-sport',
            'land rover discovery sport',
            'لاند روفر ديسكفري سبورت',
            'ديسكفري سبورت',
            'לנד רובר דיסקברי ספורט',
        ],

        RangeRover: [
            'range rover',
            'rangerover',
            'land rover range rover',
            'لاند روفر رينج روفر',
            'رينج روفر',
            'לנד רובר ריינג׳ רובר',
            'ריינג׳ רובר',
        ],

        RangeRoverSport: [
            'range rover sport',
            'range-rover-sport',
            'لاند روفر رينج روفر سبورت',
            'رينج روفر سبورت',
            'לנד רובר ריינג׳ רובר ספורט',
        ],

        RangeRoverEvoque: [
            'range rover evoque',
            'range-rover-evoque',
            'evoque',
            'لاند روفر إيفوك',
            'رينج روفر إيفوك',
            'לנד רובר איווק',
            'איווק',
        ],

        Velar: [
            'velar',
            'range rover velar',
            'land rover velar',
            'لاند روفر فيلار',
            'فيلار',
            'לנד רובר ולאר',
            'ולאר',
        ],
    },

    Jaguar: {
        XE: ['xe', 'jaguar xe', 'جاكوار xe', 'جاكوار إكس إي', 'יגואר xe'],

        XF: ['xf', 'jaguar xf', 'جاكوار xf', 'יגואר xf'],

        FType: [
            'f-type',
            'ftype',
            'jaguar f-type',
            'جاكوار f-type',
            'جاكوار اف تايب',
            'יגואר f-type',
        ],

        'E-Pace': [
            'e-pace',
            'epace',
            'jaguar e-pace',
            'جاكوار e-pace',
            'יגואר e-pace',
        ],

        'F-Pace': [
            'f-pace',
            'fpace',
            'jaguar f-pace',
            'جاكوار f-pace',
            'יגואר f-pace',
        ],

        'I-Pace': [
            'i-pace',
            'ipace',
            'jaguar i-pace',
            'جاكوار i-pace',
            'יגואר i-pace',
        ],
    },

    Chevrolet: {
        Spark: [
            'spark',
            'chevrolet spark',
            'شيفروليه سبارك',
            'سبارك',
            'שברולט ספארק',
            'ספארק',
        ],

        Cruze: [
            'cruze',
            'chevrolet cruze',
            'شيفروليه كروز',
            'كروز',
            'שברולט קרוז',
            'קרוז',
        ],

        Malibu: [
            'malibu',
            'chevrolet malibu',
            'شيفروليه ماليبو',
            'ماليبو',
            'שברולט מאליבו',
            'מאליבו',
        ],

        Equinox: [
            'equinox',
            'chevrolet equinox',
            'شيفروليه إكوينوكس',
            'إكوينوكس',
            'שברולט אקווינוקס',
            'אקווינוקס',
        ],

        Tahoe: [
            'tahoe',
            'chevrolet tahoe',
            'شيفروليه تاهو',
            'تاهو',
            'שברולט טאהו',
            'טאהו',
        ],

        Suburban: [
            'suburban',
            'chevrolet suburban',
            'شيفروليه سوبربان',
            'سوبربان',
            'שברולט סברבן',
            'סברבן',
        ],

        Traverse: [
            'traverse',
            'chevrolet traverse',
            'شيفروليه ترافيرس',
            'ترافيرس',
            'שברולט טראוורס',
            'טראוורס',
        ],

        Camaro: [
            'camaro',
            'chevrolet camaro',
            'شيفروليه كامارو',
            'كامارو',
            'שברולט קמארו',
            'קמארו',
        ],

        Corvette: [
            'corvette',
            'chevrolet corvette',
            'شيفروليه كورفيت',
            'كورفيت',
            'שברולט קורבט',
            'קורבט',
        ],
    },

    Dodge: {
        Charger: [
            'charger',
            'dodge charger',
            'دودج تشارجر',
            'تشارجر',
            'דודג׳ צ׳ארג׳ר',
            'צ׳ארג׳ר',
        ],

        Challenger: [
            'challenger',
            'dodge challenger',
            'دودج تشالنجر',
            'تشالنجر',
            'דודג׳ צ׳לנג׳ר',
            'צ׳לנג׳ר',
        ],

        Durango: [
            'durango',
            'dodge durango',
            'دودج دورانجو',
            'دورانجو',
            'דודג׳ דוראנגו',
            'דוראנגו',
        ],

        Journey: [
            'journey',
            'dodge journey',
            'دودج جورني',
            'جورني',
            'דודג׳ ג׳רני',
            'ג׳רני',
        ],

        Ram: ['ram', 'dodge ram', 'دودج رام', 'رام', 'דודג׳ ראם', 'ראם'],
    },

    Cadillac: {
        CT4: ['ct4', 'cadillac ct4', 'كاديلاك ct4', 'קדילאק ct4'],

        CT5: ['ct5', 'cadillac ct5', 'كاديلاك ct5', 'קדילאק ct5'],

        CT6: ['ct6', 'cadillac ct6', 'كاديلاك ct6', 'קדילאק ct6'],

        XT4: ['xt4', 'cadillac xt4', 'كاديلاك xt4', 'קדילאק xt4'],

        XT5: ['xt5', 'cadillac xt5', 'كاديلاك xt5', 'קדילאק xt5'],

        XT6: ['xt6', 'cadillac xt6', 'كاديلاك xt6', 'קדילאק xt6'],

        Escalade: [
            'escalade',
            'cadillac escalade',
            'كاديلاك إسكاليد',
            'اسكاليد',
            'קדילאק אסקלייד',
            'אסקלייד',
        ],
    },

    Genesis: {
        G70: ['g70', 'genesis g70', 'جينيسيس g70', 'ג׳נסיס g70'],

        G80: ['g80', 'genesis g80', 'جينيسيس g80', 'ג׳נסיס g80'],

        G90: ['g90', 'genesis g90', 'جينيسيس g90', 'ג׳נסיס g90'],

        GV60: ['gv60', 'genesis gv60', 'جينيسيس gv60', 'ג׳נסיס gv60'],

        GV70: ['gv70', 'genesis gv70', 'جينيسيس gv70', 'ג׳נסיס gv70'],

        GV80: ['gv80', 'genesis gv80', 'جينيسيس gv80', 'ג׳נסיס gv80'],
    },
};

module.exports = {
    MODEL_ALIASES,
};
