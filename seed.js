const mongoose = require("mongoose");
const Product = require("./models/Product");
const BusinessInfo = require("./models/BusinessInfo");
const User = require("./models/User");
const Cities = require("./models/City");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

// Main Seed Function
async function seed() {
	try {
		await mongoose.connect("mongodb://localhost:27017/marketplace");
		console.log(chalk.green("Connected to MongoDB"));

		// Seed Products
		await seedProducts();

		// Seed Business Info
		await seedBusinessInfo();

		// Seed Users
		await seedUsers();

		// Seed Cities
		await seedCities();

		await mongoose.disconnect();
		console.log(chalk.red("Disconnected from MongoDB"));
	} catch (err) {
		console.error(chalk.red(err));
	}
}
// Seed Products
async function seedProducts() {
	try {
		const existingProducts = await Product.find();
		if (existingProducts.length > 0) {
			console.log(chalk.yellow("Products already exist. Skipping seeding."));
			return;
		}

		// Load the product data
		const productsPath = path.join(__dirname, "fruit-store.products.json");
		if (!fs.existsSync(productsPath)) {
			console.log(
				chalk.yellow("Products file not found. Skipping products seeding."),
			);
			return;
		}

		const rawProductsData = fs.readFileSync(productsPath);
		const productsJson = JSON.parse(rawProductsData);

		// Filter only valid products
		const cleanProducts = productsJson
			.map(({_id, updatedAt, createdAt, __v, ...rest}) => rest)
			.filter(
				(p) =>
					p.product_name &&
					p.category &&
					p.price !== undefined &&
					p.quantity_in_stock !== undefined &&
					p.description &&
					p.image_url,
			);

		if (cleanProducts.length === 0) {
			console.log(chalk.red("No valid products to insert."));
			return;
		}

		await Product.insertMany(cleanProducts);
		console.log(
			chalk.greenBright(`Inserted ${cleanProducts.length} valid products.`),
		);
	} catch (error) {
		console.log(error);
		return;
	}
}

// Seed Businees Information
async function seedBusinessInfo() {
	try {
		const existingBusinessInfo = await BusinessInfo.find();
		if (existingBusinessInfo.length > 0) {
			console.log(chalk.yellow("Business info already exists. Skipping seeding."));
			return;
		}

		// Load the business info data
		const businessInfoPath = path.join(__dirname, "fruit-store.businessinfos.json");
		if (!fs.existsSync(businessInfoPath)) {
			console.log(
				chalk.yellow(
					"Business info file not found. Skipping business info seeding.",
				),
			);
			return;
		}

		const rawBusinessInfoData = fs.readFileSync(businessInfoPath);
		const businessInfoJson = JSON.parse(rawBusinessInfoData);

		// Clean the business info data
		const cleanBusinessInfo = businessInfoJson.map(({_id, ...rest}) => rest);

		if (cleanBusinessInfo.length === 0) {
			console.log(chalk.red("No valid business info to insert."));
			return;
		}

		await BusinessInfo.insertMany(cleanBusinessInfo);
		console.log(
			chalk.greenBright(
				`Inserted ${cleanBusinessInfo.length} business info records.`,
			),
		);
	} catch (error) {
		console.log(error);
	}
}

// Seed users
async function seedUsers() {
	try {
		const existingUsers = await User.find();
		if (existingUsers.length > 0) {
			console.log(chalk.yellow("Users already exist. Skipping seeding."));
			return;
		}

		// Load the users data
		const usersPath = path.join(__dirname, "fruit-store.users.json");
		if (!fs.existsSync(usersPath)) {
			console.log(chalk.yellow("Users file not found. Skipping users seeding."));
			return;
		}

		const rawUsersData = fs.readFileSync(usersPath);
		const usersJson = JSON.parse(rawUsersData);

		// Clean the users data
		const cleanUsers = usersJson.map(({_id, __v, ...rest}) => rest);

		if (cleanUsers.length === 0) {
			console.log(chalk.red("No valid users to insert."));
			return;
		}

		await User.insertMany(cleanUsers);
		console.log(chalk.greenBright(`Inserted ${cleanUsers.length} user records.`));
	} catch (error) {
		console.log(error);
	}
}

// seed Cities
async function seedCities() {
	try {
		const existingcities = await Cities.find();
		if (existingcities.length > 0) {
			console.log(chalk.yellow("cities already exist. Skipping seeding."));
			return;
		}

		// Load The Cities Data
		const citiesPath = path.join(__dirname, "fruit-store.cities.json");
		if (!fs.existsSync(citiesPath)) {
			console.log(chalk.yellow("cities file not found. Skipping cities seeding."));
			return;
		}

		const rawCitiesData = fs.readFileSync(citiesPath);
		const citiesJson = JSON.parse(rawCitiesData);

		// Clean The cCities Data
		const cleanCities = citiesJson.map(({_id, __v, ...rest}) => rest);

		if (cleanCities.length === 0) {
			console.log(chalk.red("No valid cities to insert."));
			return;
		}

		await Cities.insertMany(cleanCities);
		console.log(chalk.greenBright(`Inserted ${cleanCities.length} cities records.`));
	} catch (error) {
		console.log(error);
	}
}

seed();
