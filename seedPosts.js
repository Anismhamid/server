const mongoose = require('mongoose');
const Post = require('./models/post');

const seedPosts = async () => {
    try {
        const posts = [
            {
                seller: new mongoose.Types.ObjectId(
                    '6980c609317475fe5c733aed'
                ),
                product_name: 'iPhone 15 Pro 256GB',
                category: 'Electronics',
                subcategory: 'smartphones',
                price: 2800,
                description:
                    'iPhone 15 Pro 256GB بحالة ممتازة، يعمل بشكل كامل.',
                image: {
                    url: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800',
                    publicId: 'seed/iphone-15-pro',
                },
                likes: [],
                featured: false,
                sale: false,
                discount: 0,
                location: 'אום אל-פחם',
                in_stock: true,
                status: 'accepted',
                type: 'smartphones',
                brand: 'Apple',
                model: 'iPhone 15 Pro',
                storage: 256,
                ram: 8,
                screenSize: 6.1,
                operatingSystem: 'iOS',
                networkType: '5G',
                color: 'Natural Titanium',
                condition: 'excellent',
                warranty: 'No warranty',
            },

            {
                seller: new mongoose.Types.ObjectId(
                    '6980c609317475fe5c733aed'
                ),
                product_name: 'Samsung Galaxy S24 256GB',
                category: 'Electronics',
                subcategory: 'smartphones',
                price: 2200,
                description: 'Samsung Galaxy S24 256GB بحالة ممتازة.',
                image: {
                    url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800',
                    publicId: 'seed/samsung-s24',
                },
                likes: [],
                featured: false,
                sale: true,
                discount: 10,
                location: 'אום אל-פחם',
                in_stock: true,
                status: 'accepted',
                type: 'smartphones',
                brand: 'Samsung',
                model: 'Galaxy S24',
                storage: 256,
                ram: 8,
                screenSize: 6.2,
                operatingSystem: 'Android',
                networkType: '5G',
                color: 'Black',
                condition: 'like_new',
                warranty: '6 months',
            },

            {
                seller: new mongoose.Types.ObjectId(
                    '6979d4774f1db7cd4a712604'
                ),
                product_name: 'Samsung Galaxy A55 128GB',
                category: 'Electronics',
                subcategory: 'smartphones',
                price: 1200,
                description:
                    'هاتف Samsung Galaxy A55 128GB بحالة جيدة جداً.',
                image: {
                    url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800',
                    publicId: 'seed/samsung-a55',
                },
                likes: [],
                featured: false,
                sale: false,
                discount: 0,
                location: 'אום אל-פחם',
                in_stock: true,
                status: 'accepted',
                type: 'smartphones',
                brand: 'Samsung',
                model: 'Galaxy A55',
                storage: 128,
                ram: 8,
                screenSize: 6.6,
                operatingSystem: 'Android',
                networkType: '5G',
                color: 'Blue',
                condition: 'good',
            },

            {
                seller: new mongoose.Types.ObjectId(
                    '6980c609317475fe5c733aed'
                ),
                product_name: 'Toyota Corolla 2022',
                category: 'Cars',
                subcategory: 'private',
                price: 68000,
                description:
                    'Toyota Corolla 2022 سيارة عائلية اقتصادية بحالة ممتازة.',
                image: {
                    url: 'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=800',
                    publicId: 'seed/toyota-corolla-2022',
                },
                likes: [],
                featured: true,
                sale: false,
                discount: 0,
                location: 'אום אל-פחם',
                in_stock: true,
                status: 'accepted',
                type: 'private',
                brand: 'Toyota',
                year: 2022,
                fuel: 'gasoline',
                mileage: 52000,
                color: 'White',
            },

            {
                seller: new mongoose.Types.ObjectId(
                    '6979d4774f1db7cd4a712604'
                ),
                product_name: 'Hyundai Tucson 2021',
                category: 'Cars',
                subcategory: 'private',
                price: 79000,
                description:
                    'Hyundai Tucson 2021 SUV عائلية بحالة ممتازة.',
                image: {
                    url: 'https://images.unsplash.com/photo-1633500770365-9f2a9a5a4d4c?w=800',
                    publicId: 'seed/hyundai-tucson-2021',
                },
                likes: [],
                featured: false,
                sale: false,
                discount: 0,
                location: 'אום אל-פחם',
                in_stock: true,
                status: 'accepted',
                type: 'private',
                brand: 'Hyundai',
                year: 2021,
                fuel: 'gasoline',
                mileage: 64000,
                color: 'Black',
            },

            {
                seller: new mongoose.Types.ObjectId(
                    '6980c609317475fe5c733aed'
                ),
                product_name: 'Toyota Prius 2020 Hybrid',
                category: 'Cars',
                subcategory: 'private',
                price: 62000,
                description:
                    'Toyota Prius 2020 היברידית חסכונית מאוד בדלק.',
                image: {
                    url: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800',
                    publicId: 'seed/toyota-prius',
                },
                likes: [],
                featured: false,
                sale: true,
                discount: 5,
                location: 'אום אל-פחם',
                in_stock: true,
                status: 'accepted',
                type: 'private',
                brand: 'Toyota',
                year: 2020,
                fuel: 'hybrid',
                mileage: 72000,
                color: 'Silver',
            },

            {
                seller: new mongoose.Types.ObjectId(
                    '6980c609317475fe5c733aed'
                ),
                product_name: 'Yamaha R6 2020',
                category: 'Motorcycles',
                subcategory: 'sport',
                price: 48000,
                description:
                    'Yamaha R6 sport motorcycle موديل 2020 بحالة ممتازة.',
                image: {
                    url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800',
                    publicId: 'seed/yamaha-r6',
                },
                likes: [],
                featured: true,
                sale: false,
                discount: 0,
                location: 'אום אל-פחם',
                in_stock: true,
                status: 'accepted',
                type: 'sport',
                brand: 'Yamaha',
                year: 2020,
                engineCapacity: 600,
                mileage: 18000,
                fuel: 'gasoline',
                color: 'Blue',
            },

            {
                seller: new mongoose.Types.ObjectId(
                    '6979d4774f1db7cd4a712604'
                ),
                product_name: 'Honda Off Road Bike',
                category: 'Motorcycles',
                subcategory: 'offRoad',
                price: 29000,
                description:
                    'Honda off road motorcycle مناسبة للطرق الوعرة.',
                image: {
                    url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800',
                    publicId: 'seed/honda-offroad',
                },
                likes: [],
                featured: false,
                sale: false,
                discount: 0,
                location: 'אום אל-פחם',
                in_stock: true,
                status: 'accepted',
                type: 'offRoad',
                brand: 'Honda',
                year: 2021,
                engineCapacity: 450,
                mileage: 12000,
                fuel: 'gasoline',
                color: 'Red',
            },

            {
                seller: new mongoose.Types.ObjectId(
                    '6980c609317475fe5c733aed'
                ),
                product_name: 'Mountain Bike',
                category: 'Bikes',
                subcategory: 'mountain',
                price: 1800,
                description:
                    'دراجة جبلية قوية مع نظام تعليق أمامي.',
                image: {
                    url: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800',
                    publicId: 'seed/mountain-bike',
                },
                likes: [],
                featured: false,
                sale: false,
                discount: 0,
                location: 'אום אל-פחם',
                in_stock: true,
                status: 'accepted',
                type: 'mountain',
                frameSize: 'M',
                color: 'Black',
                suspension: true,
            },

            {
                seller: new mongoose.Types.ObjectId(
                    '6979d4774f1db7cd4a712604'
                ),
                product_name: 'PlayStation 5',
                category: 'Gaming',
                subcategory: 'consoles',
                price: 1800,
                description:
                    'PlayStation 5 بحالة ممتازة مع يد تحكم.',
                image: {
                    url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800',
                    publicId: 'seed/playstation-5',
                },
                likes: [],
                featured: true,
                sale: false,
                discount: 0,
                location: 'אום אל-פחם',
                in_stock: true,
                status: 'accepted',
                type: 'consoles',
                platform: 'PlayStation',
                edition: 'Standard',
                multiplayer: true,
                language: 'English',
                releaseYear: 2020,
            },

            {
                seller: new mongoose.Types.ObjectId(
                    '6980c609317475fe5c733aed'
                ),
                product_name: 'PlayStation 5 FC 25',
                category: 'Gaming',
                subcategory: 'games',
                price: 180,
                description:
                    'لعبة كرة قدم PlayStation بحالة ممتازة.',
                image: {
                    url: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800',
                    publicId: 'seed/fc25',
                },
                likes: [],
                featured: false,
                sale: false,
                discount: 0,
                location: 'אום אל-פחם',
                in_stock: true,
                status: 'accepted',
                type: 'games',
                platform: 'PlayStation',
                genre: 'Sports',
                multiplayer: true,
                language: 'English',
                releaseYear: 2024,
            },

            {
                seller: new mongoose.Types.ObjectId(
                    '6980c609317475fe5c733aed'
                ),
                product_name: 'Corner Sofa',
                category: 'Furniture',
                subcategory: 'living_room',
                price: 3500,
                description:
                    'كنبة زاوية مريحة لغرفة المعيشة.',
                image: {
                    url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
                    publicId: 'seed/corner-sofa',
                },
                likes: [],
                featured: false,
                sale: true,
                discount: 15,
                location: 'אום אל-פחם',
                in_stock: true,
                status: 'accepted',
                type: 'living_room',
                brand: 'IKEA',
                material: 'Fabric',
                color: 'Gray',
                dimensions: '280x180 cm',
                condition: 'good',
                style: 'Modern',
                assemblyRequired: false,
            },

            {
                seller: new mongoose.Types.ObjectId(
                    '6979d4774f1db7cd4a712604'
                ),
                product_name: 'Dining Table',
                category: 'Furniture',
                subcategory: 'dining',
                price: 2200,
                description:
                    'طاولة طعام خشبية لأربعة إلى ستة أشخاص.',
                image: {
                    url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800',
                    publicId: 'seed/dining-table',
                },
                likes: [],
                featured: false,
                sale: false,
                discount: 0,
                location: 'אום אל-פחם',
                in_stock: true,
                status: 'accepted',
                type: 'dining',
                material: 'Wood',
                color: 'Brown',
                dimensions: '180x90 cm',
                condition: 'like_new',
                style: 'Modern',
            },

            {
                seller: new mongoose.Types.ObjectId(
                    '6980c609317475fe5c733aed'
                ),
                product_name: 'Kitchen Mixer Bosch',
                category: 'House',
                subcategory: 'kitchen',
                price: 650,
                description:
                    'خلاط ومضرب كهربائي Bosch للمطبخ.',
                image: {
                    url: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800',
                    publicId: 'seed/bosch-mixer',
                },
                likes: [],
                featured: false,
                sale: false,
                discount: 0,
                location: 'אום אל-פחם',
                in_stock: true,
                status: 'accepted',
                type: 'kitchen',
                brand: 'Bosch',
                material: 'Stainless Steel',
                powerWatts: 800,
                color: 'Silver',
            },

            {
                seller: new mongoose.Types.ObjectId(
                    '6979d4774f1db7cd4a712604'
                ),
                product_name: 'Garden Shovel',
                category: 'Garden',
                subcategory: 'tools',
                price: 120,
                description:
                    'مجرفة قوية لأعمال الحديقة والحفر.',
                image: {
                    url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
                    publicId: 'seed/garden-shovel',
                },
                likes: [],
                featured: false,
                sale: false,
                discount: 0,
                location: 'אום אל-פחם',
                in_stock: true,
                status: 'accepted',
                type: 'tools',
                brand: 'Stanley',
                toolType: 'Shovel',
                weatherResistant: true,
            },

            {
                seller: new mongoose.Types.ObjectId(
                    '6980c609317475fe5c733aed'
                ),
                product_name: 'Indoor Monstera Plant',
                category: 'Garden',
                subcategory: 'plants',
                price: 150,
                description:
                    'نبتة Monstera جميلة مناسبة للمنزل.',
                image: {
                    url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800',
                    publicId: 'seed/monstera',
                },
                likes: [],
                featured: false,
                sale: false,
                discount: 0,
                location: 'אום אל-פחם',
                in_stock: true,
                status: 'accepted',
                type: 'plants',
                plantType: 'Monstera',
                season: 'All year',
                sunExposure: 'Indirect sunlight',
            },

            {
                seller: new mongoose.Types.ObjectId(
                    '6979d4774f1db7cd4a712604'
                ),
                product_name: 'Apple Watch Series 9',
                category: 'Watches',
                subcategory: 'smart',
                price: 1300,
                description:
                    'Apple Watch Series 9 بحالة ممتازة.',
                image: {
                    url: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=800',
                    publicId: 'seed/apple-watch-9',
                },
                likes: [],
                featured: false,
                sale: false,
                discount: 0,
                location: 'אום אל-פחם',
                in_stock: true,
                status: 'accepted',
                type: 'smart',
                brand: 'Apple',
                waterResistant: true,
            },

            {
                seller: new mongoose.Types.ObjectId(
                    '6980c609317475fe5c733aed'
                ),
                product_name: 'Disinfectant 1L',
                category: 'Cleaning',
                subcategory: 'disinfection',
                price: 30,
                description:
                    'مطهر منزلي 1 لتر للتنظيف والتعقيم.',
                image: {
                    url: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=800',
                    publicId: 'seed/disinfectant-1l',
                },
                likes: [],
                featured: false,
                sale: false,
                discount: 0,
                location: 'אום אל-פחם',
                in_stock: true,
                status: 'accepted',
                type: 'disinfection',
                brand: 'Sano',
                volume: 1,
            },

            {
                seller: new mongoose.Types.ObjectId(
                    '6979d4774f1db7cd4a712604'
                ),
                product_name: 'Men Casual T-Shirt',
                category: 'MenClothes',
                subcategory: 'casual',
                price: 90,
                description:
                    'قميص رجالي كاجوال قطن 100%.',
                image: {
                    url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
                    publicId: 'seed/men-tshirt',
                },
                likes: [],
                featured: false,
                sale: false,
                discount: 0,
                location: 'אום אל-פחם',
                in_stock: true,
                status: 'accepted',
                type: 'casual',
                size: 'L',
                material: 'Cotton',
                color: 'Black',
            },

            {
                seller: new mongoose.Types.ObjectId(
                    '6980c609317475fe5c733aed'
                ),
                product_name: "Women's Evening Dress",
                category: 'WomenClothes',
                subcategory: 'dresses',
                price: 350,
                description:
                    'فستان نسائي أنيق للمناسبات.',
                image: {
                    url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800',
                    publicId: 'seed/women-dress',
                },
                likes: [],
                featured: false,
                sale: true,
                discount: 20,
                location: 'אום אל-פחם',
                in_stock: true,
                status: 'accepted',
                type: 'dresses',
                size: 'M',
                material: 'Polyester',
                color: 'Black',
                length: 'Long',
            },

            {
                seller: new mongoose.Types.ObjectId(
                    '6979d4774f1db7cd4a712604'
                ),
                product_name: 'Modern Apartment 4 Rooms',
                category: 'RealEstate',
                subcategory: 'apartment',
                price: 1250000,
                description:
                    'شقة حديثة للبيع، أربع غرف مع موقف سيارة ومصعد.',
                image: {
                    url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
                    publicId: 'seed/apartment-4-rooms',
                },
                likes: [],
                featured: true,
                sale: false,
                discount: 0,
                location: 'אום אל-פחם',
                in_stock: true,
                status: 'accepted',
                type: 'apartment',
                area: 110,
                rooms: 4,
                bathrooms: 2,
                floors: 1,
                hasParking: true,
                hasElevator: true,
                furnished: false,
                rentalType: 'sale',
                propertyAge: 4,
                geoLocation: {
                    type: 'Point',
                    coordinates: [35.1528, 32.5179],
                },
            },

            {
                seller: new mongoose.Types.ObjectId(
                    '6980c609317475fe5c733aed'
                ),
                product_name: 'Golden Retriever Puppy',
                category: 'Pets',
                subcategory: 'dogs',
                price: 2500,
                description:
                    'جرو Golden Retriever اجتماعي ونشيط.',
                image: {
                    url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800',
                    publicId: 'seed/golden-retriever',
                },
                likes: [],
                featured: false,
                sale: false,
                discount: 0,
                location: 'אום אל-פחם',
                in_stock: true,
                status: 'accepted',
                type: 'dogs',
                breed: 'Golden Retriever',
                age: 8,
                gender: 'male',
                vaccinated: true,
                neutered: false,
                microchipped: true,
                color: 'Golden',
                weight: 12,
                temperament: 'Friendly',
            },
        ];

        const insertedPosts = await Post.insertMany(posts);

        console.log(
            `✅ Inserted ${insertedPosts.length} posts successfully.`
        );

        return insertedPosts;
    } catch (error) {
        console.error('❌ Error seeding posts:', error);
        throw error;
    }
};

module.exports = seedPosts;