import { User } from "../models/user.js";
import ErrorHandler from "../utils/utilityclass.js";
import { TryCatch } from "./error.js";

export const adminOnly = TryCatch(async (req, res, next) => {
    const { id } = req.query
    if (!id) return next(new ErrorHandler("Please login first", 400))
    const user = await User.findById(id)
    if (!user) return next(new ErrorHandler("Invalid user", 400))
    if (user.role !== "admin") return next(new ErrorHandler("You are not authorized to perform this action", 400))
    return next()


})