import { Router } from "express";
import express from "express";
import { adminOnly } from "../middleware/auth.js";
import { createCategory, deleteCategory, getAllCategories, getSingleCategory, updateCategory } from "../controllers/category.js";
import { singleUpload } from "../middleware/multer.js";

const app = express.Router()
app.post("/new", createCategory)
app.get("/all", getAllCategories)
app.put('/:id', updateCategory)
app.get('/:id', getSingleCategory)
app.delete('/:id', deleteCategory)

export default app