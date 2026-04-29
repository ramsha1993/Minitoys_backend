import { Router } from "express";
// import { deleteUser, getAllUsers, getSingleUser, upadteUser } from "../controllers/user.js";
import { createUser, getSingleUser,getProfile, getAllUsers, upadteUser, deleteUser, SignUp, Login, AdminLogin } from "../controllers/user_Two.js";
import express from "express";
import { authAdminMiddleware, authMiddleware } from "../middleware/auth.js";
import {singleUpload} from'../middleware/multer.js'
const app = express.Router()
// for yser
app.post("/new",authMiddleware,singleUpload,createUser)

app.post("/register", SignUp)
app.post("/login", Login)
app.post("/admin/login", AdminLogin)

// for admin admin only 
app.get("/all",authAdminMiddleware, getAllUsers)
app.get("/get-profile",authMiddleware,getProfile)
app.get("/:id", getSingleUser)
app.put("/:id", authAdminMiddleware,singleUpload,upadteUser)
app.delete("/:id", deleteUser)

export default app