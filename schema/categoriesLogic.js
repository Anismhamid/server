const Joi = require('joi');

const publicUserSchema = Joi.object({
    name: Joi.object({
        first: Joi.string(),
        last: Joi.string(),
    }),
    slug: Joi.string(),
    image: Joi.object({
        url: Joi.string().uri().allow(''),
        publicId: Joi.string().allow(''),
    }).default({}),
});

const CATEGORIES = {
    House: 'House',
    Garden: 'Garden',
    Electronics: 'Electronics',
    Cars: 'Cars',
    Motorcycles: 'Motorcycles',
    Bikes: 'Bikes',
    Trucks: 'Trucks',
    ElectricVehicles: 'ElectricVehicles',
    MenClothes: 'MenClothes',
    WomenClothes: 'WomenClothes',
    WomenBags: 'WomenBags',
    Baby: 'Baby',
    Kids: 'Kids',
    Health: 'Health',
    Beauty: 'Beauty',
    Watches: 'Watches',
    Cleaning: 'Cleaning',
    Art: 'Art',
    Gaming: 'Gaming',
    RealEstate: 'RealEstate',
    Pets: 'Pets',
    Furniture: 'Furniture',
};

/* ================== Base Schema لجميع المنتجات ================== */
const baseProductSchema = {
    seller: publicUserSchema,

    product_name: Joi.string().min(2).max(50).required().trim(),
    category: Joi.string()
        .valid(...Object.values(CATEGORIES))
        .required(),
    subcategory: Joi.string().required(),
    price: Joi.number().positive().max(1000000).required(),
    description: Joi.string().max(500).allow(''),
    image: Joi.object({
        url: Joi.string().uri().allow(''),
        publicId: Joi.string().allow('').optional(),
    }),
    likes: Joi.array().items(Joi.string()).unique().default([]),
    sale: Joi.boolean().default(false),
    discount: Joi.number().min(0).max(100).optional(),
    location: Joi.string().empty('').default('israel'),
    ageGroup: Joi.string(),
    safeMaterial: Joi.boolean().default(false),
    in_stock: Joi.boolean().default(true),
    reviews: Joi.array()
        .items(
            Joi.object({
                user: publicUserSchema,
                rating: Joi.number()
                    .min(1)
                    .max(5)
                    .precision(1)
                    .required()
                    .custom((value) => Math.round(value * 10) / 10),
                comment: Joi.string().max(300).allow(''),
            }),
        )
        .max(2000)
        .default([]),
};

/* ================== House ================== */
const houseSchema = Joi.object({
    ...baseProductSchema,
    type: Joi.string()
        .valid('kitchen', 'storage', 'decor', 'maintenance')
        .required(),

    brand: Joi.string(),
    material: Joi.string(),
    color: Joi.string(),
    dimensions: Joi.string(),
    capacity: Joi.number(),
    powerWatts: Joi.number(),
    usageType: Joi.string(),
}).options({ stripUnknown: true });

/* ================== Garden ================== */
const gardenSchema = Joi.object({
    ...baseProductSchema,
    type: Joi.string()
        .valid('plants', 'watering', 'tools', 'outdoorDecor')
        .required(),
    brand: Joi.string(),
    plantType: Joi.string(),
    season: Joi.string(),
    sunExposure: Joi.string(),
    hoseLength: Joi.number(),
    automatic: Joi.boolean(),
    toolType: Joi.string(),
    weatherResistant: Joi.boolean(),
}).options({ stripUnknown: true });

/* ================== Cars ================== */
const carsSchema = Joi.object({
    ...baseProductSchema,
    type: Joi.string().valid('private', 'electric', 'parts').required(),
    brand: Joi.string().required(),
    year: Joi.number().when('type', {
        is: Joi.valid('private', 'electric'),
        then: Joi.required(),
        otherwise: Joi.optional(),
    }),
    fuel: Joi.string()
        .valid('gasoline', 'diesel', 'hybrid', 'electric')
        .when('type', {
            is: 'private',
            then: Joi.required(),
            otherwise: Joi.optional(),
        }),
    mileage: Joi.number().min(0),
    color: Joi.string(),
    batteryCapacity: Joi.number().optional(),
    rangeKm: Joi.number().optional(),
}).options({ stripUnknown: true });

/* ================== Motorcycles ================== */
const motorcyclesSchema = Joi.object({
    ...baseProductSchema,

    type: Joi.string()
        .valid('street', 'sport', 'cruiser', 'offRoad', 'scooter', 'parts')
        .required(),

    brand: Joi.string().when('type', {
        is: 'parts',
        then: Joi.optional(),
        otherwise: Joi.required(),
    }),

    year: Joi.number().when('type', {
        is: 'parts',
        then: Joi.optional(),
        otherwise: Joi.required(),
    }),

    engineCapacity: Joi.number().when('type', {
        is: 'parts',
        then: Joi.optional(),
        otherwise: Joi.required(),
    }),

    mileage: Joi.number().min(0),

    fuel: Joi.string().valid('gasoline', 'electric'),

    color: Joi.string(),

    partType: Joi.string().when('type', {
        is: 'parts',
        then: Joi.required(),
        otherwise: Joi.optional(),
    }),
}).options({ stripUnknown: true });

/* ================== Electronics ================== */
const electronicsSchema = Joi.object({
    ...baseProductSchema,

    type: Joi.string()
        .valid('smartphones', 'laptops', 'tablets', 'accessories', 'audio')
        .required(),

    brand: Joi.string().required(),
    model: Joi.string().allow(''),
    processor: Joi.string().allow(''),
    ram: Joi.number().allow(''),
    storage: Joi.number().allow(''),
    screenSize: Joi.number().allow(''),
    resolution: Joi.string().allow(''),
    operatingSystem: Joi.string().allow(''),

    condition: Joi.string()
        .valid('new', 'like_new', 'excellent', 'good', 'fair')
        .default('good'),

    batteryLife: Joi.number().allow(''),
    includedAccessories: Joi.array().items(Joi.string()).allow(''),

    networkType: Joi.string().valid('4G', '5G', 'WiFi', 'Bluetooth').allow(''),

    color: Joi.string().allow(''),
    warranty: Joi.string().allow(''),
}).options({ stripUnknown: true });

/* ================== Bikes ================== */
const bikesSchema = Joi.object({
    ...baseProductSchema,
    type: Joi.string().valid('kids', 'mountain', 'road').required(),
    frameSize: Joi.string().required(),
    color: Joi.string().allow(''),
    weight: Joi.number().when('type', {
        is: 'road',
        then: Joi.required(),
        otherwise: Joi.forbidden(),
    }),
    suspension: Joi.boolean().when('type', {
        is: 'mountain',
        then: Joi.required(),
        otherwise: Joi.forbidden(),
    }),
}).options({ stripUnknown: true });

/* ================== Trucks ================== */
const trucksSchema = Joi.object({
    ...baseProductSchema,
    type: Joi.string().valid('light', 'heavy').required(),
    brand: Joi.string().required(),
    loadCapacityTons: Joi.number().required(),
    axles: Joi.number(), // للفئة heavy
}).options({ stripUnknown: true });

/* ================== Electric Vehicles ================== */
const electricVehiclesSchema = Joi.object({
    ...baseProductSchema,
    type: Joi.string().valid('cars', 'scooters').required(),
    brand: Joi.string().required(),
    batteryCapacity: Joi.number(),
    rangeKm: Joi.number(),
}).options({ stripUnknown: true });

/* ================== Men Clothes ================== */
const menClothesSchema = Joi.object({
    ...baseProductSchema,
    type: Joi.string().valid('casual', 'formal', 'shoes').required(),
    size: Joi.string().required(),
    material: Joi.string(),
    color: Joi.string(),
}).options({ stripUnknown: true });

/* ================== Women Clothes ================== */
const womenClothesSchema = Joi.object({
    ...baseProductSchema,
    type: Joi.string().valid('casual', 'dresses', 'shoes').required(),
    size: Joi.string().required(),
    material: Joi.string(),
    color: Joi.string(),
    length: Joi.string(), // للفئة dresses
    heelHeight: Joi.number(), // للفئة shoes
}).options({ stripUnknown: true });

const womenBagsSchema = Joi.object({
    ...baseProductSchema,
    type: Joi.string()
        .valid('handbags', 'toteBags', 'backpacks', 'clutches')
        .required(),
    size: Joi.string().required(),
    material: Joi.string(),
    color: Joi.string(),
}).options({ stripUnknown: true });

/* ================== Baby ================== */
const babySchema = Joi.object({
    ...baseProductSchema,
    type: Joi.string().valid('clothes', 'care', 'feeding').required(),
    ageGroup: Joi.string().required(),
    brand: Joi.string(),
    material: Joi.string(),
}).options({ stripUnknown: true });

/* ================== Kids ================== */
const kidsSchema = Joi.object({
    ...baseProductSchema,
    type: Joi.string().valid('educational', 'toys', 'outdoor').required(),
    ageGroup: Joi.string().required(),
    safeMaterial: Joi.boolean(),
    material: Joi.string(),
}).options({ stripUnknown: true });

/* ================== Health ================== */
const healthSchema = Joi.object({
    ...baseProductSchema,
    type: Joi.string().valid('personalCare', 'medical', 'fitness').required(),
    brand: Joi.string(),
    expiryDate: Joi.date(),
}).options({ stripUnknown: true });

/* ================== Beauty ================== */
const beautySchema = Joi.object({
    ...baseProductSchema,
    type: Joi.string().valid('makeup', 'skincare', 'hair').required(),
    brand: Joi.string(),
    expiryDate: Joi.date(),
}).options({ stripUnknown: true });

/* ================== Watches ================== */
const watchesSchema = Joi.object({
    ...baseProductSchema,
    type: Joi.string().valid('classic', 'smart', 'hand').required(),
    brand: Joi.string(),
    waterResistant: Joi.boolean(),
}).options({ stripUnknown: true });

/* ================== Cleaning ================== */
const cleaningSchema = Joi.object({
    ...baseProductSchema,
    type: Joi.string().valid('detergents', 'tools', 'disinfection').required(),
    brand: Joi.string(),
    volume: Joi.number(),
}).options({ stripUnknown: true });

/* ================== Art ================== */
const artSchema = Joi.object({
    ...baseProductSchema,

    type: Joi.string()
        .valid(
            'paintings',
            'sculptures',
            'photography',
            'crafts',
            'collectibles',
        )
        .required(),

    artist: Joi.string(),
    creationYear: Joi.number(),
    dimensions: Joi.string(),
    technique: Joi.string(),
    certificate: Joi.boolean().default(false),
    provenance: Joi.string(),
    condition: Joi.string(),
    framed: Joi.boolean().default(false),
}).options({ stripUnknown: true });

/* ================== Gaming ================== */
const gamingSchema = Joi.object({
    ...baseProductSchema,

    type: Joi.string()
        .valid('consoles', 'games', 'accessories', 'pc_gaming')
        .required(),

    platform: Joi.string().valid(
        'PlayStation',
        'Xbox',
        'Nintendo',
        'PC',
        'Mobile',
    ),

    genre: Joi.string(),
    edition: Joi.string(),
    multiplayer: Joi.boolean().default(false),
    rating: Joi.string(),
    language: Joi.string(),
    releaseYear: Joi.number(),
}).options({ stripUnknown: true });

/* ================== Real Estate ================== */
const realEstateSchema = Joi.object({
    ...baseProductSchema,

    type: Joi.string()
        .valid('apartment', 'house', 'villa', 'commercial', 'land')
        .required(),

    area: Joi.number().required(),
    rooms: Joi.number(),
    bathrooms: Joi.number(),
    floors: Joi.number(),

    hasParking: Joi.boolean().default(false),
    hasElevator: Joi.boolean().default(false),
    furnished: Joi.boolean().default(false),

    rentalType: Joi.string().valid('sale', 'rent', 'daily').default('sale'),

    propertyAge: Joi.number(),

    geoLocation: Joi.object({
        type: Joi.string().valid('Point').default('Point'),

        coordinates: Joi.array().items(Joi.number()).length(2).required(),
    }),
}).options({ stripUnknown: true });

/* ================== Pets ================== */
const petsSchema = Joi.object({
    ...baseProductSchema,

    type: Joi.string()
        .valid('dogs', 'cats', 'birds', 'fish', 'small_animals', 'supplies')
        .required(),

    breed: Joi.string(),
    age: Joi.number().min(0),

    gender: Joi.string().valid('male', 'female'),

    vaccinated: Joi.boolean().default(false),
    neutered: Joi.boolean().default(false),
    microchipped: Joi.boolean().default(false),

    color: Joi.string(),
    weight: Joi.number().min(0),
    healthIssues: Joi.string(),
    temperament: Joi.string(),

    brand: Joi.string(),
    size: Joi.string(),
    material: Joi.string(),
}).options({ stripUnknown: true });

/* ================== Furniture ================== */
const furnitureSchema = Joi.object({
    ...baseProductSchema,

    type: Joi.string()
        .valid(
            'living_room',
            'bedroom',
            'dining',
            'office',
            'outdoor',
            'kitchen',
        )
        .required(),

    brand: Joi.string().allow(''),
    material: Joi.string().allow(''),
    color: Joi.string().allow(''),
    dimensions: Joi.string().allow(''),
    weight: Joi.number().allow(''),

    assemblyRequired: Joi.boolean().default(false),

    condition: Joi.string()
        .valid('new', 'like_new', 'good', 'fair')
        .default('good'),

    style: Joi.string(),
    includesAccessories: Joi.boolean().default(false),
}).options({ stripUnknown: true });

/* ================== Export ================== */
module.exports = {
    carsSchema,
    bikesSchema,
    trucksSchema,
    electricVehiclesSchema,
    electronicsSchema,

    menClothesSchema,
    womenClothesSchema,
    womenBagsSchema,
    babySchema,

    kidsSchema,
    healthSchema,
    beautySchema,
    watchesSchema,

    cleaningSchema,
    houseSchema,
    gardenSchema,
    motorcyclesSchema,

    artSchema,
    gamingSchema,
    realEstateSchema,
    petsSchema,
    furnitureSchema,
};
