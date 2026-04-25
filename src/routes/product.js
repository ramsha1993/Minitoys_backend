import { Router } from "express";
import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { createProduct, getLatestProducts, getAllProducts, updateProducts,bulkCreateFromExcel,deleteProducts, getSingleProduct, getAdminProducts, 
    // searchProducts
 } from "../controllers/product_Two.js";
import { singleUpload ,excelUpload, cloudUpload} from "../middleware/multer.js";

const app = express.Router()
// app.get("/search", searchProducts)
app.post("/new", cloudUpload,authMiddleware, createProduct)
app.post("/bulkCreate",excelUpload,authMiddleware,bulkCreateFromExcel)
app.get("/latest", getLatestProducts)
app.get("/all", getAllProducts)
app.get("/admin-products", authMiddleware, getAdminProducts)
app.put("/:slug", cloudUpload, updateProducts)
app.get("/:slug", getSingleProduct)
app.delete("/:id", deleteProducts)

export default app


