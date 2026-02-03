import constants from "node:constants";
import { TryCatch } from "../middleware/error.js";
import { Product } from "../models/product.js";
import ErrorHandler from "../utils/utilityclass.js";
import { rm } from "node:fs";
export const createProduct = TryCatch(async (req, res, next) => {
    const { name, price, stock, category, description } = req.body
    const photo = req.file
    console.log("photo", photo)
    const product = await Product.findOne({ name })
    if (product) return next(new ErrorHandler("Product already exists", 400))
    if (!name || !price || !stock || !category || !description) {
        if (photo) {
            rm(photo?.path, () => {
                console.log("deleted")
            })
        }

        return next(new ErrorHandler("Please enter all fields", 400))

    }
    const products = await Product.create({
        name, price, stock, category, description, image: photo?.path
    })
    return res.status(201).json({
        success: true,
        message: `Product ${products.name} created successfully`
    })

})


export const getLatestProducts = TryCatch(async (req, res, next) => {
    const products = await Product.find({})
        .sort({ createdAt: -1 })
        .limit(5);

    return res.status(200).json({
        success: true,
        products
    });
});