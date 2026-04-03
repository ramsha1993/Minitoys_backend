import { Router } from "express";
import express from "express";
import { addAddress, getAddress, updateAddress } from "../controllers/address.js";
import { authMiddleware } from "../middleware/auth.js";

const app = express.Router()

app.post("/new", authMiddleware, addAddress)
app.put("/update", authMiddleware, updateAddress)
app.get("/get", authMiddleware, getAddress)
export default app
