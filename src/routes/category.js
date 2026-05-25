import { Router } from "express";
import express from "express";
import { createCategory, deleteCategory, getAllCategories, getSingleCategory, updateCategory, deleteCategoryImage, filterCategory, getAdminCategories } from "../controllers/category.js";
import { singleUpload, singleFileUpload, cloudSingleUpload } from "../middleware/multer.js";
import { authMiddleware, authAdminMiddleware, adminOnly } from "../middleware/auth.js";
// category route file

const app = express.Router()
app.post("/new", authAdminMiddleware, cloudSingleUpload, createCategory)
app.delete('/category-image/:id', authAdminMiddleware, cloudSingleUpload, deleteCategoryImage)

// app.post("/new", upload.single("image"), (req, res) => {
//     console.log("MULTER HIT ✅")
//     console.log("body:", req.body)
//     console.log("file:", req.file)
//     res.json({ body: req.body, file: req.file })
// })
app.get("/all", getAllCategories)
app.get("/admin/all", authAdminMiddleware, getAdminCategories)
app.put('/:id', adminOnly, cloudSingleUpload, updateCategory)
app.get('/:id', adminOnly, getSingleCategory)
app.delete('/:id', adminOnly, deleteCategory)
app.get("/filter_category/:slug", filterCategory)

export default app