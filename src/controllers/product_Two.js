import constants from "node:constants";
import { TryCatch } from "../middleware/error.js";
import { Product } from "../models/product_Two.js";
import ErrorHandler from "../utils/utilityclass.js";
import { rm } from "node:fs";

export const createProduct = TryCatch(async (req, res, next) => {
    const { name, price, stock, category_id, description } = req.body
    const photo = req.file
    console.log("photo", photo)
    const product = await Product.findOne({ where: { name } })
    if (product) return next(new ErrorHandler("Product already exists", 400))
    if (!name || !price || !stock || !category_id || !description) {
        if (photo) {
            rm(photo?.path, () => {
                console.log("deleted")
            })
        }

        return next(new ErrorHandler("Please enter all fields", 400))

    }
    const products = await Product.create({
        name, price, stock, category_id, description, image: photo?.path
    })
    return res.status(201).json({
        success: true,
        message: `Product ${products.name} created successfully`
    })

})
export const getLatestProducts = TryCatch(async (req, res, next) => {
    const products = await Product.findAll({
        order: [['createdAt', 'DESC']],
        limit: 5
    })
    return res.status(200).json({
        success: true,
        products
    });
});
export const updateProducts = TryCatch(async (req, res, next) => {
    const { id } = req.params
    const { name, price, stock, category_id, description } = req.body
    const photo = req.file
    const product = await Product.findByPk(id)



    if (!product) {


        if (photo) {
            fs.unlink(photo.path, (err) => {
                if (err) console.log("Error deleting uploaded image:", err);
            });
        }
    }
    if (name !== undefined) product.name = name
    if (price !== undefined) product.price = price
    if (stock !== undefined) product.stock = stock
    if (category_id !== undefined) product.category_id = category_id
    if (description !== undefined) product.description = description
    if (photo !== undefined) product.image = photo.path
    await product.save()
    return res.status(200).json({
        success: true,
        message: "Product updated successfully"
    })
})
export const getAllProducts = TryCatch(async (req, res, next) => {
    const products = await Product.findAll()
    return res.status(200).json({
        success: true,
        products
    })
})

export const deleteProducts = TryCatch(async (req, res, next) => {
    const { id } = req.params
    const product = await Product.findByPk(id)
    if (!product) return next(new ErrorHandler("Invalid product", 400))
    await product.destroy()
    return res.status(200).json({
        success: true,
        message: "Product deleted successfully"
    })
})

export const getSingleProduct = TryCatch(async (req, res, next) => {
    const { id } = req.params
    const product = await Product.findByPk(id)
    if (!product) return next(new ErrorHandler("Invalid product", 400))
    return res.status(200).json({
        success: true,
        product
    })
})

