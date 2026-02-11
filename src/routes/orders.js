import { Router } from "express";
// import { deleteUser, getAllUsers, getSingleUser, upadteUser } from "../controllers/user.js";
import { createUser, getSingleUser, getAllUsers, upadteUser, deleteUser } from "../controllers/user_Two.js";
import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { getMyOrders, myOrders, newOrder } from "../controllers/order.js";
// import { adminOnly } from "../middleware/auth.js";

const app = express.Router()
// authenticated routes 
app.post("/new", authMiddleware, newOrder)
// admin routes
app.get("/All", getMyOrders)

// vendor/user routes
app.get("/myOrders", authMiddleware, myOrders)


export default app