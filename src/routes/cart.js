import { Router } from "express";
import express from "express";
import { cart, deleteCartItems, getCartCount, getCartitems, updateCartQuantity } from "../controllers/cart.js";
// import { adminOnly } from "../middleware/auth.js";
import { singleUpload } from "../middleware/multer.js";
import { authMiddleware } from "../middleware/auth.js";
const app = express.Router()
app.post("/new", authMiddleware, cart)
// app.delete("/:id", authMiddleware, deleteCart)
app.get("/", authMiddleware, getCartitems)
app.get("/count", authMiddleware, getCartCount)
app.delete("/:id", authMiddleware, deleteCartItems)
app.put("/update/:id", authMiddleware, updateCartQuantity)
export default app