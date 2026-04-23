import { Router } from "express";
import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { createProduct, getLatestProducts, getAllProducts, updateProducts,bulkCreate,deleteProducts, getSingleProduct, getAdminProducts, 
    // searchProducts
 } from "../controllers/product_Two.js";
import { singleUpload } from "../middleware/multer.js";

const app = express.Router()
// app.get("/search", searchProducts)
app.post("/new", singleUpload,authMiddleware, createProduct)
app.post("/bulkCreate",singleUpload,authMiddleware,bulkCreate)
app.get("/latest", getLatestProducts)
app.get("/all", getAllProducts)
app.get("/admin-products", authMiddleware, getAdminProducts)
app.put("/:slug", singleUpload, updateProducts)
app.get("/:slug", getSingleProduct)
app.delete("/:id", deleteProducts)

export default app


