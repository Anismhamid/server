const mongoose = require("mongoose");
const chalk = require("chalk");

const connectDB = async () => {
	try {
		await mongoose.connect(process.env.DB);
		console.log(chalk.blue("Connected to MongoDB"));
	} catch (error) {
		console.error(chalk.red(error));
		process.exit(1);
	}
};

module.exports = connectDB;
