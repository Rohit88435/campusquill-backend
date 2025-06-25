import mongoose from "mongoose";

// connection with mongodb
const connectDb = async () => {
  try {
    mongoose
      .connect(process.env.MONGO_URI)
      .then(() => console.log("MongoDB connected"))
      .catch((err) => console.error("MongoDB connection error", err));
  } catch (error) {
    console.log(error);
  }
};

export default connectDb;
