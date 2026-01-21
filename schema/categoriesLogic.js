const Joi = require("joi");

/* ================== Base Schema لجميع المنتجات ================== */
const baseProductSchema = {
	seller: Joi.object({
		name: Joi.string().required(),
		slug: Joi.string().allow(""),
		user: Joi.string().allow(""),
	}),

	product_name: Joi.string().min(2).max(50).required().trim(),
	category: Joi.string().required(),
	subcategory: Joi.string().required(),
	price: Joi.number().positive().required(),
	description: Joi.string().max(500).allow(""),
	image: Joi.string().uri().allow(""),
	likes: Joi.array().items(Joi.string()).default([]),
	sale: Joi.boolean().default(false),
	discount: Joi.number().min(0).max(100),
	location: Joi.string().default("umm al fahm").allow(""),
	ageGroup: Joi.string(),
	safeMaterial: Joi.boolean().default(false),
	in_stock: Joi.boolean().default(true),
};

/* ================== House ================== */
const houseSchema = Joi.object({
	...baseProductSchema,
	type: Joi.string().valid("kitchen", "storage", "decor", "maintenance").required(),

	brand: Joi.string(),
	material: Joi.string(),
	color: Joi.string(),
	dimensions: Joi.string(),
	capacity: Joi.number(),
	powerWatts: Joi.number(),
	usageType: Joi.string(),
});

/* ================== Garden ================== */
const gardenSchema = Joi.object({
	...baseProductSchema,
	type: Joi.string().valid("plants", "watering", "tools", "outdoorDecor").required(),
	brand: Joi.string(),
	plantType: Joi.string(),
	season: Joi.string(),
	sunExposure: Joi.string(),
	hoseLength: Joi.number(),
	automatic: Joi.boolean(),
	toolType: Joi.string(),
	weatherResistant: Joi.boolean(),
});

/* ================== Cars ================== */
const carsSchema = Joi.object({
	...baseProductSchema,
	type: Joi.string().valid("private", "electric").required(),
	brand: Joi.string().required(),
	year: Joi.number().required(),
	fuel: Joi.string().valid("gasoline", "diesel", "hybrid").required(),
	mileage: Joi.number().min(0),
	color: Joi.string(),
});

/* ================== Bikes ================== */
const bikesSchema = Joi.object({
	...baseProductSchema,
	type: Joi.string().valid("kids", "mountain", "road").required(),
	frameSize: Joi.string().required(),
	color: Joi.string(),
	weight: Joi.number(), // للفئة road
	suspension: Joi.boolean(), // للفئة mountain
});

/* ================== Trucks ================== */
const trucksSchema = Joi.object({
	...baseProductSchema,
	type: Joi.string().valid("light", "heavy").required(),
	brand: Joi.string().required(),
	loadCapacityTons: Joi.number().required(),
	axles: Joi.number(), // للفئة heavy
});

/* ================== Electric Vehicles ================== */
const electricVehiclesSchema = Joi.object({
	...baseProductSchema,
	type: Joi.string().valid("cars", "scooters").required(),
	brand: Joi.string().required(),
	batteryCapacity: Joi.number(),
	rangeKm: Joi.number(),
});

/* ================== Men Clothes ================== */
const menClothesSchema = Joi.object({
	...baseProductSchema,
	type: Joi.string().valid("casual", "formal", "shoes").required(),
	size: Joi.string().required(),
	material: Joi.string(),
	color: Joi.string(),
});

/* ================== Women Clothes ================== */
const womenClothesSchema = Joi.object({
	...baseProductSchema,
	type: Joi.string().valid("casual", "dresses", "shoes").required(),
	size: Joi.string().required(),
	material: Joi.string(),
	color: Joi.string(),
	length: Joi.string(), // للفئة dresses
	heelHeight: Joi.number(), // للفئة shoes
});

/* ================== Baby ================== */
const babySchema = Joi.object({
	...baseProductSchema,
	type: Joi.string().valid("clothes", "care", "feeding").required(),
	ageGroup: Joi.string().required(), // للفئة clothes & feeding
	material: Joi.string(),
});

/* ================== Kids ================== */
const kidsSchema = Joi.object({
	...baseProductSchema,
	type: Joi.string().valid("educational", "toys", "outdoor").required(),
	ageGroup: Joi.string().required(),
	safeMaterial: Joi.boolean(),
});

/* ================== Health ================== */
const healthSchema = Joi.object({
	...baseProductSchema,
	type: Joi.string().valid("personalCare", "medical", "fitness").required(),
	brand: Joi.string(),
	expiryDate: Joi.string(),
});

/* ================== Beauty ================== */
const beautySchema = Joi.object({
	...baseProductSchema,
	type: Joi.string().valid("makeup", "skincare", "hair").required(),
	brand: Joi.string(),
	expiryDate: Joi.string(),
});

/* ================== Watches ================== */
const watchesSchema = Joi.object({
	...baseProductSchema,
	type: Joi.string().valid("classic", "smart", "hand").required(),
	brand: Joi.string(),
	waterResistant: Joi.boolean(),
});

/* ================== Cleaning ================== */
const cleaningSchema = Joi.object({
	...baseProductSchema,
	type: Joi.string().valid("detergents", "tools", "disinfection").required(),
	brand: Joi.string(),
	volume: Joi.number(),
});

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
