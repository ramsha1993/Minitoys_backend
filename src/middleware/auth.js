import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import ErrorHandler from "../utils/utilityclass.js";
import { TryCatch } from "./error.js";
import dotenv from "dotenv"
dotenv.config()
export const adminOnly = TryCatch(async (req, res, next) => {
    const { id } = req.query
    if (!id) return next(new ErrorHandler("Please login first", 400))
    const user = await User.findById(id)
    if (!user) return next(new ErrorHandler("Invalid user", 400))
    if (user.role !== "admin") return next(new ErrorHandler("You are not authorized to perform this action", 400))
    return next()


})
export const authMiddleware = TryCatch(async (req, res, next) => {
    const authHeader = req.headers['authorization']; // or req.get('Authorization')
    if (!authHeader) return next(new ErrorHandler("Please login first", 401));

    // 2. Extract the token from "Bearer <token>"
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_TOKEN)
    console.log("decodedToken", decodedToken)
    req.user = decodedToken
    return next()
})
