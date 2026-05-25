import { nodeCache } from "../app.js"
import { Product } from "../models/product_Two.js"
import ErrorHandler from "./utilityclass.js";


export const InvalidateCache = async ({ products, orders, admin, category }) => {
    console.log("Passed arguments:", { products, orders, admin, category });

    if (products) {
        const ProductCacheKeys = ["latestProducts", "adminProducts"];
        nodeCache.del(ProductCacheKeys);
        console.log("Verification - Does adminProducts still exist?:", nodeCache.has("adminProducts"));
    } else {
        console.log("Cache invalidation skipped or conditions not met");
    }
};

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





