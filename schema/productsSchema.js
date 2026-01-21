const {
	houseSchema,
	gardenSchema,
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
} = require("./categoriesLogic");

/**
 * ترجع Joi schema لأي فئة حسب category
 * @param {string} category اسم الفئة
 * @param {string} type (اختياري) الفئة الفرعية
 * @returns Joi.ObjectSchema
 */
function getProductSchema(category, type) {
	const schemas = {
		House: houseSchema,
		Garden: gardenSchema,
		Cars: carsSchema,
		Bikes: bikesSchema,
		Trucks: trucksSchema,
		ElectricVehicles: electricVehiclesSchema,
		MenClothes: menClothesSchema,
		WomenClothes: womenClothesSchema,
		Baby: babySchema,
		Kids: kidsSchema,
		Health: healthSchema,
		Beauty: beautySchema,
		Watches: watchesSchema,
		Cleaning: cleaningSchema,
	};

	if (!schemas[category]) {
		throw new Error(`Unknown category: ${category}`);
	}

	const schema = schemas[category];

	// إذا كانت الفئة تتطلب type كحقل إلزامي
	if (
		[
			"House",
			"Garden",
			"Cars",
			"Bikes",
			"Trucks",
			"ElectricVehicles",
			"MenClothes",
			"WomenClothes",
			"Baby",
			"Kids",
		].includes(category)
	) {
		// إذا لم يتم تمرير type، نرمي خطأ
		if (!type) {
			throw new Error(`type is required for ${category}`);
		}

		// نتحقق من صحة type بناءً على schema
		const typeField = schema.describe().keys.type;
		if (typeField && typeField.flags && typeField.flags.allow) {
			const validTypes = typeField.flags.allow.map((val) => val.value || val);
			if (!validTypes.includes(type)) {
				throw new Error(
					`Invalid type for ${category}. Valid types are: ${validTypes.join(
						", ",
					)}`,
				);
			}
		}

		return schema;
	}

	return schema;
}

module.exports = {getProductSchema};
