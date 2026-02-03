import { Router } from "express";
import express from "express";
import { adminOnly } from "../middleware/auth.js";
import { createCategory, getAllCategories } from "../controllers/category.js";
import { singleUpload } from "../middleware/multer.js";

const app = express.Router()
app.post("/new", createCategory)
app.get("/all", getAllCategories)

export default app