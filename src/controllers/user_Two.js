import { TryCatch } from "../middleware/error.js";
import { User } from "../models/user_two.js";
import ErrorHandler from "../utils/utilityclass.js";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import {seller} from '../models/sellerProfile.js'
import { Categories_Commission } from "../models/commission_categories.js";
import { store } from "../models/store.js";
import bcrypt from "bcrypt"
import sequelize from "../../db.js";
// logged in and signup user can only sign up vendor cannot seller cannot be sign in as
// user and 

dotenv.config()

export const Login = TryCatch(async (req, res, next) => {
    let user;
    const { email, password } = req.body
    user = await User.findOne({ where: { email } })
    console.log(" find user",user)
    if (user.role === "vendor" || user.role === "admin") return next(new ErrorHandler("You are not authorized to perform this action", 400))
    console.log("user", user.password, password)
    if (!user) return next(new ErrorHandler("Invalid user", 400))
    if (user.status !== "active" )
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

export const AdminLogin = TryCatch(async (req, res, next) => {
    let user;
    const allowUserRoles=["vendor","admin"]
    const { email, password } = req.body
    user = await User.findOne({ where: { email } })
console.log("user role",user.role,user.status)
    console.log("test",!allowUserRoles.includes(user.role) || user.status !=="active",)
    if (!allowUserRoles.includes(user.role) || user.status !== "active") return next(new ErrorHandler("You are not authorized to perform this action", 400))
    console.log("user status", user.status, password)
    if (!user) return next(new ErrorHandler("Invalid user", 400))
        // vendor loggedin based on status
    // if (user.role === "vendor" &)
        // return next(new ErrorHandler("User is not active", 400))
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

// export const createUser = TryCatch(async (req, res, next) => {
//     const { name, email, password, role, status, mobile,  address,commission,categories,category_commission ,store_details,store_slug,store_name} = req.body
//     const files=req.files
//     let authorized_signature=files.find(f => f.fieldname  === "authorized_signature")
//     authorized_signature=authorized_signature?.path;
//     let store_logo=files.find( f=> f.fieldname === "store_logo" )
//     store_logo=store_logo?.path

//     let existingUser = await User.findOne({ where: { email } })

//     if (existingUser) return next(new ErrorHandler("User already exists", 400))
//     if (!name || !email || !role || !password ||!status  )
//         return next(new ErrorHandler("Please enter all fields", 400))
        
//         if(role === "vendor"){
//         if (!address || !authorized_signature || commission===null 
//         || !store_details || !store_name|| !store_slug || !authorized_signature 
//         ||!store_logo ||!store_name ) {
//             console.log( "vendor",address, authorized_signature,store_details)
//         return next(new ErrorHandler("Please enter Vendor fields", 400))
//     }
// }
//        const salt = await bcrypt.genSalt(10)
//     const hashPassword = await bcrypt.hash(password, salt);
//     let createdUser = await User.create({
//         name, email, password: hashPassword, role, 
//     })
//     let sellerRecord=await seller.create({
//         address,
//         status,
//         mobile,
//         authorized_signature,
//         commission,
//         user_id:createdUser.id,
//     })
// if(category_commission ||categories){

//     let commissionEntry = categories.map(async (cat,index)=>{
//          await Categories_Commission.create({
//           seller_id:sellerRecord.id,
//           categories:categories,
//           category_commission:category_commission[index]
//     })
//     })
// }
//     let storeRecord=await store.create({
//         seller_id:sellerRecord.id,
//         store_name:store_name,
//         store_slug:store_slug,
//         store_details:store_details,
//         store_logo:store_logo
//     })

//     return res.status(200).json({
//         success: true,
//         message: `Vendor Successfully Created  ${createdUser.name}`,
//         user:createdUser
//     })

// })


export const createUser = TryCatch(async (req, res, next) => {
    const { name, email, password, role, status, mobile, address, commission, 
            categories, category_commission, store_details, store_slug, store_name } = req.body
    const files = req.files

    let authorized_signature = files.find(f => f.fieldname === "authorized_signature")?.path
    let store_logo = files.find(f => f.fieldname === "store_logo")?.path

    let existingUser = await User.findOne({ where: { email } })
    if (existingUser) return next(new ErrorHandler("User already exists", 400))

    if (!name || !email || !role || !password || !status)
        return next(new ErrorHandler("Please enter all fields", 400))

    if (role === "vendor") {
        if (!address || !authorized_signature || commission === null
            || !store_name || !store_slug || !store_logo)
            return next(new ErrorHandler("Please enter Vendor fields", 400))
    }

    const existingStore = await store.findOne({ where: { store_slug } })
    if (existingStore) return next(new ErrorHandler("Store slug already exists", 400))

    // ✅ Wrap everything in a transaction — auto rollback on any failure
    const t = await sequelize.transaction()

    try {
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)

        const createdUser = await User.create(
            { name, email, password: hashPassword, role },
            { transaction: t }
        )

        const sellerRecord = await seller.create(
            { address, status, mobile, authorized_signature, commission, user_id: createdUser.id },
            { transaction: t }
        )

        if (categories?.length) {
            const commissionEntries = categories.map((cat, index) =>
                Categories_Commission.create(
                    { seller_id: sellerRecord.id, categories, category_commission: category_commission[index] },
                    { transaction: t }
                )
            )
            await Promise.all(commissionEntries)
        }

        await store.create(
            { seller_id: sellerRecord.id, store_name, store_slug, store_details, store_logo },
            { transaction: t }
        )

        // ✅ Only commits if everything above succeeded
        await t.commit()

        return res.status(200).json({
            success: true,
            message: `Vendor Successfully Created ${createdUser.name}`,
            user: createdUser
        })

    } catch (error) {
        // ✅ Rolls back ALL DB writes (user, seller, commissions, store)
        await t.rollback()
   if (error.name === "SequelizeUniqueConstraintError" ||
        error.name === "SequelizeValidationError") {
        const details = error.errors.map(e => {
            console.log("field:", e.path, "| value:", e.value, "| message:", e.message)
            return e.message
        })
        return next(new ErrorHandler(details.join(", "), 400))
    }        return next(new ErrorHandler(error.message, 500))
    }
})







export const upadteUser = TryCatch(async (req, res, next) => {
    const { id } = req.params

   const {name, email, password, role, status , address, commission,categories,category_commission ,store_details,store_slug,store_name}=req.body
  console.log("data",name, email, password, role, status , address, commission,categories,category_commission ,store_details,store_slug,store_name)
   const files=req.files
    let authorized_signature=files.find(f => f.fieldname  === "authorized_signature")
    authorized_signature=authorized_signature?.path;
    let store_logo=files.find( f=> f.fieldname === "store_logo" )
    store_logo=store_logo?.path
    const user = await User.findByPk(id)
    if (!user) return next(new ErrorHandler("User not found", 404));
    const sellerRecord=await seller.findOne({where:{user_id:user.id}})
    if (!sellerRecord) return next(new ErrorHandler("Seller not found", 404));
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (password !== undefined) user.password = password;
    if (role !== undefined) user.role = role;
    if (status !== undefined) user.status = status; // boolean-safe
    await user.save()
    // if(commission !==undefined) sellerRecord.commission= commission
    if(store_logo !==undefined) sellerRecord.store_logo=store_logo
    if(authorized_signature !==undefined) sellerRecord.authorized_signature=authorized_signature
    if(address !==undefined) sellerRecord.address=address
    await sellerRecord.save()
    const Store=await store.findOne({where:{seller_id:sellerRecord.id}})
    if (!Store) return next(new ErrorHandler("Store not found", 404));
    if(store_name !==undefined) Store.store_name=store_name
    if(store_details !==undefined) Store.store_details=store_details
    if(store_slug !==undefined) Store.store_slug=store_slug
      await Store.save();
    return res.status(200).json({
        success: true,
        message: "User updated successfully"
    })
  }
)

export const getSingleUser = TryCatch(async (req, res, next) => {
    const { id } = req.params
    const user = await User.findByPk(id,{
    include: [
      {
        model: seller,
        as: "seller",
        include: [
          {
            model: store,
            as: "store",
          },
          {
            model: Categories_Commission,
            as: "categories",
          },
        ],
      },
    ],
  })
    // const sellerRecord=await seller.findOne({where:{user_id:user.id}})
    // console.log("SEller",sellerRecord)
    // const Store=await store.findOne({where:{seller_id:sellerRecord.id}})
    if (!user) return next(new ErrorHandler("Invalid user", 400))
    return res.status(200).json({
        success: true,
        user,
        // sellerRecord,
        // Store
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