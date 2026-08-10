const mongoose = require('mongoose');

// ===== Base Schema لجميع المنتجات =====
const basePostsSchema = new mongoose.Schema(
    {
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
        },
        product_name: { type: String, required: true, trim: true },
        category: { type: String, required: true },
        subcategory: { type: String, required: true },
        price: {
            type: Number,
            required: true,
            min: [1, 'Price must be positive'],
        },
        description: { type: String, maxlength: 500 },
        image: {
            url: { type: String, required: true },
            publicId: { type: String, required: true },
        },
        likes: { type: [String], default: [] },
        reviews: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Users',
                    required: true,
                },

                comment: {
                    type: String,
                    required: true,
                },

                rating: {
                    type: Number,
                    min: 0,
                    max: 5,
                },

                createdAt: {
                    type: Date,
                    default: Date.now,
                },

                updatedAt: {
                    type: Date,
                },
            },
        ],
        featured: { type: Boolean, default: false },
        sale: { type: Boolean, default: false },
        discount: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
        location: { type: String },
        in_stock: { type: Boolean, default: true },
        status: {
            type: String,
            enum: ['pending', 'sold', 'accepted'],
            default: 'pending',
        },
    },
    { timestamps: true, discriminatorKey: 'category' },
);

basePostsSchema.index({ category: 1, subcategory: 1 });
basePostsSchema.index({ category: 1, price: 1 });
basePostsSchema.index({ seller: 1, createdAt: -1 });
basePostsSchema.index({ in_stock: 1, featured: 1, createdAt: -1 });
basePostsSchema.index({ location: 1, category: 1 });

const Posts = mongoose.model('Posts', basePostsSchema);

/* ================== House ================== */
const houseSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['kitchen', 'storage', 'decor', 'maintenance'],
        required: true,
    },
    brand: { type: String },
    material: { type: String },
    color: { type: String },
    dimensions: { type: String },
    capacity: { type: Number },
    powerWatts: { type: Number },
    usageType: { type: String },
});
Posts.discriminator('House', houseSchema);

/* ================== Garden ================== */
const gardenSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['plants', 'watering', 'tools', 'outdoorDecor'],
        required: true,
    },
    brand: { type: String },
    plantType: { type: String },
    season: { type: String },
    sunExposure: { type: String },
    hoseLength: { type: Number },
    automatic: { type: Boolean },
    toolType: { type: String },
    weatherResistant: { type: Boolean },
});
Posts.discriminator('Garden', gardenSchema);

/* ================== Cars ================== */
const carSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['private', 'electric', 'parts'],
        required: true,
    },
    brand: { type: String, required: true },
    year: {
        type: Number,
        required: function () {
            return this.type !== 'parts';
        },
    },
    fuel: {
        type: String,
        enum: ['gasoline', 'diesel', 'hybrid', 'electric'],
        required: function () {
            return this.type === 'private';
        },
    },
    batteryCapacity: { type: Number },
    rangeKm: { type: Number },
    mileage: { type: Number, min: 0 },
    color: { type: String },
});
Posts.discriminator('Cars', carSchema);

/* ================== Bikes ================== */
const bikeSchema = new mongoose.Schema({
    type: { type: String, enum: ['kids', 'mountain', 'road'], required: true },
    frameSize: { type: String, required: true },
    color: { type: String },
    weight: { type: Number }, // للفئة road
    suspension: { type: Boolean }, // للفئة mountain
});
Posts.discriminator('Bikes', bikeSchema);

/* ================== Trucks ================== */
const truckSchema = new mongoose.Schema({
    type: { type: String, enum: ['light', 'heavy'], required: true },
    brand: { type: String, required: true },
    loadCapacityTons: { type: Number, required: true },
    axles: { type: Number }, // للفئة heavy
});
Posts.discriminator('Trucks', truckSchema);

/* ================== Electric Vehicles ================== */
const electricSchema = new mongoose.Schema({
    type: { type: String, enum: ['cars', 'scooters'], required: true },
    brand: { type: String, required: true },
    batteryCapacity: { type: Number },
    rangeKm: { type: Number },
});
Posts.discriminator('ElectricVehicles', electricSchema);

/* ================== Men Clothes ================== */
const menClothesSchema = new mongoose.Schema({
    type: { type: String, enum: ['casual', 'formal', 'shoes'], required: true },
    size: { type: String, required: true },
    material: { type: String },
    color: { type: String },
});
Posts.discriminator('MenClothes', menClothesSchema);

/* ================== Women Clothes ================== */
const womenClothesSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['casual', 'dresses', 'shoes'],
        required: true,
    },
    size: { type: String, required: true },
    material: { type: String },
    color: { type: String },
    length: { type: String },
    heelHeight: { type: Number },
});
Posts.discriminator('WomenClothes', womenClothesSchema);

const womenBagsSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['handbags', 'toteBags', 'backpacks', 'clutches'],
        required: true,
    },
    size: {
        type: String,
        required: true,
    },
    material: { type: String },
    color: { type: String },
    length: { type: String },
    heelHeight: { type: Number },
});
Posts.discriminator('WomenBags', womenBagsSchema);

/* ================== Baby ================== */
const babySchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['clothes', 'care', 'feeding'],
        required: true,
    },
    ageGroup: {
        type: String,
        required: function () {
            return this.type === 'clothes' || this.type === 'feeding';
        },
    }, // للفئة clothes & feeding
    brand: {
        type: String,
        required: function () {
            return this.type === 'feeding';
        },
    },
    material: { type: String },
});
Posts.discriminator('Baby', babySchema);

/* ================== Kids ================== */
const kidsSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['educational', 'toys', 'outdoor'],
        required: true,
    },
    ageGroup: { type: String, required: true },
    safeMaterial: { type: Boolean },
});
Posts.discriminator('Kids', kidsSchema);

/* ================== Health ================== */
const healthSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['personalCare', 'medical', 'fitness'],
        required: true,
    },
    brand: { type: String },
    expiryDate: { type: String }, // للحفاظ على توافق مع categoriesLogic
});
Posts.discriminator('Health', healthSchema);

/* ================== Beauty ================== */
const beautySchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['makeup', 'skincare', 'hair'],
        required: true,
    },
    brand: { type: String },
    expiryDate: { type: String },
});
Posts.discriminator('Beauty', beautySchema);

/* ================== Watches ================== */
const watchesSchema = new mongoose.Schema({
    type: { type: String, enum: ['classic', 'smart', 'hand'], required: true },
    brand: { type: String },
    waterResistant: { type: Boolean },
});
Posts.discriminator('Watches', watchesSchema);

/* ================== Cleaning ================== */
const cleaningSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['detergents', 'tools', 'disinfection'],
        required: true,
    },
    brand: { type: String },
    volume: { type: Number },
});
Posts.discriminator('Cleaning', cleaningSchema);

/* ================== Motorcycles ================== */
const motorcycleSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['street', 'sport', 'cruiser', 'offRoad', 'scooter', 'parts'],
        required: true,
    },
    brand: {
        type: String,
        required: function () {
            return this.type !== 'parts';
        },
    },
    year: {
        type: Number,
        required: function () {
            return this.type !== 'parts';
        },
    },

    engineCapacity: {
        type: Number,
        required: function () {
            return this.type !== 'parts';
        },
    }, // CC
    mileage: { type: Number, min: 0 },
    fuel: {
        type: String,
        enum: ['gasoline', 'electric'],
    },
    color: { type: String },
    partType: {
        type: String,
        required: function () {
            return this.type === 'parts';
        },
    },
});
Posts.discriminator('Motorcycles', motorcycleSchema);

const electronicsSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['smartphones', 'laptops', 'tablets', 'accessories', 'audio'],
        required: true,
    },
    brand: { type: String, required: true },
    model: { type: String },
    processor: { type: String },
    ram: { type: Number }, // GB
    storage: { type: Number }, // GB
    screenSize: { type: Number },
    resolution: { type: String },
    operatingSystem: { type: String },
    condition: {
        type: String,
        enum: ['new', 'like_new', 'excellent', 'good', 'fair'],
        default: 'good',
    },
    batteryLife: { type: Number }, // ساعات
    includedAccessories: [String],
    networkType: {
        type: String,
        enum: ['4G', '5G', 'WiFi', 'Bluetooth'],
    },
    color: { type: String },
    warranty: { type: String },
});
Posts.discriminator('Electronics', electronicsSchema);

const artSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: [
            'paintings',
            'sculptures',
            'photography',
            'crafts',
            'collectibles',
        ],
        required: true,
    },
    artist: { type: String },
    creationYear: { type: Number },
    dimensions: { type: String },
    technique: { type: String }, // مثل: زيتي، أكريليك، مائي
    certificate: { type: Boolean, default: false },
    provenance: { type: String }, // تاريخ القطعة
    condition: { type: String },
    framed: { type: Boolean, default: false },
});
Posts.discriminator('Art', artSchema);

const gamingSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['consoles', 'games', 'accessories', 'pc_gaming'],
        required: true,
    },
    platform: {
        type: String,
        enum: ['PlayStation', 'Xbox', 'Nintendo', 'PC', 'Mobile'],
    },
    genre: { type: String },
    edition: { type: String },
    multiplayer: { type: Boolean, default: false },
    rating: { type: String },
    language: { type: String },
    releaseYear: { type: Number },
});
Posts.discriminator('Gaming', gamingSchema);

const realEstateSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['apartment', 'house', 'villa', 'commercial', 'land'],
        required: true,
    },
    area: { type: Number, required: true }, // بالمتر المربع
    rooms: { type: Number },
    bathrooms: { type: Number },
    floors: { type: Number },
    hasParking: { type: Boolean, default: false },
    hasElevator: { type: Boolean, default: false },
    furnished: { type: Boolean, default: false },
    rentalType: {
        type: String,
        enum: ['sale', 'rent', 'daily'],
        default: 'sale',
    },
    propertyAge: { type: Number }, // بالسنوات
    geoLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    },
});

realEstateSchema.index({
    geoLocation: '2dsphere',
});

Posts.discriminator('RealEstate', realEstateSchema);

const petsSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['dogs', 'cats', 'birds', 'fish', 'small_animals', 'supplies'],
        required: true,
    },
    breed: { type: String },
    age: { type: Number }, // بالشهور
    gender: {
        type: String,
        enum: ['male', 'female'],
    },
    vaccinated: { type: Boolean, default: false },
    neutered: { type: Boolean, default: false },
    microchipped: { type: Boolean, default: false },
    color: { type: String },
    weight: { type: Number }, // كجم
    healthIssues: { type: String },
    temperament: { type: String },
    // للمستلزمات
    brand: { type: String },
    size: { type: String },
    material: { type: String },
});
Posts.discriminator('Pets', petsSchema);

/* ================== Furniture ================== */
const furnitureSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: [
            'living_room',
            'bedroom',
            'dining',
            'office',
            'outdoor',
            'kitchen',
        ],
        required: true,
    },
    brand: { type: String },
    material: { type: String },
    color: { type: String },
    dimensions: { type: String },
    weight: { type: Number },
    assemblyRequired: { type: Boolean, default: false },
    condition: {
        type: String,
        enum: ['new', 'like_new', 'good', 'fair'],
        default: 'good',
    },
    style: { type: String },
    includesAccessories: { type: Boolean, default: false },
});
Posts.discriminator('Furniture', furnitureSchema);

module.exports = Posts;
