const mongoose = require("mongoose");
const chalk = require("chalk");

const connectDB = async () => {
    try {
        if (!process.env.DB) {
            throw new Error("DB variable missing in .env");
        }

        const conn = await mongoose.connect(process.env.DB);

        console.log(
            chalk.blue(
                `Connected to MongoDB: ${conn.connection.host}`
            )
        );
    } catch (error) {
        console.error(
            chalk.red("MongoDB connection failed:")
        );

        console.error(error.message);

        process.exit(1);
    }
};

module.exports = connectDB;

// await User.updateMany({status: {$exists: false}}, {$set: {status: false}});
// console.log("Migration completed");