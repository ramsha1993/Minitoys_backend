import mongoose from "mongoose";
export const connectDb = async () => {
    try {

        const c = await mongoose.connect("mongodb://localhost:27017", {
            dbName: "Minitoys"
        })
        console.log("Mongoose connected", c.connection.host)


    } catch (error) {
        console.log("Mongoose connection error", error)
        process.exit(1); // Stop server if DB fails

    }
}