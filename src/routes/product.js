import { Router } from "express";
import express from "express";
import { adminOnly } from "../middleware/auth.js";
import { createProduct, getLatestProducts } from "../controllers/products.js";
import { singleUpload } from "../middleware/multer.js";

const app = express.Router()
app.post("/new", singleUpload, createProduct)
app.get("/latest", getLatestProducts)

export default app