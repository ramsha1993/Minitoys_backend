import constants from "node:constants";
import { TryCatch } from "../middleware/error.js";
import { Product } from "../models/product_Two.js";
import ErrorHandler from "../utils/utilityclass.js";
import { rm } from "node:fs";
import { Op } from "sequelize";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
import { nodeCache } from "../app.js";
import { InvalidateCache } from "../utils/feature.js";
dotenv.config();
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
    await InvalidateCache(products)
    return res.status(201).json({
        success: true,
        message: `Product ${products.name} created successfully`
    })

})

// Revalidate on new,update and delete product & new order & change in stock

export const getLatestProducts = TryCatch(async (req, res, next) => {
    let products = []
    if (nodeCache.has('latestProducts')) {
        products = JSON.parse(nodeCache.get('latestProducts'))

    }
    else {

        products = await Product.findAll({
            order: [['createdAt', 'DESC']],
        })

        nodeCache.set("latestProducts", JSON.stringify(products))
    }
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
        return next(new ErrorHandler("Invalid product", 400))

    }

    if (name !== undefined) product.name = name
    if (price !== undefined) product.price = price
    if (stock !== undefined) product.stock = stock
    if (category_id !== undefined) product.category_id = category_id
    if (description !== undefined) product.description = description
    if (photo !== undefined) product.image = photo.path
    await product.save()
    await InvalidateCache(products)
    return res.status(200).json({
        success: true,
        message: "Product updated successfully"
    })
})


// not the right way to fetch all products
export const getAdminProducts = TryCatch(async (req, res, next) => {
    let products;
    if (nodeCache.has("adminProducts")) {
        products = JSON.parse(nodeCache.get("adminProducts"))
        console.log("Key Exists")
    }
    else {
        products = await Product.findAll()
        console.log("Key Not Exists")
        nodeCache.set("adminProducts", JSON.stringify(products))
    }
    return res.status(200).json({
        success: true,
        products
    })
})



export const getAllProducts = TryCatch(async (req, res, next) => {
    const { name, category } = req.query
    const page = Number(req.query.page) || 1
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8
    const skip = (page - 1) * limit
    const baseQuery = {}

    if (name) {

        baseQuery[Op.or] = [
            { name: { [Op.like]: `%${name}%` } },
            { description: { [Op.like]: `%${name}%` } }
        ]
    }
    if (category) {
        baseQuery.category_id = category
    }
    // if (price) {
    //     baseQuery.price = { [Op.lte]: price }
    // }
    const sortOrder = req.query.sort === 'sort' ? 'high-to-low' : 'ASC';

    const products = await Product.findAndCountAll({ where: baseQuery, limit: limit, offset: skip, order: [['price', sortOrder]] })
    console.log("products", products)
    return res.status(200).json({

        success: true,
        products: products.rows,
        sortOrder,
        totalProducts: products.count,
        currentPage: page,
        totalPages: Math.ceil(products.count / limit)
    })
})

export const deleteProducts = TryCatch(async (req, res, next) => {
    const { id } = req.params
    const product = await Product.findByPk(id)
    if (!product) return next(new ErrorHandler("Invalid product", 400))
    await product.destroy()
    InvalidateCache(product)
    return res.status(200).json({
        success: true,
        message: "Product deleted successfully"
    })
})

export const getSingleProduct = TryCatch(async (req, res, next) => {
    let product;
    const { id } = req.params
    if (nodeCache.has(`product-${id}`)) {
        product = JSON.parse(nodeCache.get(`product-${id}`))
    }
    else {
        product = await Product.findByPk(id)
        nodeCache.set(`product-${id}`, JSON.stringify(product))
    }
    if (!product) return next(new ErrorHandler("Invalid product", 400))
    return res.status(200).json({
        success: true,
        product
    })
})
export const generateRandomProducts = async (count) => {
    const products = []
    for (let i = 0; i < count; i++) {
        const product = {
            name: faker.commerce.productName(),
            price: faker.commerce.price({ min: 1500, max: 10000 }),
            stock: faker.number.int({ min: 10, max: 100 }),
            category_id: faker.number.int({ min: 1, max: 5 }),
            description: faker.commerce.productDescription(),
            image: "uploads/1d7e139e-82a6-485b-83a3-f817019fdf30.webp"
        }
        products.push(product)
    }
    await Product.bulkCreate(
        products
    )
    console.log("Success")
}
// generateRandomProducts(40)

// const delteteAllproducts = async () => {
//     const products = await Product.findAll({ offset: 10 })
//     console.log("products", products)
//     for (let i = 0; i < products.length; i++) {
//         await products[i].destroy()
//     }
//     console.log("products deleted successfully", products)
// }
// delteteAllproducts()
