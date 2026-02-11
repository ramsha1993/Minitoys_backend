import { TryCatch } from "../middleware/error.js";
import { User } from "../models/user_two.js";
import ErrorHandler from "../utils/utilityclass.js";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

import bcrypt from "bcrypt"
// logged in and signup user can only sign up vendor cannot seller cannot be sign in as
// user and 

dotenv.config()

export const Login = TryCatch(async (req, res, next) => {
    let user;
    const { email, password } = req.body
    user = await User.findOne({ where: { email } })
    console.log("user", user.password, password)
    if (!user) return next(new ErrorHandler("Invalid user", 400))
    if (user.status !== true && user.status !== 1)
        return next(new ErrorHandler("User is not active", 400))
    const isMatch = await bcrypt.compare(password, user.password)
    console.log("isMatch", isMatch)
    if (!isMatch) return next(new ErrorHandler("Invalid password", 400))
    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_TOKEN, { expiresIn: "1d" })
    return res.status(200).json({
        success: true,
        message: "User logged in successfully",
        user,
        token
    })
})
export const googleLoggedin = TryCatch(async (req, res, next) => {

})

export const SignUp = TryCatch(async (req, res, next) => {
    let user;
    const { name, email, password } = req.body
    if (!name || !email || !password) return next(new ErrorHandler("Please enter all fields", 400))
    user = await User.findOne({ where: { email } })
    if (user) return next(new ErrorHandler("User already exists", 400))
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(password, salt)

    user = await User.create({
        name, email, password: hashPassword, role: 'user', status: true

    })

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_TOKEN, { expiresIn: "1d" })
    return res.status(200).json({
        success: true,
        message: "User Created Successfully",
        token

    })
})

export const createUser = TryCatch(async (req, res, next) => {
    const { name, email, password, role, status } = req.body
    let user = await User.findOne({ where: { email } })
    if (user) return next(new ErrorHandler("User already exists", 400))

    if (!name || !email || !role | !password || status === undefined) return next(new ErrorHandler("Please enter all fields", 400))
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(password, salt);


    user = await User.create({
        name, email, password: hashPassword, role, status
    })
    return res.status(200).json({
        success: true,
        message: `Welcoem  ${user.name}`,
        user
    })

})


export const upadteUser = TryCatch(async (req, res, next) => {
    const { id } = req.params
    const { name, email, password, role, status } = req.body
    const user = await User.findByPk(id)
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (password !== undefined) user.password = password;
    if (role !== undefined) user.role = role;
    if (status !== undefined) user.status = status; // boolean-safe
    await user.save()
    return res.status(200).json({
        success: true,
        message: "User updated successfully"
    })

})

export const getSingleUser = TryCatch(async (req, res, next) => {
    const { id } = req.params
    const user = await User.findByPk(id)
    if (!user) return next(new ErrorHandler("Invalid user", 400))
    return res.status(200).json({
        success: true,
        user
    })


})
export const getAllUsers = TryCatch(async (req, res, next) => {
    const users = await User.findAll()
    return res.status(200).json({
        success: true,
        users
    })
})

export const deleteUser = TryCatch(async (req, res, next) => {
    const { id } = req.params
    const user = await User.findByPk(id)
    if (!user) return next(new ErrorHandler("Invalid user", 400))
    await user.destroy()
    return res.status(200).json({
        success: true,
        message: "User deleted successfully"
    })

})