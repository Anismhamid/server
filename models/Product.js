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
		price: {type: Number, required: true, min: [1, "Price must be positive"]},
		description: {type: String, maxlength: 500},
		image_url: {type: String, required: true},
		likes: {type: [String]},
		sale: {type: Boolean, default: false},
		discount: {type: Number, min: 0, max: 100},
	},
	{timestamps: true, discriminatorKey: "category"},
);

const Products = mongoose.model("Products", baseProductSchema);
// Cars
const carSchema = new mongoose.Schema({
	type: {type: String, enum: ["private", "electric"], required: true},
	brand: {type: String, required: true},
	year: {type: String, required: true},
	fuel: {
		type: String,
		enum: ["diesel", "gasoline", "electric", "hybrid"],
		required: true,
	},
	mileage: {type: Number, min: 0, required: true},
	color: {type: String, required: true},
});
Products.discriminator("Cars", carSchema);

// Bikes
const bikeSchema = new mongoose.Schema({
	type: {type: String, enum: ["kids", "mountain", "road"], required: true},
	frameSize: {type: String, required: true},
	color: {type: String},
});
Products.discriminator("Bikes", bikeSchema);

// Trucks
const truckSchema = new mongoose.Schema({
	type: {type: String, enum: ["light", "heavy"], required: true},
	loadCapacityTons: {type: Number, required: true},
});
Products.discriminator("Trucks", truckSchema);

// Electric Vehicles
const electricSchema = new mongoose.Schema({
	type: {type: String, enum: ["cars", "scooters"], required: true},
	brand: {type: String, required: true},
	batteryCapacity: {type: Number},
	rangeKm: {type: Number},
});
Products.discriminator("ElectricVehicles", electricSchema);

// Men Clothes
const menClothesSchema = new mongoose.Schema({
	type: {type: String, enum: ["casual", "formal", "shoes"], required: true},
	size: {type: String, required: true},
	material: {type: String, required: true},
	color: {type: String},
});
Products.discriminator("MenClothes", menClothesSchema);

// Women Clothes
const womenClothesSchema = new mongoose.Schema({
	type: {type: String, enum: ["casual", "dresses", "shoes"], required: true},
	size: {type: String, required: true},
	material: {type: String, required: true},
	color: {type: String},
});
Products.discriminator("WomenClothes", womenClothesSchema);

// Baby
const babySchema = new mongoose.Schema({
	type: {type: String, enum: ["clothes", "care", "feeding"], required: true},
	ageGroup: {type: String, required: true},
	material: {type: String},
});
Products.discriminator("Baby", babySchema);

// Kids
const kidsSchema = new mongoose.Schema({
	type: {type: String, enum: ["educational", "toys", "outdoor"], required: true},
	ageGroup: {type: String, required: true},
	safeMaterial: {type: Boolean, required: true},
});
Products.discriminator("Kids", kidsSchema);

// Health
const healthSchema = new mongoose.Schema({
	type: {type: String, enum: ["personalCare", "medical", "fitness"], required: true},
	brand: {type: String, required: true},
	expiryDate: {type: Date},
});
Products.discriminator("Health", healthSchema);

// Watches
const watchesSchema = new mongoose.Schema({
	type: {type: String, enum: ["classic", "smart", "hand"], required: true},
	brand: {type: String, required: true},
	waterResistant: {type: Boolean},
});
Products.discriminator("Watches", watchesSchema);

// Beauty
const beautySchema = new mongoose.Schema({
	type: {type: String, enum: ["makeup", "skincare", "hair"], required: true},
	brand: {type: String, required: true},
	expiryDate: {type: Date},
});
Products.discriminator("Beauty", beautySchema);

// Cleaning
const cleaningSchema = new mongoose.Schema({
	type: {type: String, enum: ["detergents", "tools", "disinfection"], required: true},
	brand: {type: String, required: true},
	volume: {type: Number},
});
Products.discriminator("Cleaning", cleaningSchema);

module.exports = Products;
