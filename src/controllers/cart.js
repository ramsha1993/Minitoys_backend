import { Cart } from "../models/cart.js"
import { TryCatch } from "../middleware/error.js"
import { Cartitems } from "../models/cartitems.js"
import ErrorHandler from "../utils/utilityclass.js"
import { rm } from "node:fs"
import { Product } from "../models/product_Two.js"
// user can get cart id only once logged in 
// update and create cart items

export const cart = TryCatch(async (req, res, next) => {

    const user_id = req.user.id
    const { product_id, quantity } = req.body
    if (!product_id || !quantity) {

        return next(new ErrorHandler("Please provide all the required fields", 400))
    }




    let cart = await Cart.findOne({ where: { user_id: user_id } })
    if (!cart) {
        cart = await Cart.create({ user_id: user_id })

    }
    const cart_id = cart.id
    console.log("Cart", cart_id)
    // console.log(`Request items, user_id ${user_id}, product_id ${product_id},image ${image},quantity ${quantity}, price ${price},name ${name}`)
    const Cart_items = await Cartitems.findOne({ where: { cart_id: cart_id, product_id: product_id } })
    if (Cart_items) {
        Cart_items.quantity += Number(quantity)
        await Cart_items.save();
        return res.status(200).json({
            success: true,
            message: "Product quantity updated in cart"
        })
    }
    if (!Cart_items) {
        await Cartitems.create({
            cart_id,
            quantity,
            product_id

        })
    }
    return res.status(201).json({
        success: true,
        message: "Product added to cart"
    })

})

export const getCartitems = TryCatch(async (req, res, next) => {
    const user_id = req.user.id
    const cart = await Cart.findOne({ where: { user_id: user_id } })
    const cart_id = cart.id
    const cartitems = await Cartitems.findAll({ where: { cart_id: cart_id } })
    const product = await Product.findAll({ where: { id: cartitems.map(item => item.product_id) } });

    const items = cartitems.map(item => {
        const products = product.find((p) => p.id === item.product_id);
        console.log("product id", products)
        return {
            product_id: item.product_id,
            quantity: item.quantity,
            name: products?.name,
            price: products?.price,
            image: products?.image
        };
    });

    console.log("items", items)
    return res.status(200).json({
        success: true,
        items
    })

})

export const getCartCount = TryCatch(async (req, res, next) => {
    const user_id = req.user.id;

    const cart = await Cart.findOne({ where: { user_id } });

    if (!cart) {
        return res.status(200).json({
            success: true,
            count: 0
        });
    }

    const count = await Cartitems.count({
        where: { cart_id: cart.id }
    });

    return res.status(200).json({
        success: true,
        count
    });
});




// user clicked on add to cart button
// then check first does the user exist logged in
// then return cart id
// now cartitems needs the cart id
// 
