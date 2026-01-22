const mongoose = require("mongoose");

// ===== Base Schema لجميع المنتجات =====
const baseProductSchema = new mongoose.Schema(
	{
		seller: {
			name: {type: String, required: true},
			slug: {type: String},
			user: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
		},
		product_name: {type: String, required: true, trim: true},
		category: {type: String, required: true},
		subcategory: {type: String, required: true},
		price: {type: Number, required: true, min: [1, "Price must be positive"]},
		description: {type: String, maxlength: 500},
		image: {
			url: {type: String, required: true},
			publicId: {type: String, required: true},
		},
		likes: {type: [String], default: []},
		sale: {type: Boolean, default: false},
		discount: {type: Number, min: 0, max: 100},
		location: {type: String},
		in_stock: {type: Boolean, default: true},
	},
	{timestamps: true, discriminatorKey: "category"},
);

const Products = mongoose.model("Products", baseProductSchema);

/* ================== House ================== */
const houseSchema = new mongoose.Schema({
	type: {
		type: String,
		enum: ["kitchen", "storage", "decor", "maintenance"],
		required: true,
	},
	brand: {type: String},
	material: {type: String},
	color: {type: String},
	dimensions: {type: String},
	capacity: {type: Number},
	powerWatts: {type: Number},
	usageType: {type: String},
});
Products.discriminator("House", houseSchema);

/* ================== Garden ================== */
const gardenSchema = new mongoose.Schema({
	type: {
		type: String,
		enum: ["plants", "watering", "tools", "outdoorDecor"],
		required: true,
	},
	brand: {type: String},
	plantType: {type: String},
	season: {type: String},
	sunExposure: {type: String},
	hoseLength: {type: Number},
	automatic: {type: Boolean},
	toolType: {type: String},
	weatherResistant: {type: Boolean},
});
Products.discriminator("Garden", gardenSchema);

/* ================== Cars ================== */
const carSchema = new mongoose.Schema({
	type: {type: String, enum: ["private", "electric"], required: true},
	brand: {type: String, required: true},
	year: {type: Number, required: true},
	fuel: {type: String, enum: ["gasoline", "diesel", "hybrid"], required: true},
	mileage: {type: Number, min: 0},
	color: {type: String},
});
Products.discriminator("Cars", carSchema);

/* ================== Bikes ================== */
const bikeSchema = new mongoose.Schema({
	type: {type: String, enum: ["kids", "mountain", "road"], required: true},
	frameSize: {type: String, required: true},
	color: {type: String},
	weight: {type: Number}, // للفئة road
	suspension: {type: Boolean}, // للفئة mountain
});
Products.discriminator("Bikes", bikeSchema);

/* ================== Trucks ================== */
const truckSchema = new mongoose.Schema({
	type: {type: String, enum: ["light", "heavy"], required: true},
	brand: {type: String, required: true},
	loadCapacityTons: {type: Number, required: true},
	axles: {type: Number}, // للفئة heavy
});
Products.discriminator("Trucks", truckSchema);

/* ================== Electric Vehicles ================== */
const electricSchema = new mongoose.Schema({
	type: {type: String, enum: ["cars", "scooters"], required: true},
	brand: {type: String, required: true},
	batteryCapacity: {type: Number},
	rangeKm: {type: Number},
});
Products.discriminator("ElectricVehicles", electricSchema);

/* ================== Men Clothes ================== */
const menClothesSchema = new mongoose.Schema({
	type: {type: String, enum: ["casual", "formal", "shoes"], required: true},
	size: {type: String, required: true},
	material: {type: String},
	color: {type: String},
});
Products.discriminator("MenClothes", menClothesSchema);

/* ================== Women Clothes ================== */
const womenClothesSchema = new mongoose.Schema({
	type: {type: String, enum: ["casual", "dresses", "shoes"], required: true},
	size: {type: String, required: true},
	material: {type: String},
	color: {type: String},
	length: {type: String}, // للفئة dresses
	heelHeight: {type: Number}, // للفئة shoes
});
Products.discriminator("WomenClothes", womenClothesSchema);

/* ================== Baby ================== */
const babySchema = new mongoose.Schema({
	type: {type: String, enum: ["clothes", "care", "feeding"], required: true},
	ageGroup: {type: String, required: true}, // للفئة clothes & feeding
	material: {type: String},
});
Products.discriminator("Baby", babySchema);

/* ================== Kids ================== */
const kidsSchema = new mongoose.Schema({
	type: {type: String, enum: ["educational", "toys", "outdoor"], required: true},
	ageGroup: {type: String, required: true},
	safeMaterial: {type: Boolean},
});
Products.discriminator("Kids", kidsSchema);

/* ================== Health ================== */
const healthSchema = new mongoose.Schema({
	type: {type: String, enum: ["personalCare", "medical", "fitness"], required: true},
	brand: {type: String},
	expiryDate: {type: String}, // للحفاظ على توافق مع categoriesLogic
});
Products.discriminator("Health", healthSchema);

/* ================== Beauty ================== */
const beautySchema = new mongoose.Schema({
	type: {type: String, enum: ["makeup", "skincare", "hair"], required: true},
	brand: {type: String},
	expiryDate: {type: String},
});
Products.discriminator("Beauty", beautySchema);

/* ================== Watches ================== */
const watchesSchema = new mongoose.Schema({
	type: {type: String, enum: ["classic", "smart", "hand"], required: true},
	brand: {type: String},
	waterResistant: {type: Boolean},
});
Products.discriminator("Watches", watchesSchema);

/* ================== Cleaning ================== */
const cleaningSchema = new mongoose.Schema({
	type: {type: String, enum: ["detergents", "tools", "disinfection"], required: true},
	brand: {type: String},
	volume: {type: Number},
});
Products.discriminator("Cleaning", cleaningSchema);

module.exports = Products;
