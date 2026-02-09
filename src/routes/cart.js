import { Router } from "express";
import express from "express";
import { cart } from "../controllers/cart.js";
// import { adminOnly } from "../middleware/auth.js";
import { singleUpload } from "../middleware/multer.js";
import { authMiddleware } from "../middleware/auth.js";
const app = express.Router()
app.post("/new", authMiddleware, singleUpload, cart)


export default app