const mongoose = require("mongoose");

exports.ConnectToDatabase = async () => {
  try {
    const url = process.env.MONGODB_URI;

    // Attempt connection
    const db = await mongoose.connect(url);

    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    throw new Error("Failed to connect to MongoDB");
  }
};