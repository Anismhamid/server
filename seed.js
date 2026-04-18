const mongoose = require('mongoose');
const Posts = require('./models/post');
const BusinessInfo = require('./models/BusinessInfo');
const User = require('./models/User');
const Cities = require('./models/City');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Main Seed Function
async function seed() {
    try {
        await mongoose.connect('mongodb://localhost:27017/marketplace');
        console.log(chalk.green('Connected to MongoDB'));

        // Seed Posts
        await seedPosts();

        // Seed Business Info
        await seedBusinessInfo();

        // Seed Users
        await seedUsers();

        // Seed Cities
        await seedCities();

        await mongoose.disconnect();
        console.log(chalk.red('Disconnected from MongoDB'));
    } catch (err) {
        console.error(chalk.red(err));
    }
}
// Seed Posts
async function seedPosts() {
    try {
        const existingPosts = await Posts.find();
        if (existingPosts.length > 0) {
            console.log(chalk.yellow('Posts already exist. Skipping seeding.'));
            return;
        }

        const posts = [
            // ================= Baby - care =================
            {
                product_name: 'Baby Lotion',
                description: 'Gentle baby skin care',
                price: 10,
                category: 'Baby',
                type: 'care',
                subcategory: 'care',
                image: {
                    publicId: 'seed/baby-lotion',
                    url: 'https://via.placeholder.com/300',
                },
                ageGroup: '0-6 months',
            },

            // ================= Baby - feeding =================
            {
                product_name: 'Baby Bottle',
                description: 'Feeding bottle',
                price: 15,
                category: 'Baby',
                type: 'feeding',
                subcategory: 'feeding',
                image: {
                    publicId: 'seed/baby-bottle',
                    url: 'https://via.placeholder.com/300',
                },
                brand: 'Philips Avent',
                ageGroup: '0-6 months',
            },

            // ================= House - kitchen =================
            {
                product_name: 'Kitchen Mixer',
                description: 'Electric mixer',
                price: 120,
                category: 'House',
                type: 'kitchen',
                subcategory: 'kitchen',
                image: {
                    publicId: 'seed/mixer',
                    url: 'https://via.placeholder.com/300',
                },
                brand: 'Bosch',
                material: 'Stainless Steel',
                powerWatts: 500,
            },

            // ================= Cars - private =================
            {
                product_name: 'Toyota Corolla',
                description: 'Family car',
                price: 15000,
                category: 'Cars',
                type: 'private',
                subcategory: 'private',
                image: {
                    publicId: 'seed/car',
                    url: 'https://via.placeholder.com/300',
                },
                brand: 'Toyota',
                year: 2020,
                fuel: 'gasoline',
                mileage: 40000,
            },

            // ================= Bikes - mountain =================
            {
                product_name: 'Mountain Bike',
                description: 'Off-road bike',
                price: 600,
                category: 'Bikes',
                type: 'mountain',
                subcategory: 'mountain',
                image: {
                    publicId: 'seed/bike',
                    url: 'https://via.placeholder.com/300',
                },
                frameSize: 'M',
                suspension: true,
            },

            // ================= Cleaning =================
            {
                product_name: 'Ariel Detergent',
                description: 'Laundry detergent',
                price: 12,
                category: 'Cleaning',
                type: 'detergents',
                subcategory: 'detergents',
                image: {
                    publicId: 'seed/detergent',
                    url: 'https://via.placeholder.com/300',
                },
                brand: 'Ariel',
                volume: 2,
            },
        ];

        await Posts.insertMany(posts);

        console.log(
            chalk.greenBright(`Inserted ${posts.length} posts successfully.`),
        );
    } catch (error) {
        console.log(error);
    }
}

// Seed Businees Information
async function seedBusinessInfo() {
    try {
        const existingBusinessInfo = await BusinessInfo.find();
        if (existingBusinessInfo.length > 0) {
            console.log(
                chalk.yellow('Business info already exists. Skipping seeding.'),
            );
            return;
        }

        // Load the business info data
        const businessInfoPath = path.join(
            __dirname,
            'fruit-store.businessinfos.json',
        );
        if (!fs.existsSync(businessInfoPath)) {
            console.log(
                chalk.yellow(
                    'Business info file not found. Skipping business info seeding.',
                ),
            );
            return;
        }

        const rawBusinessInfoData = fs.readFileSync(businessInfoPath);
        const businessInfoJson = JSON.parse(rawBusinessInfoData);

        // Clean the business info data
        const cleanBusinessInfo = businessInfoJson.map(
            ({ _id, ...rest }) => rest,
        );

        if (cleanBusinessInfo.length === 0) {
            console.log(chalk.red('No valid business info to insert.'));
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
            console.log(chalk.yellow('Users already exist. Skipping seeding.'));
            return;
        }

        // Load the users data
        const usersPath = path.join(__dirname, 'fruit-store.users.json');
        if (!fs.existsSync(usersPath)) {
            console.log(
                chalk.yellow('Users file not found. Skipping users seeding.'),
            );
            return;
        }

        const rawUsersData = fs.readFileSync(usersPath);
        const usersJson = JSON.parse(rawUsersData);

        // Clean the users data
        const cleanUsers = usersJson.map(({ _id, __v, ...rest }) => rest);

        if (cleanUsers.length === 0) {
            console.log(chalk.red('No valid users to insert.'));
            return;
        }

        await User.insertMany(cleanUsers);
        console.log(
            chalk.greenBright(`Inserted ${cleanUsers.length} user records.`),
        );
    } catch (error) {
        console.log(error);
    }
}

// seed Cities
async function seedCities() {
    try {
        const existingcities = await Cities.find();
        if (existingcities.length > 0) {
            console.log(
                chalk.yellow('cities already exist. Skipping seeding.'),
            );
            return;
        }

        // Load The Cities Data
        const citiesPath = path.join(__dirname, 'fruit-store.cities.json');
        if (!fs.existsSync(citiesPath)) {
            console.log(
                chalk.yellow('cities file not found. Skipping cities seeding.'),
            );
            return;
        }

        const rawCitiesData = fs.readFileSync(citiesPath);
        const citiesJson = JSON.parse(rawCitiesData);

        // Clean The cCities Data
        const cleanCities = citiesJson.map(({ _id, __v, ...rest }) => rest);

        if (cleanCities.length === 0) {
            console.log(chalk.red('No valid cities to insert.'));
            return;
        }

        await Cities.insertMany(cleanCities);
        console.log(
            chalk.greenBright(`Inserted ${cleanCities.length} cities records.`),
        );
    } catch (error) {
        console.log(error);
    }
}

seed();
