import { Router } from "express";
import express from "express";
import { adminOnly } from "../middleware/auth.js";
import { createProduct, getLatestProducts, getAllProducts, updateProducts, deleteProducts, getSingleProduct, getAdminProducts, searchProducts } from "../controllers/product_Two.js";
import { singleUpload } from "../middleware/multer.js";

const app = express.Router()
app.get("/search", searchProducts)
app.post("/new", singleUpload, createProduct)
app.get("/latest", getLatestProducts)
app.get("/all", getAllProducts)
app.get("/admin-products", adminOnly, getAdminProducts)
app.put("/:id", singleUpload, updateProducts)
app.get("/:slug", getSingleProduct)
app.delete("/:id", deleteProducts)

export default app


