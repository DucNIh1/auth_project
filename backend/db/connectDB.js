import mongoose from "mongoose";

export const connectDB = async function () {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("Connect DB successfully! : " + conn.connection.host);
  } catch (error) {
    console.log("Error connecting to DB: " + error.message);
    process.exit(1);
  }
};
