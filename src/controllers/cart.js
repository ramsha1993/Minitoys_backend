import { Cart } from "../models/cart.js"
import { TryCatch } from "../middleware/error.js"
import { Cartitems } from "../models/cartitems.js"
import ErrorHandler from "../utils/utilityclass.js"
// user can get cart id only once logged in 
export const cart = TryCatch(async (req, res, next) => {
    // / authentication json web token not added which will give token user id 
    // in response then we will get access to cart and can add products to cart 
    //    user_id it will be removed then we will add user id from authentication 
    // since we havent created till 

    // same order cannot be added twice user can increase qunatity
    const user_id = req.user.id
    const { product_id, quantity, price, name } = req.body
    const image = req.file
    if (!image) {
        return next(new ErrorHandler("Please upload an image", 400))
    }
    let cart;
    cart = await Cart.findOne({ where: { user_id: user_id } })
    if (!cart) {
        cart = await Cart.create({ user_id: user_id })

    }
    const cart_id = cart.id
    console.log("Cart", cart_id)
    console.log(`Request items, user_id ${user_id}, product_id ${product_id},image ${image},quantity ${quantity}, price ${price},name ${name}`)
    const Cart_items = await Cartitems.findOne({ where: { cart_id: cart_id, product_id: product_id } })
    if (Cart_items) {
        Cart_items.quantity += 1
        await Cart_items.save()
        return res.status(200).json({
            success: true,
            message: "Product quantity updated in cart"
        })
    }
    await Cartitems.create({
        cart_id,
        name,
        image: image?.path,
        quantity,
        price,
        product_id

    })
    return res.status(201).json({
        success: true,
        message: "Product added to cart"
    })

})


// user clicked on add to cart button
// then check first does the user exist logged in
// then return cart id
// now cartitems needs the cart id
// 
