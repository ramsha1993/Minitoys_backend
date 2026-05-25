import { Router } from "express";
// import { deleteUser, getAllUsers, getSingleUser, upadteUser } from "../controllers/user.js";
import { createUser, getSingleUser, getProfile, getAllUsers, upadteUser, deleteUser, SignUp, Login, AdminLogin, updateProfile } from "../controllers/user_Two.js";
import express from "express";
import { adminOnly, authAdminMiddleware, authMiddleware } from "../middleware/auth.js";
import { singleUpload } from '../middleware/multer.js'
const app = express.Router()
// for yser
app.post("/new", authMiddleware, singleUpload, createUser)

app.post("/register", SignUp)
app.post("/login", Login)
app.post("/admin/login", AdminLogin)
app.put("/update-profile", authMiddleware, updateProfile)
// for admin admin only 
app.get("/all", adminOnly, getAllUsers)
app.get("/get-profile", authMiddleware, getProfile)
app.get("/:id", getSingleUser)
app.put("/:id", adminOnly, singleUpload, upadteUser)
app.delete("/:id", adminOnly, deleteUser)


export default app;