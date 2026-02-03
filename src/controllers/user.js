import { TryCatch } from "../middleware/error.js";
import { User } from "../models/user.js";
import ErrorHandler from "../utils/utilityclass.js";
export const createUser = TryCatch(async (req, res, next) => {
    const { name, email, password, role, gender, dob } = req.body
    const user = await User.findOne({ email })
    if (user) {
        return res.status(201).json({
            success: true,
            message: `Welcoem back ${user.name}`
        })
    }

    if (!name || !email || !gender || !dob || !password) return next(new ErrorHandler("Please enter all fields", 400))



    user = User.create({
        name, email, password, role, gender, dob
    })
    return res.status(201).json({
        success: true,
        message: `Welcoem  ${user.name}`
    })

})
export const getAllUsers = TryCatch(async (req, res, next) => {
    const users = await User.find({})

    return res.status(200).json({
        success: true,
        users
    })
})
export const upadteUser = TryCatch(async (req, res, next) => {
    const { id } = req.params
    const { name, email, password, role, gender, dob } = req.body
    const user = await User.findById(id)
    if (!user) return next(new ErrorHandler("Invalid user", 400))
    if (name) user.name = name
    if (email) user.email = email
    if (password) user.password = password
    if (role) user.role = role
    if (gender) user.gender = gender
    if (dob) user.dob = dob
    await user.save()
    return res.status(200).json({
        success: true,
        message: "User updated successfully"
    })

})

export const deleteUser = TryCatch(async (req, res, next) => {
    const { id } = req.params
    const user = await User.findById(id)
    if (!user) return next(new ErrorHandler("Invalid user", 400))
    await user.deleteOne()
    return res.status(200).json({
        success: true,
        message: "User deleted successfully"
    })

})
export const getSingleUser = TryCatch(async (req, res, next) => {
    const { id } = req.params
    const user = await User.findById(id)
    if (!user) return next(new ErrorHandler("Invalid user", 400))
    return res.status(200).json({
        success: true,
        user
    })


})


