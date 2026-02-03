import { TryCatch } from "../middleware/error.js";
import { Category } from "../models/category.js";

export const createCategory = TryCatch(async (req, res, next) => {
    const { name } = req.body
    const category = await Category.create({ name })
    return res.status(201).json({
        success: true,
        message: `Category ${category.name} created successfully`
    })
})

export const getAllCategories = TryCatch(async (req, res, next) => {
    const categories = await Category.findAll()
    return res.status(200).json({
        success: true,
        categories
    })
})