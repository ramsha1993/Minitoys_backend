import { nodeCache } from "../app.js";
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
    let categories;
    if (nodeCache.has("categories")) {
        categories = JSON.parse(nodeCache.get("categories"))
    }

    else {
        categories = await Category.findAll()
        nodeCache.set("categories", JSON.stringify(categories))
    }
    return res.status(200).json({
        success: true,
        categories
    })
})

export const getSingleCategory = TryCatch(async (req, res, next) => {
    const { id } = req.params
    const category = await Category.findByPk(id)
    if (!category) return next(new ErrorHandler("Invalid category", 400))
    return res.status(200).json({
        success: true,
        category
    })
})

export const updateCategory = TryCatch(async (req, res, next) => {
    const { id } = req.params
    const { name } = req.body
    const category = await Category.findByPk(id)
    if (!category) return next(new ErrorHandler("Invalid category", 400))
    if (name !== undefined) category.name = name
    await category.save()
    return res.status(200).json({
        success: true,
        message: "Category updated successfully"
    })
})

export const deleteCategory = TryCatch(async (req, res, next) => {
    const { id } = req.params
    const category = await Category.findByPk(id)
    if (!category) return next(new ErrorHandler("Invalid category", 400))
    await category.destroy()
    return res.status(200).json({
        success: true,
        message: "Category deleted successfully"
    })
})

