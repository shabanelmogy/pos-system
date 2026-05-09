const mongoose = require("mongoose");
const config = require("./config");

const connectDB = async () => {
    try {
        if (!config.databaseURI) {
            throw new Error("MONGODB_URI is required");
        }

        const conn = await mongoose.connect(config.databaseURI, {
            serverSelectionTimeoutMS: 10000
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.log(`Database connection failed: ${error.message}`);
        throw error;
    }
}

module.exports = connectDB;
