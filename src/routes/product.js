import { Router } from "express";
import express from "express";
import { authAdminMiddleware, authMiddleware } from "../middleware/auth.js";
import {
    createProduct, getLatestProducts, getAllProducts, searchProducts, updateProducts, deleteProducts, getSingleProduct, getAdminProducts, bulkCreateFromCSV,
} from "../controllers/product_Two.js";
import { singleUpload, csvUpload, cloudUpload } from "../middleware/multer.js";

const app = express.Router()
app.get("/search", searchProducts)
app.post("/new", cloudUpload, authAdminMiddleware, createProduct)
app.post("/bulkCreate", csvUpload, authAdminMiddleware, bulkCreateFromCSV)
app.get("/latest", getLatestProducts)
app.get("/all", getAllProducts)
app.get("/admin-products", authAdminMiddleware, getAdminProducts)
app.put("/:slug", cloudUpload, updateProducts)
app.get("/:slug", getSingleProduct)
app.delete("/:id", deleteProducts)

export default app


