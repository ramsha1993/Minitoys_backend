// import mongoose from "mongoose";
// export const connectDb = async () => {
//     try {

import { nodeCache } from "../app.js"
import { Product } from "../models/product_Two.js"
import ErrorHandler from "./utilityclass.js";

//         const c = await mongoose.connect("mongodb://localhost:27017", {
//             dbName: "Minitoys"
//         })
//         console.log("Mongoose connected", c.connection.host)


//     } catch (error) {
//         console.log("Mongoose connection error", error)
//         process.exit(1); // Stop server if DB fails

//     }
// }

export const InvalidateCache = async (products, orders, admin, category) => {
    console.log("Passed arguments:", { products, orders, admin, category }); // DEBUG LOG
    if (products) {
        const ProductCacheKeys = ["latestProducts", "adminProducts"]
        const Prdouct_id = await Product.findAll({
            attributes: ['id'],
            raw: true
        })
        console.log("ID", Prdouct_id)
        Prdouct_id.forEach((i) => {
            ProductCacheKeys.push(`product-${i.id}`)
            console.log("ProductCacheKeys deleted", ProductCacheKeys)
        })


        nodeCache.del(ProductCacheKeys)
        console.log("Verification - Does adminProducts still exist?:", nodeCache.has("adminProducts"));
    }
    else {
        console.log("func not working ")
    }


}

export const ReduceStock = async (OrderItems) => {

    for (let i = 0; i < OrderItems.length; i++) {
        const item = OrderItems[i];
        const ProductId = item.product
        let product = await Product.findByPk(ProductId)
        if (!product) {
            return next(new ErrorHandler("Product not found", 400))
        }

        product.stock -= item.quantity
        await product.save()



    }



}





