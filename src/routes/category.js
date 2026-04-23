import { Router } from "express";
import express from "express";
import { createCategory, deleteCategory, getAllCategories, getSingleCategory, updateCategory,deleteCategoryImage } from "../controllers/category.js";
import { singleUpload,singleFileUpload } from "../middleware/multer.js";
import { adminOnly } from "../middleware/auth.js";
import { authMiddleware,authAdminMiddleware } from "../middleware/auth.js";
// category route file

const app = express.Router()
app.post("/new",authAdminMiddleware,singleFileUpload,createCategory)
app.delete('/category-image/:id',authAdminMiddleware,singleUpload,deleteCategoryImage)

// app.post("/new", upload.single("image"), (req, res) => {
//     console.log("MULTER HIT ✅")
//     console.log("body:", req.body)
//     console.log("file:", req.file)
//     res.json({ body: req.body, file: req.file })
// })
app.get("/all",authMiddleware, getAllCategories)
app.put('/:id', authAdminMiddleware,singleUpload,updateCategory)
app.get('/:id',authMiddleware, getSingleCategory)
app.delete('/:id',authAdminMiddleware, deleteCategory)

export default app