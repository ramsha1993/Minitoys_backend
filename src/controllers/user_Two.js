import { TryCatch } from "../middleware/error.js";
import { User } from "../models/user_two.js";
import ErrorHandler from "../utils/utilityclass.js";
export const createUser = TryCatch(async (req, res, next) => {
    const { name, email, password, role, status } = req.body
    let user = await User.findOne({ where: { email } })
    if (user) {
        return res.status(201).json({
            success: true,
            message: `Welcoem back ${user.name}`,
            user
        })
    }

    if (!name || !email || !role | !password || status === undefined) return next(new ErrorHandler("Please enter all fields", 400))



    user = await User.create({
        name, email, password, role, status
    })
    return res.status(201).json({
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