import { TryCatch } from "../middleware/error.js";
import { Order } from "../models/order.js";
import { InvalidateCache, ReduceStock } from "../utils/feature.js";
import ErrorHandler from "../utils/utilityclass.js";
import { Cartitems } from "../models/cartitems.js";
import { Product } from "../models/product_Two.js";
import { OrderItems } from "../models/orderitems.js";
import { nodeCache } from "../app.js";
import { Address } from "../models/address.js";
import { where } from "sequelize";
import { User } from "../models/user_two.js";



export const newOrder = TryCatch(async (req, res, next) => {
    const {
        totalAmount,
        shippingFee,
        subTotal,
        status
        , pay_method,
        address_id,
        cart_item_ids,
        
    } = req.body;

    if (  !subTotal || !shippingFee || !totalAmount || !pay_method || !Array.isArray(cart_item_ids) || cart_item_ids.length === 0
        || !Array.isArray(cart_item_ids) || cart_item_ids.length === 0 
    ) {
        return next(new ErrorHandler("Please enter all fields", 400));
    }
    const user_id = req.user.id
    const address = await Address.findOne({ where: { user_id: user_id } })
    console.log("address", address)
    if (!address) {
        return next(new ErrorHandler("Address not found", 404));
    }
    // 1️⃣ Create Order
    const order = await Order.create({
        user_id,
        subTotal,
        shippingFee,
        totalAmount,
        pay_method,
        address_id: address.id,
        cart_item_ids,
        status
    });

    // 2️⃣ Get selected cart items
    const cartItems = await Cartitems.findAll({
        where: { id: cart_item_ids }
    });

    if (!cartItems.length) {
        return next(new ErrorHandler("No cart items found", 404));
    }
    const Productitems = await Product.findAll({
        where: { id: cartItems.map(item => item.product_id) }
    })



    // 3️⃣ Create OrderItems from CartItems
    const orderItemsData = cartItems.map(item => {
       console.log("itemseller id",item.seller_id);

    const product=Productitems.find(product=> product.id === item.product_id);
      return {
        order_id: order.id,
        name:product.name,
        image: product.image,
        product_id: product.id,
        quantity: product.quantity,
        price: product.price,
        seller_id:item.seller_id
   };
    });

    await OrderItems.bulkCreate(orderItemsData);
    // 4️⃣ Reduce stock
    for (let item of cartItems) {
        const product = await Product.findByPk(item.product_id);
        product.stock -= item.quantity;
        await product.save();
    }

    // 5️⃣ Delete selected cart items
    await Cartitems.destroy({
        where: { id: cart_item_ids }
    });

    // await InvalidateCache();

    return res.status(201).json({
        success: true,
        message: "Order created successfully",
        order
    });
});

export const getMyOrders = TryCatch(async (req, res, next) => {
    
    const orders = await Order.findAll({
   include:{
    model:User,
    attributes:['id','name']
   }
    });
    console.log("orders",orders)
  
    return res.status(200).json({
        success: true,
        orders,

    });
})
// to cache key with
// getting the user their products
// fetching key a/c to user_id
// /get user id
// get it from cache too
// if not there get it from server
export const myOrders = TryCatch(async (req, res, next) => {

    const id = req.user.id;
    console.log("id", id)
    let order;
    if (!id) {
        return next(new ErrorHandler("Please enter user id", 400));
    }
    // const cacheKey = `my-orders-${id}`;
    // if (nodeCache.has(cacheKey)) {
    //     order = JSON.parse(nodeCache.get(cacheKey))
    //     console.log(" cache order", order)
    // }
    // else {
    order = await Order.findAll({
        where: { user_id: id },

        include: [OrderItems]
    })
    // nodeCache.set(cacheKey, JSON.stringify(order))

    console.log("order", order)

    // }
    return res.status(200).json({
        success: true,
        order
    })


})
export const getOrderItems = TryCatch(async (req, res, next) => {
    
    const orders = await OrderItems.findAll({
            include:[
                {
                model:User,
                as:"seller",
                attributes:['id','name','email'],
                foreignKey:'seller_id'
            }
        ]

     })
    console.log("ordersitems",orders)
  
    return res.status(200).json({
        success: true,
        orders,

    });
})

