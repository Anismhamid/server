const mongoose = require("mongoose");

const CityModel = new mongoose.Schema({
	region_code: {type: Number},
	region_name: {type: String},
	city_code: {type: Number},
	city_name: {type: String},
	street_code: {type: Number},
	street_name: {type: String},
	street_name_status: {type: String},
	official_code: {type: String},
});

const Cities = mongoose.model("Cities", CityModel);

module.exports = Cities;
