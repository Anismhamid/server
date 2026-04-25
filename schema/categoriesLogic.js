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
    Kids: 'Kids',
    Baby: 'Baby',
    Beauty: 'Beauty',
    Cleaning: 'Cleaning',
    Health: 'Health',
    Watches: 'Watches',
    MenClothes: 'MenClothes',
    WomenClothes: 'WomenClothes',
    WomenBags: 'WomenBags',
    Cars: 'Cars',
    Motorcycles: 'Motorcycles',
    Trucks: 'Trucks',
    Bikes: 'Bikes',
    ElectricVehicles: 'ElectricVehicles',
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

/* ================== Bikes ================== */
const bikesSchema = Joi.object({
    ...baseProductSchema,
    type: Joi.string().valid('kids', 'mountain', 'road').required(),
    frameSize: Joi.string().required(),
    color: Joi.string(),
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

/* ================== Export ================== */
module.exports = {
    carsSchema,
    bikesSchema,
    trucksSchema,
    electricVehiclesSchema,
    menClothesSchema,
    womenClothesSchema,
    babySchema,
    kidsSchema,
    healthSchema,
    beautySchema,
    watchesSchema,
    cleaningSchema,
    houseSchema,
    gardenSchema,
};
