const mongoose = require('mongoose');
const Posts = require('./models/post');
const BusinessInfo = require('./models/BusinessInfo');
const User = require('./models/User');
const Cities = require('./models/City');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const seedPosts = require('./seedPosts');

// Main Seed Function
async function seed() {
    try {
        await mongoose.connect('mongodb://localhost:27017/marketplace');
        console.log(chalk.green('Connected to MongoDB'));

        // Seed Users
        await seedUsers();

        // Seed Posts
        await seedPosts();

        // Seed Business Info
        await seedBusinessInfo();

        // Seed Cities
        await seedCities();

        await mongoose.disconnect();
        console.log(chalk.red('Disconnected from MongoDB'));
    } catch (err) {
        console.error(chalk.red(err));
    }
}
// Seed Posts
// async function seedPosts() {
//     try {
//         const existingPosts = await Posts.find();
//         if (existingPosts.length > 0) {
//             console.log(chalk.yellow('Posts already exist. Skipping seeding.'));
//             return;
//         }

//         const seller = await User.findOne();
//         if (!seller) {
//             console.log(chalk.red('No users found. Seed users first.'));
//             return;
//         }

//         const posts = [
//             // ================= Baby =================
//             {
//                 seller: seller._id,
//                 product_name: 'Baby Lotion',
//                 description: 'קרם עדין לעור תינוק רך מאוד',
//                 price: 10,
//                 category: 'Baby',
//                 type: 'care',
//                 subcategory: 'care',
//                 image: {
//                     publicId: 'seed/baby-lotion',
//                     url: 'https://via.placeholder.com/300',
//                 },
//                 ageGroup: '0-6 months',
//             },

//             {
//                 seller: seller._id,
//                 product_name: 'Baby Bottle',
//                 description: 'בקבוק האכלה איכותי ונוח לשימוש',
//                 price: 15,
//                 category: 'Baby',
//                 type: 'feeding',
//                 subcategory: 'feeding',
//                 image: {
//                     publicId: 'seed/baby-bottle',
//                     url: 'https://via.placeholder.com/300',
//                 },
//                 brand: 'Philips Avent',
//                 ageGroup: '0-6 months',
//             },

//             // ================= House =================
//             {
//                 seller: seller._id,
//                 product_name: 'Kitchen Mixer',
//                 description: 'מיקסר חשמלי חזק למטבח',
//                 price: 120,
//                 category: 'House',
//                 type: 'kitchen',
//                 subcategory: 'kitchen',
//                 image: {
//                     publicId: 'seed/mixer',
//                     url: 'https://via.placeholder.com/300',
//                 },
//                 brand: 'Bosch',
//                 material: 'Stainless Steel',
//                 powerWatts: 500,
//             },

//             // ================= Cars =================
//             {
//                 seller: seller._id,
//                 product_name: 'Toyota Corolla',
//                 description: 'רכב משפחתי אמין וחסכוני',
//                 price: 15000,
//                 category: 'Cars',
//                 type: 'private',
//                 subcategory: 'private',
//                 image: {
//                     publicId: 'seed/car',
//                     url: 'https://via.placeholder.com/300',
//                 },
//                 brand: 'Toyota',
//                 year: 2020,
//                 fuel: 'gasoline',
//                 mileage: 40000,
//             },

//             // ================= Bikes =================
//             {
//                 seller: seller._id,
//                 product_name: 'Mountain Bike',
//                 description: 'אופני שטח חזקים לשטח הררי',
//                 price: 600,
//                 category: 'Bikes',
//                 type: 'mountain',
//                 subcategory: 'mountain',
//                 image: {
//                     publicId: 'seed/bike',
//                     url: 'https://via.placeholder.com/300',
//                 },
//                 frameSize: 'M',
//                 suspension: true,
//             },

//             // ================= Cleaning =================
//             {
//                 seller: seller._id,
//                 product_name: 'Ariel Detergent',
//                 description: 'אבקת כביסה איכותית לבגדים נקיים',
//                 price: 12,
//                 category: 'Cleaning',
//                 type: 'detergents',
//                 subcategory: 'detergents',
//                 image: {
//                     publicId: 'seed/detergent',
//                     url: 'https://via.placeholder.com/300',
//                 },
//                 brand: 'Ariel',
//                 volume: 2,
//             },
//         ];

//         await Posts.insertMany(posts);

//         console.log(
//             chalk.greenBright(`Inserted ${posts.length} posts successfully.`),
//         );
//     } catch (error) {
//         console.log(error);
//     }
// }

// ============================================================
// Seed Posts - Safqa AI Search Dataset
// ============================================================

// async function seedPosts() {
//     try {
//         const existingPosts = await Posts.countDocuments();

//         if (existingPosts > 0) {
//             console.log(
//                 chalk.yellow(
//                     `Posts already exist (${existingPosts}). Skipping seeding.`,
//                 ),
//             );
//             return;
//         }

//         // We use an existing user as the seller.
//         // seller is optional in the schema, but using a real User
//         // makes the seeded posts behave like normal marketplace posts.
//         const seller = await User.findOne();

//         if (!seller) {
//             console.log(
//                 chalk.yellow(
//                     'No users found. Posts will be created without seller.',
//                 ),
//             );
//         }

//         const sellerId = seller?._id;

//         const image = (name) => ({
//             publicId: `seed/${name}`,
//             url: `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800`,
//         });

//         const base = ({
//             product_name,
//             category,
//             subcategory,
//             price,
//             description,
//             location = 'ام الفحم',
//             ...extra
//         }) => ({
//             ...(sellerId ? { seller: sellerId } : {}),

//             product_name,
//             category,
//             subcategory,
//             price,
//             description,

//             image: image(
//                 `${category.toLowerCase()}-${product_name
//                     .replace(/\s+/g, '-')
//                     .replace(/[^\w\u0590-\u06FF-]/g, '')}`,
//             ),

//             likes: [],
//             reviews: [],
//             featured: false,
//             sale: false,
//             discount: 0,
//             location,
//             in_stock: true,
//             status: 'accepted',

//             ...extra,
//         });

//         const posts = [

//             // =====================================================
//             // ELECTRONICS
//             // =====================================================

//             base({
//                 product_name: 'iPhone 15 Pro 256GB',
//                 category: 'Electronics',
//                 subcategory: 'smartphones',
//                 price: 3200,
//                 description:
//                     'آيفون 15 برو سعة 256 جيجا، بحالة ممتازة، يدعم 5G.',
//                 location: 'ام الفحم',
//                 type: 'smartphones',
//                 brand: 'Apple',
//                 model: 'iPhone 15 Pro',
//                 storage: 256,
//                 ram: 8,
//                 screenSize: 6.1,
//                 operatingSystem: 'iOS',
//                 condition: 'excellent',
//                 networkType: '5G',
//                 color: 'Natural Titanium',
//                 warranty: 'No warranty',
//             }),

//             base({
//                 product_name: 'آيفون 15 برو 256 جيجا',
//                 category: 'Electronics',
//                 subcategory: 'smartphones',
//                 price: 3150,
//                 description:
//                     'Apple iPhone 15 Pro 256GB بحالة ممتازة.',
//                 type: 'smartphones',
//                 brand: 'Apple',
//                 model: 'iPhone 15 Pro',
//                 storage: 256,
//                 ram: 8,
//                 screenSize: 6.1,
//                 operatingSystem: 'iOS',
//                 condition: 'excellent',
//                 networkType: '5G',
//                 color: 'Blue Titanium',
//             }),

//             base({
//                 product_name: 'אייפון 15 פרו 256 גיגה',
//                 category: 'Electronics',
//                 subcategory: 'smartphones',
//                 price: 3250,
//                 description:
//                     'Apple iPhone 15 Pro 256GB במצב מצוין.',
//                 type: 'smartphones',
//                 brand: 'Apple',
//                 model: 'iPhone 15 Pro',
//                 storage: 256,
//                 ram: 8,
//                 screenSize: 6.1,
//                 operatingSystem: 'iOS',
//                 condition: 'excellent',
//                 networkType: '5G',
//                 color: 'Black Titanium',
//             }),

//             base({
//                 product_name: 'Samsung Galaxy S24 256GB',
//                 category: 'Electronics',
//                 subcategory: 'smartphones',
//                 price: 2400,
//                 description:
//                     'Samsung Galaxy S24 256GB، هاتف حديث بحالة ممتازة.',
//                 type: 'smartphones',
//                 brand: 'Samsung',
//                 model: 'Galaxy S24',
//                 storage: 256,
//                 ram: 8,
//                 screenSize: 6.2,
//                 operatingSystem: 'Android',
//                 condition: 'excellent',
//                 networkType: '5G',
//                 color: 'Black',
//             }),

//             base({
//                 product_name: 'Samsung Galaxy S24 Ultra 512GB',
//                 category: 'Electronics',
//                 subcategory: 'smartphones',
//                 price: 3600,
//                 description:
//                     'سامسونج S24 Ultra مساحة 512 جيجا.',
//                 type: 'smartphones',
//                 brand: 'Samsung',
//                 model: 'Galaxy S24 Ultra',
//                 storage: 512,
//                 ram: 12,
//                 screenSize: 6.8,
//                 operatingSystem: 'Android',
//                 condition: 'like_new',
//                 networkType: '5G',
//                 color: 'Titanium Gray',
//             }),

//             base({
//                 product_name: 'Samsung Galaxy A55 128GB',
//                 category: 'Electronics',
//                 subcategory: 'smartphones',
//                 price: 1300,
//                 description:
//                     'هاتف سامسونج A55 مساحة 128 جيجا.',
//                 type: 'smartphones',
//                 brand: 'Samsung',
//                 model: 'Galaxy A55',
//                 storage: 128,
//                 ram: 8,
//                 screenSize: 6.6,
//                 operatingSystem: 'Android',
//                 condition: 'good',
//                 networkType: '5G',
//                 color: 'Blue',
//             }),

//             base({
//                 product_name: 'Xiaomi Redmi Note 13 Pro 256GB',
//                 category: 'Electronics',
//                 subcategory: 'smartphones',
//                 price: 1100,
//                 description:
//                     'شاومي ريدمي نوت 13 برو سعة 256 جيجا.',
//                 type: 'smartphones',
//                 brand: 'Xiaomi',
//                 model: 'Redmi Note 13 Pro',
//                 storage: 256,
//                 ram: 8,
//                 screenSize: 6.67,
//                 operatingSystem: 'Android',
//                 condition: 'good',
//                 networkType: '5G',
//                 color: 'Black',
//             }),

//             base({
//                 product_name: 'MacBook Pro M3 16GB 512GB',
//                 category: 'Electronics',
//                 subcategory: 'laptops',
//                 price: 6200,
//                 description:
//                     'MacBook Pro بمعالج M3، رام 16 جيجا وتخزين 512 جيجا.',
//                 type: 'laptops',
//                 brand: 'Apple',
//                 model: 'MacBook Pro M3',
//                 processor: 'Apple M3',
//                 ram: 16,
//                 storage: 512,
//                 screenSize: 14,
//                 operatingSystem: 'macOS',
//                 condition: 'like_new',
//                 color: 'Space Gray',
//             }),

//             base({
//                 product_name: 'Lenovo ThinkPad 16GB 512GB',
//                 category: 'Electronics',
//                 subcategory: 'laptops',
//                 price: 2200,
//                 description:
//                     'لابتوب Lenovo ThinkPad مناسب للعمل والدراسة.',
//                 type: 'laptops',
//                 brand: 'Lenovo',
//                 model: 'ThinkPad',
//                 processor: 'Intel Core i5',
//                 ram: 16,
//                 storage: 512,
//                 screenSize: 14,
//                 operatingSystem: 'Windows',
//                 condition: 'good',
//             }),

//             base({
//                 product_name: 'iPad Air 256GB',
//                 category: 'Electronics',
//                 subcategory: 'tablets',
//                 price: 2500,
//                 description:
//                     'آيباد Air مساحة 256 جيجا بحالة ممتازة.',
//                 type: 'tablets',
//                 brand: 'Apple',
//                 model: 'iPad Air',
//                 storage: 256,
//                 ram: 8,
//                 screenSize: 10.9,
//                 operatingSystem: 'iPadOS',
//                 condition: 'excellent',
//             }),

//             base({
//                 product_name: 'AirPods Pro 2',
//                 category: 'Electronics',
//                 subcategory: 'audio',
//                 price: 700,
//                 description:
//                     'سماعات Apple AirPods Pro الجيل الثاني.',
//                 type: 'audio',
//                 brand: 'Apple',
//                 model: 'AirPods Pro 2',
//                 condition: 'like_new',
//                 networkType: 'Bluetooth',
//             }),

//             base({
//                 product_name: 'Sony WH-1000XM5',
//                 category: 'Electronics',
//                 subcategory: 'audio',
//                 price: 1100,
//                 description:
//                     'سماعات Sony لاسلكية مع عزل ضوضاء.',
//                 type: 'audio',
//                 brand: 'Sony',
//                 model: 'WH-1000XM5',
//                 condition: 'excellent',
//                 networkType: 'Bluetooth',
//             }),

//             // =====================================================
//             // CARS
//             // =====================================================

//             base({
//                 product_name: 'Toyota Corolla 2022 Gasoline',
//                 category: 'Cars',
//                 subcategory: 'private',
//                 price: 78000,
//                 description:
//                     'تويوتا كورولا 2022 بنزين، سيارة عائلية اقتصادية.',
//                 location: 'ام الفحم',
//                 type: 'private',
//                 brand: 'Toyota',
//                 year: 2022,
//                 fuel: 'gasoline',
//                 mileage: 55000,
//                 color: 'White',
//             }),

//             base({
//                 product_name: 'Toyota Corolla 2020 Hybrid',
//                 category: 'Cars',
//                 subcategory: 'private',
//                 price: 69000,
//                 description:
//                     'Toyota Corolla 2020 Hybrid اقتصادية في استهلاك الوقود.',
//                 type: 'private',
//                 brand: 'Toyota',
//                 year: 2020,
//                 fuel: 'hybrid',
//                 mileage: 85000,
//                 color: 'Silver',
//             }),

//             base({
//                 product_name: 'יונדאי טוסון 2021',
//                 category: 'Cars',
//                 subcategory: 'private',
//                 price: 85000,
//                 description:
//                     'יונדאי טוסון 2021, רכב משפחתי במצב מצוין.',
//                 type: 'private',
//                 brand: 'Hyundai',
//                 year: 2021,
//                 fuel: 'gasoline',
//                 mileage: 65000,
//                 color: 'Black',
//             }),

//             base({
//                 product_name: 'Hyundai Tucson 2022',
//                 category: 'Cars',
//                 subcategory: 'private',
//                 price: 92000,
//                 description:
//                     'Hyundai Tucson 2022 gasoline.',
//                 type: 'private',
//                 brand: 'Hyundai',
//                 year: 2022,
//                 fuel: 'gasoline',
//                 mileage: 45000,
//                 color: 'White',
//             }),

//             base({
//                 product_name: 'BMW 320i 2021',
//                 category: 'Cars',
//                 subcategory: 'private',
//                 price: 125000,
//                 description:
//                     'BMW 320i موديل 2021، بنزين، بحالة ممتازة.',
//                 type: 'private',
//                 brand: 'BMW',
//                 year: 2021,
//                 fuel: 'gasoline',
//                 mileage: 50000,
//                 color: 'Black',
//             }),

//             base({
//                 product_name: 'Mercedes C200 2020',
//                 category: 'Cars',
//                 subcategory: 'private',
//                 price: 118000,
//                 description:
//                     'Mercedes C200 2020 gasoline.',
//                 type: 'private',
//                 brand: 'Mercedes',
//                 year: 2020,
//                 fuel: 'gasoline',
//                 mileage: 70000,
//                 color: 'Gray',
//             }),

//             base({
//                 product_name: 'Kia Niro 2022 Hybrid',
//                 category: 'Cars',
//                 subcategory: 'private',
//                 price: 90000,
//                 description:
//                     'Kia Niro 2022 hybrid.',
//                 type: 'private',
//                 brand: 'Kia',
//                 year: 2022,
//                 fuel: 'hybrid',
//                 mileage: 42000,
//                 color: 'White',
//             }),

//             base({
//                 product_name: 'Tesla Model 3 2022',
//                 category: 'Cars',
//                 subcategory: 'electric',
//                 price: 115000,
//                 description:
//                     'Tesla Model 3 كهربائية موديل 2022.',
//                 type: 'electric',
//                 brand: 'Tesla',
//                 year: 2022,
//                 batteryCapacity: 75,
//                 rangeKm: 500,
//                 mileage: 38000,
//                 color: 'White',
//             }),

//             // =====================================================
//             // GARDEN
//             // =====================================================

//             base({
//                 product_name: 'نبات داخلي Monstera',
//                 category: 'Garden',
//                 subcategory: 'plants',
//                 price: 120,
//                 description:
//                     'نبتة مونستيرا جميلة مناسبة للمنزل.',
//                 type: 'plants',
//                 plantType: 'Monstera',
//                 season: 'All year',
//                 sunExposure: 'Partial shade',
//             }),

//             base({
//                 product_name: 'زيتونة للحديقة',
//                 category: 'Garden',
//                 subcategory: 'plants',
//                 price: 300,
//                 description:
//                     'شجرة زيتون مناسبة للحدائق.',
//                 type: 'plants',
//                 plantType: 'Olive',
//                 season: 'Summer',
//                 sunExposure: 'Full sun',
//             }),

//             base({
//                 product_name: 'خرطوم مياه 30 متر',
//                 category: 'Garden',
//                 subcategory: 'watering',
//                 price: 180,
//                 description:
//                     'خرطوم مياه للحديقة بطول 30 متر.',
//                 type: 'watering',
//                 hoseLength: 30,
//                 automatic: false,
//             }),

//             base({
//                 product_name: 'نظام ري أوتوماتيكي',
//                 category: 'Garden',
//                 subcategory: 'watering',
//                 price: 450,
//                 description:
//                     'מערכת השקיה אוטומטית לגינה.',
//                 type: 'watering',
//                 hoseLength: 50,
//                 automatic: true,
//             }),

//             base({
//                 product_name: 'مقص أغصان احترافي',
//                 category: 'Garden',
//                 subcategory: 'tools',
//                 price: 140,
//                 description:
//                     'أداة لتقليم الأشجار والأغصان.',
//                 type: 'tools',
//                 brand: 'STIHL',
//                 toolType: 'Pruning',
//             }),

//             base({
//                 product_name: 'أدوات حفر للحديقة',
//                 category: 'Garden',
//                 subcategory: 'tools',
//                 price: 250,
//                 description:
//                     'مجموعة أدوات حفر وزراعة.',
//                 type: 'tools',
//                 brand: 'STIHL',
//                 toolType: 'Digging',
//             }),

//             base({
//                 product_name: 'طقم أثاث حديقة',
//                 category: 'Garden',
//                 subcategory: 'outdoorDecor',
//                 price: 1800,
//                 description:
//                     'طقم أثاث خارجي للحديقة.',
//                 type: 'outdoorDecor',
//                 weatherResistant: true,
//             }),

//             // =====================================================
//             // HOUSE
//             // =====================================================

//             base({
//                 product_name: 'خلاط مطبخ Bosch',
//                 category: 'House',
//                 subcategory: 'kitchen',
//                 price: 550,
//                 description:
//                     'خلاط مطبخ Bosch قوي 500W.',
//                 type: 'kitchen',
//                 brand: 'Bosch',
//                 material: 'Stainless Steel',
//                 powerWatts: 500,
//             }),

//             base({
//                 product_name: 'ماكينة قهوة DeLonghi',
//                 category: 'House',
//                 subcategory: 'kitchen',
//                 price: 900,
//                 description:
//                     'ماكينة قهوة منزلية من DeLonghi.',
//                 type: 'kitchen',
//                 brand: 'DeLonghi',
//                 material: 'Stainless Steel',
//                 powerWatts: 1450,
//             }),

//             base({
//                 product_name: 'خزانة تخزين كبيرة',
//                 category: 'House',
//                 subcategory: 'storage',
//                 price: 700,
//                 description:
//                     'خزانة تخزين كبيرة للمنزل.',
//                 type: 'storage',
//                 material: 'Wood',
//                 color: 'White',
//                 dimensions: '180x80x40 cm',
//             }),

//             base({
//                 product_name: 'مرآة ديكور دائرية',
//                 category: 'House',
//                 subcategory: 'decor',
//                 price: 220,
//                 description:
//                     'مرآة دائرية للديكور المنزلي.',
//                 type: 'decor',
//                 material: 'Glass',
//                 color: 'Gold',
//                 dimensions: '80 cm',
//             }),

//             base({
//                 product_name: 'أدوات صيانة منزلية',
//                 category: 'House',
//                 subcategory: 'maintenance',
//                 price: 350,
//                 description:
//                     'مجموعة أدوات صيانة للمنزل.',
//                 type: 'maintenance',
//                 usageType: 'Home repair',
//             }),

//             // =====================================================
//             // BIKES
//             // =====================================================

//             base({
//                 product_name: 'دراجة جبلية Mountain Bike',
//                 category: 'Bikes',
//                 subcategory: 'mountain',
//                 price: 1200,
//                 description:
//                     'دراجة جبلية قوية للطرق الوعرة.',
//                 type: 'mountain',
//                 frameSize: 'M',
//                 color: 'Black',
//                 suspension: true,
//             }),

//             base({
//                 product_name: 'دراجة جبلية 29 إنش',
//                 category: 'Bikes',
//                 subcategory: 'mountain',
//                 price: 1800,
//                 description:
//                     'Mountain bike 29 inch.',
//                 type: 'mountain',
//                 frameSize: 'L',
//                 color: 'Red',
//                 suspension: true,
//             }),

//             base({
//                 product_name: 'دراجة طريق Road Bike',
//                 category: 'Bikes',
//                 subcategory: 'road',
//                 price: 2200,
//                 description:
//                     'دراجة طريق خفيفة وسريعة.',
//                 type: 'road',
//                 frameSize: 'M',
//                 color: 'Blue',
//                 weight: 8.5,
//             }),

//             base({
//                 product_name: 'دراجة أطفال',
//                 category: 'Bikes',
//                 subcategory: 'kids',
//                 price: 400,
//                 description:
//                     'دراجة أطفال مناسبة من 6 إلى 10 سنوات.',
//                 type: 'kids',
//                 frameSize: 'S',
//                 color: 'Green',
//             }),

//             // =====================================================
//             // TRUCKS
//             // =====================================================

//             base({
//                 product_name: 'Toyota Hilux Light Truck',
//                 category: 'Trucks',
//                 subcategory: 'light',
//                 price: 110000,
//                 description:
//                     'شاحنة خفيفة Toyota Hilux.',
//                 type: 'light',
//                 brand: 'Toyota',
//                 loadCapacityTons: 1,
//             }),

//             base({
//                 product_name: 'Mercedes Heavy Truck',
//                 category: 'Trucks',
//                 subcategory: 'heavy',
//                 price: 280000,
//                 description:
//                     'شاحنة مرسيدس ثقيلة.',
//                 type: 'heavy',
//                 brand: 'Mercedes',
//                 loadCapacityTons: 15,
//                 axles: 3,
//             }),

//             base({
//                 product_name: 'Volvo FH Truck',
//                 category: 'Trucks',
//                 subcategory: 'heavy',
//                 price: 320000,
//                 description:
//                     'Volvo FH heavy truck.',
//                 type: 'heavy',
//                 brand: 'Volvo',
//                 loadCapacityTons: 18,
//                 axles: 4,
//             }),

//             // =====================================================
//             // ELECTRIC VEHICLES
//             // =====================================================

//             base({
//                 product_name: 'Xiaomi Electric Scooter',
//                 category: 'ElectricVehicles',
//                 subcategory: 'scooters',
//                 price: 2200,
//                 description:
//                     'سكوتر كهربائي Xiaomi بمدى 40 كم.',
//                 type: 'scooters',
//                 brand: 'Xiaomi',
//                 batteryCapacity: 12,
//                 rangeKm: 40,
//             }),

//             base({
//                 product_name: 'Segway Electric Scooter',
//                 category: 'ElectricVehicles',
//                 subcategory: 'scooters',
//                 price: 3000,
//                 description:
//                     'Segway electric scooter.',
//                 type: 'scooters',
//                 brand: 'Segway',
//                 batteryCapacity: 15,
//                 rangeKm: 50,
//             }),

//             base({
//                 product_name: 'Tesla Electric Car',
//                 category: 'ElectricVehicles',
//                 subcategory: 'cars',
//                 price: 120000,
//                 description:
//                     'سيارة كهربائية Tesla.',
//                 type: 'cars',
//                 brand: 'Tesla',
//                 batteryCapacity: 75,
//                 rangeKm: 500,
//             }),

//             // =====================================================
//             // MEN CLOTHES
//             // =====================================================

//             base({
//                 product_name: 'قميص رجالي Casual',
//                 category: 'MenClothes',
//                 subcategory: 'casual',
//                 price: 120,
//                 description:
//                     'قميص رجالي كاجوال.',
//                 type: 'casual',
//                 size: 'L',
//                 material: 'Cotton',
//                 color: 'Blue',
//             }),

//             base({
//                 product_name: 'بدلة رجالية رسمية',
//                 category: 'MenClothes',
//                 subcategory: 'formal',
//                 price: 850,
//                 description:
//                     'بدلة رجالية رسمية أنيقة.',
//                 type: 'formal',
//                 size: 'L',
//                 material: 'Wool',
//                 color: 'Black',
//             }),

//             base({
//                 product_name: 'Nike Air Max Men',
//                 category: 'MenClothes',
//                 subcategory: 'shoes',
//                 price: 450,
//                 description:
//                     'حذاء Nike Air Max للرجال.',
//                 type: 'shoes',
//                 size: '43',
//                 material: 'Mesh',
//                 color: 'Black',
//             }),

//             // =====================================================
//             // WOMEN CLOTHES
//             // =====================================================

//             base({
//                 product_name: 'فستان نسائي أسود',
//                 category: 'WomenClothes',
//                 subcategory: 'dresses',
//                 price: 300,
//                 description:
//                     'فستان نسائي أسود أنيق.',
//                 type: 'dresses',
//                 size: 'M',
//                 material: 'Cotton',
//                 color: 'Black',
//                 length: 'Long',
//             }),

//             base({
//                 product_name: 'فستان سهرة أحمر',
//                 category: 'WomenClothes',
//                 subcategory: 'dresses',
//                 price: 600,
//                 description:
//                     'فستان سهرة أحمر للمناسبات.',
//                 type: 'dresses',
//                 size: 'L',
//                 material: 'Silk',
//                 color: 'Red',
//                 length: 'Long',
//             }),

//             base({
//                 product_name: 'Nike Women Shoes',
//                 category: 'WomenClothes',
//                 subcategory: 'shoes',
//                 price: 400,
//                 description:
//                     'حذاء Nike نسائي.',
//                 type: 'shoes',
//                 size: '39',
//                 material: 'Mesh',
//                 color: 'White',
//                 heelHeight: 0,
//             }),

//             // =====================================================
//             // WOMEN BAGS
//             // =====================================================

//             base({
//                 product_name: 'شنطة يد نسائية جلد',
//                 category: 'WomenBags',
//                 subcategory: 'handbags',
//                 price: 500,
//                 description:
//                     'شنطة يد جلد نسائية.',
//                 type: 'handbags',
//                 size: 'Medium',
//                 material: 'Leather',
//                 color: 'Black',
//             }),

//             base({
//                 product_name: 'Tote Bag Large',
//                 category: 'WomenBags',
//                 subcategory: 'toteBags',
//                 price: 350,
//                 description:
//                     'Large women tote bag.',
//                 type: 'toteBags',
//                 size: 'Large',
//                 material: 'Leather',
//                 color: 'Brown',
//             }),

//             base({
//                 product_name: 'شنطة ظهر نسائية',
//                 category: 'WomenBags',
//                 subcategory: 'backpacks',
//                 price: 280,
//                 description:
//                     'شنطة ظهر عملية.',
//                 type: 'backpacks',
//                 size: 'Large',
//                 material: 'Nylon',
//                 color: 'Black',
//             }),

//             base({
//                 product_name: 'Clutch Evening Bag',
//                 category: 'WomenBags',
//                 subcategory: 'clutches',
//                 price: 220,
//                 description:
//                     'شنطة صغيرة للمناسبات.',
//                 type: 'clutches',
//                 size: 'Small',
//                 material: 'Leather',
//                 color: 'Gold',
//             }),

//             // =====================================================
//             // BABY
//             // =====================================================

//             base({
//                 product_name: 'ملابس أطفال حديثي الولادة',
//                 category: 'Baby',
//                 subcategory: 'clothes',
//                 price: 100,
//                 description:
//                     'ملابس أطفال قطنية من 0 إلى 6 أشهر.',
//                 type: 'clothes',
//                 ageGroup: '0-6 months',
//                 material: 'Cotton',
//             }),

//             base({
//                 product_name: 'Baby Feeding Bottle Philips Avent',
//                 category: 'Baby',
//                 subcategory: 'feeding',
//                 price: 80,
//                 description:
//                     'رضاعة أطفال Philips Avent.',
//                 type: 'feeding',
//                 ageGroup: '0-6 months',
//                 brand: 'Philips Avent',
//                 material: 'Plastic',
//             }),

//             base({
//                 product_name: 'Baby Care Set',
//                 category: 'Baby',
//                 subcategory: 'care',
//                 price: 150,
//                 description:
//                     'مجموعة عناية للطفل.',
//                 type: 'care',
//                 material: 'Plastic',
//             }),

//             // =====================================================
//             // KIDS
//             // =====================================================

//             base({
//                 product_name: 'لعبة تعليمية للأطفال',
//                 category: 'Kids',
//                 subcategory: 'educational',
//                 price: 120,
//                 description:
//                     'لعبة تعليمية لتنمية مهارات الطفل.',
//                 type: 'educational',
//                 ageGroup: '4-7 years',
//                 safeMaterial: true,
//             }),

//             base({
//                 product_name: 'LEGO Building Set',
//                 category: 'Kids',
//                 subcategory: 'toys',
//                 price: 250,
//                 description:
//                     'LEGO construction toy.',
//                 type: 'toys',
//                 ageGroup: '6-12 years',
//                 safeMaterial: true,
//             }),

//             base({
//                 product_name: 'Kids Outdoor Scooter',
//                 category: 'Kids',
//                 subcategory: 'outdoor',
//                 price: 300,
//                 description:
//                     'سكوتر أطفال للعب في الخارج.',
//                 type: 'outdoor',
//                 ageGroup: '6-10 years',
//                 safeMaterial: true,
//             }),

//             // =====================================================
//             // HEALTH
//             // =====================================================

//             base({
//                 product_name: 'Electric Toothbrush',
//                 category: 'Health',
//                 subcategory: 'personalCare',
//                 price: 180,
//                 description:
//                     'فرشاة أسنان كهربائية.',
//                 type: 'personalCare',
//                 brand: 'Oral-B',
//                 expiryDate: '2028-12-31',
//             }),

//             base({
//                 product_name: 'Digital Blood Pressure Monitor',
//                 category: 'Health',
//                 subcategory: 'medical',
//                 price: 250,
//                 description:
//                     'جهاز قياس ضغط الدم الرقمي.',
//                 type: 'medical',
//                 brand: 'Omron',
//                 expiryDate: '2030-12-31',
//             }),

//             base({
//                 product_name: 'Dumbbell Set 20KG',
//                 category: 'Health',
//                 subcategory: 'fitness',
//                 price: 350,
//                 description:
//                     'مجموعة أوزان رياضية 20 كيلو.',
//                 type: 'fitness',
//                 brand: 'Generic',
//             }),

//             // =====================================================
//             // BEAUTY
//             // =====================================================

//             base({
//                 product_name: 'Maybelline Makeup Set',
//                 category: 'Beauty',
//                 subcategory: 'makeup',
//                 price: 220,
//                 description:
//                     'مجموعة مكياج Maybelline.',
//                 type: 'makeup',
//                 brand: 'Maybelline',
//                 expiryDate: '2028-06-30',
//             }),

//             base({
//                 product_name: 'La Roche Posay Skincare',
//                 category: 'Beauty',
//                 subcategory: 'skincare',
//                 price: 180,
//                 description:
//                     'منتجات عناية بالبشرة.',
//                 type: 'skincare',
//                 brand: 'La Roche Posay',
//                 expiryDate: '2028-08-31',
//             }),

//             base({
//                 product_name: 'Dyson Hair Dryer',
//                 category: 'Beauty',
//                 subcategory: 'hair',
//                 price: 1600,
//                 description:
//                     'مجفف شعر Dyson.',
//                 type: 'hair',
//                 brand: 'Dyson',
//             }),

//             // =====================================================
//             // WATCHES
//             // =====================================================

//             base({
//                 product_name: 'Casio Classic Watch',
//                 category: 'Watches',
//                 subcategory: 'classic',
//                 price: 250,
//                 description:
//                     'ساعة Casio كلاسيكية.',
//                 type: 'classic',
//                 brand: 'Casio',
//                 waterResistant: true,
//             }),

//             base({
//                 product_name: 'Apple Watch Series 9',
//                 category: 'Watches',
//                 subcategory: 'smart',
//                 price: 1300,
//                 description:
//                     'Apple Watch Series 9.',
//                 type: 'smart',
//                 brand: 'Apple',
//                 waterResistant: true,
//             }),

//             base({
//                 product_name: 'Rolex Classic Watch',
//                 category: 'Watches',
//                 subcategory: 'classic',
//                 price: 25000,
//                 description:
//                     'ساعة Rolex كلاسيكية.',
//                 type: 'classic',
//                 brand: 'Rolex',
//                 waterResistant: true,
//             }),

//             // =====================================================
//             // CLEANING
//             // =====================================================

//             base({
//                 product_name: 'Ariel Laundry Detergent 2L',
//                 category: 'Cleaning',
//                 subcategory: 'detergents',
//                 price: 35,
//                 description:
//                     'مسحوق غسيل Ariel حجم 2 لتر.',
//                 type: 'detergents',
//                 brand: 'Ariel',
//                 volume: 2,
//             }),

//             base({
//                 product_name: 'ممسحة أرضيات احترافية',
//                 category: 'Cleaning',
//                 subcategory: 'tools',
//                 price: 100,
//                 description:
//                     'ممسحة لتنظيف الأرضيات.',
//                 type: 'tools',
//                 brand: 'Vileda',
//             }),

//             base({
//                 product_name: 'Disinfectant 1L',
//                 category: 'Cleaning',
//                 subcategory: 'disinfection',
//                 price: 30,
//                 description:
//                     'مطهر منزلي 1 لتر.',
//                 type: 'disinfection',
//                 brand: 'Sano',
//                 volume: 1,
//             }),

//             // =====================================================
//             // MOTORCYCLES
//             // =====================================================

//             base({
//                 product_name: 'Honda CB500 2021',
//                 category: 'Motorcycles',
//                 subcategory: 'street',
//                 price: 32000,
//                 description:
//                     'Honda CB500 street motorcycle.',
//                 type: 'street',
//                 brand: 'Honda',
//                 year: 2021,
//                 engineCapacity: 500,
//                 mileage: 25000,
//                 fuel: 'gasoline',
//                 color: 'Red',
//             }),

//             base({
//                 product_name: 'Yamaha R6 2020',
//                 category: 'Motorcycles',
//                 subcategory: 'sport',
//                 price: 48000,
//                 description:
//                     'Yamaha R6 sport motorcycle.',
//                 type: 'sport',
//                 brand: 'Yamaha',
//                 year: 2020,
//                 engineCapacity: 600,
//                 mileage: 18000,
//                 fuel: 'gasoline',
//                 color: 'Blue',
//             }),

//             base({
//                 product_name: 'Harley Davidson Cruiser',
//                 category: 'Motorcycles',
//                 subcategory: 'cruiser',
//                 price: 75000,
//                 description:
//                     'Harley Davidson cruiser.',
//                 type: 'cruiser',
//                 brand: 'Harley Davidson',
//                 year: 2021,
//                 engineCapacity: 1200,
//                 mileage: 22000,
//                 fuel: 'gasoline',
//                 color: 'Black',
//             }),

//             base({
//                 product_name: 'Honda Off Road Bike',
//                 category: 'Motorcycles',
//                 subcategory: 'offRoad',
//                 price: 29000,
//                 description:
//                     'Honda off road motorcycle.',
//                 type: 'offRoad',
//                 brand: 'Honda',
//                 year: 2022,
//                 engineCapacity: 450,
//                 mileage: 9000,
//                 fuel: 'gasoline',
//             }),

//             base({
//                 product_name: 'Yamaha Scooter 2022',
//                 category: 'Motorcycles',
//                 subcategory: 'scooter',
//                 price: 18000,
//                 description:
//                     'Yamaha scooter 2022.',
//                 type: 'scooter',
//                 brand: 'Yamaha',
//                 year: 2022,
//                 engineCapacity: 300,
//                 mileage: 12000,
//                 fuel: 'gasoline',
//             }),

//             // =====================================================
//             // ART
//             // =====================================================

//             base({
//                 product_name: 'لوحة زيتية طبيعية',
//                 category: 'Art',
//                 subcategory: 'paintings',
//                 price: 1200,
//                 description:
//                     'لوحة فنية زيتية مرسومة يدويًا.',
//                 type: 'paintings',
//                 artist: 'Ahmad Khalil',
//                 creationYear: 2024,
//                 dimensions: '80x120 cm',
//                 technique: 'Oil',
//                 certificate: true,
//                 framed: true,
//             }),

//             base({
//                 product_name: 'تمثال رخامي',
//                 category: 'Art',
//                 subcategory: 'sculptures',
//                 price: 2500,
//                 description:
//                     'تمثال رخامي فني.',
//                 type: 'sculptures',
//                 artist: 'Unknown',
//                 creationYear: 2020,
//                 dimensions: '50x30x30 cm',
//                 technique: 'Marble',
//                 certificate: false,
//             }),

//             base({
//                 product_name: 'صورة فوتوغرافية للمدينة',
//                 category: 'Art',
//                 subcategory: 'photography',
//                 price: 500,
//                 description:
//                     'تصوير فني للمدينة.',
//                 type: 'photography',
//                 artist: 'Mohammad',
//                 creationYear: 2025,
//                 dimensions: '60x40 cm',
//                 technique: 'Photography',
//             }),

//             base({
//                 product_name: 'قطعة Collectible قديمة',
//                 category: 'Art',
//                 subcategory: 'collectibles',
//                 price: 1800,
//                 description:
//                     'قطعة تجميعية قديمة ونادرة.',
//                 type: 'collectibles',
//                 creationYear: 1995,
//                 condition: 'Excellent',
//                 certificate: true,
//                 provenance: 'Private collection',
//             }),

//             // =====================================================
//             // GAMING
//             // =====================================================

//             base({
//                 product_name: 'PlayStation 5',
//                 category: 'Gaming',
//                 subcategory: 'consoles',
//                 price: 1800,
//                 description:
//                     'بلايستيشن 5 بحالة ممتازة.',
//                 type: 'consoles',
//                 platform: 'PlayStation',
//                 edition: 'Standard',
//                 multiplayer: true,
//             }),

//             base({
//                 product_name: 'PlayStation 5 Slim',
//                 category: 'Gaming',
//                 subcategory: 'consoles',
//                 price: 2000,
//                 description:
//                     'PS5 Slim جديد تقريبًا.',
//                 type: 'consoles',
//                 platform: 'PlayStation',
//                 edition: 'Slim',
//                 multiplayer: true,
//             }),

//             base({
//                 product_name: 'FIFA 25 PS5',
//                 category: 'Gaming',
//                 subcategory: 'games',
//                 price: 180,
//                 description:
//                     'لعبة FIFA 25 للبلايستيشن 5.',
//                 type: 'games',
//                 platform: 'PlayStation',
//                 genre: 'Sports',
//                 releaseYear: 2024,
//                 multiplayer: true,
//             }),

//             base({
//                 product_name: 'Xbox Series X',
//                 category: 'Gaming',
//                 subcategory: 'consoles',
//                 price: 1900,
//                 description:
//                     'Xbox Series X.',
//                 type: 'consoles',
//                 platform: 'Xbox',
//                 edition: 'Standard',
//                 multiplayer: true,
//             }),

//             base({
//                 product_name: 'Nintendo Switch OLED',
//                 category: 'Gaming',
//                 subcategory: 'consoles',
//                 price: 1400,
//                 description:
//                     'Nintendo Switch OLED.',
//                 type: 'consoles',
//                 platform: 'Nintendo',
//                 edition: 'OLED',
//                 multiplayer: true,
//             }),

//             base({
//                 product_name: 'Gaming Keyboard RGB',
//                 category: 'Gaming',
//                 subcategory: 'accessories',
//                 price: 300,
//                 description:
//                     'لوحة مفاتيح Gaming RGB.',
//                 type: 'accessories',
//                 platform: 'PC',
//             }),

//             // =====================================================
//             // REAL ESTATE
//             // =====================================================

//             base({
//                 product_name: 'شقة للبيع 4 غرف',
//                 category: 'RealEstate',
//                 subcategory: 'apartment',
//                 price: 850000,
//                 description:
//                     'شقة للبيع، أربع غرف، موقف سيارة ومصعد.',
//                 location: 'ام الفحم',
//                 type: 'apartment',
//                 area: 120,
//                 rooms: 4,
//                 bathrooms: 2,
//                 floors: 1,
//                 hasParking: true,
//                 hasElevator: true,
//                 furnished: false,
//                 rentalType: 'sale',
//                 propertyAge: 5,
//                 geoLocation: {
//                     type: 'Point',
//                     coordinates: [35.3219, 32.5175],
//                 },
//             }),

//             base({
//                 product_name: 'شقة للإيجار 3 غرف',
//                 category: 'RealEstate',
//                 subcategory: 'apartment',
//                 price: 3200,
//                 description:
//                     'شقة للإيجار ثلاث غرف.',
//                 location: 'ام الفحم',
//                 type: 'apartment',
//                 area: 95,
//                 rooms: 3,
//                 bathrooms: 1,
//                 floors: 2,
//                 hasParking: true,
//                 hasElevator: true,
//                 furnished: false,
//                 rentalType: 'rent',
//                 propertyAge: 8,
//                 geoLocation: {
//                     type: 'Point',
//                     coordinates: [35.3219, 32.5175],
//                 },
//             }),

//             base({
//                 product_name: 'بيت مستقل للبيع',
//                 category: 'RealEstate',
//                 subcategory: 'house',
//                 price: 1500000,
//                 description:
//                     'بيت مستقل للبيع مع حديقة وموقف.',
//                 location: 'ام الفحم',
//                 type: 'house',
//                 area: 220,
//                 rooms: 6,
//                 bathrooms: 3,
//                 floors: 2,
//                 hasParking: true,
//                 furnished: false,
//                 rentalType: 'sale',
//                 propertyAge: 10,
//                 geoLocation: {
//                     type: 'Point',
//                     coordinates: [35.3219, 32.5175],
//                 },
//             }),

//             base({
//                 product_name: 'فيلا فاخرة للبيع',
//                 category: 'RealEstate',
//                 subcategory: 'villa',
//                 price: 2800000,
//                 description:
//                     'فيلا فاخرة مع حديقة ومسبح.',
//                 location: 'حيفا',
//                 type: 'villa',
//                 area: 350,
//                 rooms: 7,
//                 bathrooms: 4,
//                 floors: 2,
//                 hasParking: true,
//                 furnished: true,
//                 rentalType: 'sale',
//                 propertyAge: 3,
//                 geoLocation: {
//                     type: 'Point',
//                     coordinates: [34.9896, 32.7940],
//                 },
//             }),

//             base({
//                 product_name: 'أرض للبيع 500 متر',
//                 category: 'RealEstate',
//                 subcategory: 'land',
//                 price: 700000,
//                 description:
//                     'قطعة أرض للبيع مساحة 500 متر.',
//                 location: 'الناصرة',
//                 type: 'land',
//                 area: 500,
//                 rentalType: 'sale',
//                 geoLocation: {
//                     type: 'Point',
//                     coordinates: [35.3035, 32.6996],
//                 },
//             }),

//             // =====================================================
//             // PETS
//             // =====================================================

//             base({
//                 product_name: 'Golden Retriever Puppy',
//                 category: 'Pets',
//                 subcategory: 'dogs',
//                 price: 2500,
//                 description:
//                     'جرو Golden Retriever لطيف.',
//                 type: 'dogs',
//                 breed: 'Golden Retriever',
//                 age: 4,
//                 gender: 'male',
//                 vaccinated: true,
//                 neutered: false,
//                 microchipped: true,
//                 color: 'Golden',
//                 weight: 12,
//                 temperament: 'Friendly',
//             }),

//             base({
//                 product_name: 'قط شيرازي',
//                 category: 'Pets',
//                 subcategory: 'cats',
//                 price: 1200,
//                 description:
//                     'قط شيرازي جميل وهادئ.',
//                 type: 'cats',
//                 breed: 'Persian',
//                 age: 8,
//                 gender: 'female',
//                 vaccinated: true,
//                 neutered: true,
//                 microchipped: true,
//                 color: 'White',
//                 weight: 4,
//                 temperament: 'Calm',
//             }),

//             base({
//                 product_name: 'عصفور كناري',
//                 category: 'Pets',
//                 subcategory: 'birds',
//                 price: 150,
//                 description:
//                     'كناري أصفر جميل.',
//                 type: 'birds',
//                 breed: 'Canary',
//                 age: 12,
//                 gender: 'male',
//                 vaccinated: false,
//                 color: 'Yellow',
//             }),

//             base({
//                 product_name: 'طعام قطط Royal Canin',
//                 category: 'Pets',
//                 subcategory: 'supplies',
//                 price: 180,
//                 description:
//                     'طعام قطط Royal Canin.',
//                 type: 'supplies',
//                 brand: 'Royal Canin',
//                 size: '10kg',
//                 material: 'Food',
//             }),

//             // =====================================================
//             // FURNITURE
//             // =====================================================

//             base({
//                 product_name: 'كنبة زاوية رمادية',
//                 category: 'Furniture',
//                 subcategory: 'living_room',
//                 price: 2500,
//                 description:
//                     'كنبة زاوية رمادية لغرفة المعيشة.',
//                 type: 'living_room',
//                 material: 'Fabric',
//                 color: 'Gray',
//                 dimensions: '280x180 cm',
//                 condition: 'like_new',
//                 style: 'Modern',
//                 assemblyRequired: false,
//             }),

//             base({
//                 product_name: 'غرفة نوم كاملة',
//                 category: 'Furniture',
//                 subcategory: 'bedroom',
//                 price: 3500,
//                 description:
//                     'غرفة نوم كاملة مع سرير وخزانة.',
//                 type: 'bedroom',
//                 material: 'Wood',
//                 color: 'White',
//                 dimensions: '200x180 cm',
//                 condition: 'good',
//                 style: 'Modern',
//             }),

//             base({
//                 product_name: 'طاولة طعام 6 كراسي',
//                 category: 'Furniture',
//                 subcategory: 'dining',
//                 price: 1800,
//                 description:
//                     'طاولة طعام خشبية مع 6 كراسي.',
//                 type: 'dining',
//                 material: 'Wood',
//                 color: 'Brown',
//                 dimensions: '180x90 cm',
//                 condition: 'good',
//                 style: 'Classic',
//             }),

//             base({
//                 product_name: 'مكتب خشبي للعمل',
//                 category: 'Furniture',
//                 subcategory: 'office',
//                 price: 700,
//                 description:
//                     'مكتب خشبي مناسب للعمل من المنزل.',
//                 type: 'office',
//                 material: 'Wood',
//                 color: 'Brown',
//                 dimensions: '140x70 cm',
//                 condition: 'like_new',
//                 style: 'Modern',
//             }),

//             base({
//                 product_name: 'طقم أثاث خارجي',
//                 category: 'Furniture',
//                 subcategory: 'outdoor',
//                 price: 2200,
//                 description:
//                     'طقم أثاث خارجي مقاوم للطقس.',
//                 type: 'outdoor',
//                 material: 'Metal',
//                 color: 'Black',
//                 condition: 'new',
//                 style: 'Modern',
//             }),

//             base({
//                 product_name: 'خزانة مطبخ خشبية',
//                 category: 'Furniture',
//                 subcategory: 'kitchen',
//                 price: 1500,
//                 description:
//                     'خزانة مطبخ خشبية كبيرة.',
//                 type: 'kitchen',
//                 material: 'Wood',
//                 color: 'White',
//                 condition: 'good',
//                 style: 'Modern',
//             }),
//         ];

//         await Posts.insertMany(posts);

//         console.log(
//             chalk.greenBright(
//                 `Inserted ${posts.length} AI Search test posts successfully.`,
//             ),
//         );

//         // Print category statistics
//         const stats = {};

//         posts.forEach((post) => {
//             stats[post.category] = (stats[post.category] || 0) + 1;
//         });

//         console.log(chalk.cyan('\nPosts by category:'));

//         Object.entries(stats).forEach(([category, count]) => {
//             console.log(
//                 chalk.gray(`  ${category.padEnd(22)} ${count}`),
//             );
//         });

//         console.log(
//             chalk.greenBright(
//                 `\nTotal seeded posts: ${posts.length}`,
//             ),
//         );
//     } catch (error) {
//         console.error(
//             chalk.red('Posts seeding error:'),
//             error,
//         );
//     }
// }


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
