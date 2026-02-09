import { TryCatch } from "../middleware/error.js";
import { Order } from "../models/order.js";
import { InvalidateCache, ReduceStock } from "../utils/feature.js";
import ErrorHandler from "../utils/utilityclass.js";
import { Cartitems } from "../models/cartitems.js";
import { Product } from "../models/product_Two.js";
import { OrderItems } from "../models/orderitems.js";
import { nodeCache } from "../app.js";



export const newOrder = TryCatch(async (req, res, next) => {
    const {
        address,
        city,
        state,
        PhoneNumber,
        country,
        pinCode,
        subtotal,
        tax,
        shippingCharges,
        discount,
        totalAmount,
        pay_method,
        status,
        cart_item_ids,
    } = req.body;

    if (
        !address || !city || !state || !PhoneNumber || !country ||
        !pinCode || !subtotal || !tax || !shippingCharges ||
        !discount || !totalAmount || !pay_method || !Array.isArray(cart_item_ids) || cart_item_ids.length === 0
    ) {
        return next(new ErrorHandler("Please enter all fields", 400));
    }
    const user_id = req.user.id

    // 1️⃣ Create Order
    const order = await Order.create({
        user_id,
        address,
        city,
        state,
        PhoneNumber,
        country,
        pinCode,
        subtotal,
        tax,
        shippingCharges,
        discount,
        totalAmount,
        pay_method,
        status
    });

    // 2️⃣ Get selected cart items
    const cartItems = await Cartitems.findAll({
        where: { id: cart_item_ids }
    });

    if (!cartItems.length) {
        return next(new ErrorHandler("No cart items found", 404));
    }

    // 3️⃣ Create OrderItems from CartItems
    const orderItemsData = cartItems.map(item => ({
        order_id: order.id,
        name: item.name,
        image: item.image,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
    }));

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

    await InvalidateCache();

    return res.status(201).json({
        success: true,
        message: "Order created successfully",
        order
    });
});

export const getMyOrders = TryCatch(async (req, res, next) => {
    const orders = await Order.findAll({

    });
    return res.status(200).json({
        success: true,
        orders
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
    const cacheKey = `my-orders-${id}`;
    if (nodeCache.has(cacheKey)) {
        order = JSON.parse(nodeCache.get(cacheKey))
        console.log(" cache order", order)
    }
    else {
        order = await Order.findAll({
            where: { user_id: id },
            include: [OrderItems]
        })
        nodeCache.set(cacheKey, JSON.stringify(order))

        console.log("order", order)

    }
    return res.status(200).json({
        success: true,
        order
    })


})