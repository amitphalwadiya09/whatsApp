import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const con = await mongoose.connect(process.env.MONGO_URI)
        console.log("database is connected")

    } catch (error) {
        console.error("error while connecting database")
    }
}

export default connectDB;