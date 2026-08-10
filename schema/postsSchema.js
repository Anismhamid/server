const {
    houseSchema,
    gardenSchema,
    carsSchema,
    bikesSchema,
    trucksSchema,
    electricVehiclesSchema,
    menClothesSchema,
    womenClothesSchema,
    womenBagsSchema,
    babySchema,
    kidsSchema,
    healthSchema,
    beautySchema,
    watchesSchema,
    cleaningSchema,
    artSchema,
    gamingSchema,
    realEstateSchema,
    petsSchema,
    furnitureSchema,
} = require('./categoriesLogic');

const schemas = {
    House: houseSchema,
    Garden: gardenSchema,
    Cars: carsSchema,
    Bikes: bikesSchema,
    Trucks: trucksSchema,
    ElectricVehicles: electricVehiclesSchema,
    MenClothes: menClothesSchema,
    WomenClothes: womenClothesSchema,
    WomenBags: womenBagsSchema,
    Baby: babySchema,
    Kids: kidsSchema,
    Health: healthSchema,
    Beauty: beautySchema,
    Watches: watchesSchema,
    Cleaning: cleaningSchema,
    Art: artSchema,
    Gaming: gamingSchema,
    RealEstate: realEstateSchema,
    Pets: petsSchema,
    Furniture: furnitureSchema,
};

/**
 * ترجع Joi schema لأي فئة حسب category
 * @param {string} category
 *  * @returns Joi.ObjectSchema
 */
function getPostSchema(category) {
    const schema = schemas[category];

    if (!schema) {
        const error = new Error(`Unknown category: ${category}`);
        error.status = 400;
        throw error;
    }

    return schema;
}

module.exports = { getPostSchema };
