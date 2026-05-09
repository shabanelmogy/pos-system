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
        console.error("=========================================");
        console.error("DATABASE CONNECTION ERROR DETAILS:");
        console.error(`Message: ${error.message}`);
        console.error(`Error Name: ${error.name}`);
        if (error.message.includes("ETIMEOUT") || error.message.includes("selection timeout")) {
            console.error("PROBABLE CAUSE: Network Firewall / IP Whitelist. Check MongoDB Atlas Network Access (Allow 0.0.0.0/0).");
        } else if (error.message.includes("auth failed") || error.message.includes("Authentication failed")) {
            console.error("PROBABLE CAUSE: Invalid Username or Password. Check Adam%%402008 in web.config.");
        }
        console.error("=========================================");
        throw error;
    }
}

module.exports = connectDB;
