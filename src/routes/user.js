import { Router } from "express";
// import { deleteUser, getAllUsers, getSingleUser, upadteUser } from "../controllers/user.js";
import { createUser, getSingleUser, getAllUsers, upadteUser, deleteUser } from "../controllers/user_Two.js";
import express from "express";
// import { adminOnly } from "../middleware/auth.js";

const app = express.Router()
app.post("/new", createUser)
app.get("/:id", getSingleUser)
app.get("/all", getAllUsers)
app.put("/:id", upadteUser)
app.delete("/:id", deleteUser)

export default app