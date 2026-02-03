import mongoose from "mongoose";

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: [true, "Please Enter your category"]
    },
    image: {
        type: String,
        required: [true, "Please Enter your image"]
    },
    description: {
        type: String,
        required: true
    }
},
    {
        timestamps: true
    })




export const Product = mongoose.model("Product", schema)
