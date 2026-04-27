
import { OrderItems } from "./orderitems.js"
import { Order } from "./order.js"
import { User } from "./user_two.js"
import { seller } from "./sellerProfile.js"
import { Categories_Commission } from "./commission_categories.js"
import { store } from "./store.js"


// Order ↔ OrderItem
Order.hasMany(OrderItems, { foreignKey: "order_id", onDelete: "CASCADE" })
OrderItems.belongsTo(Order, { foreignKey: "order_id" })
User.hasMany(Order,{foreignKey:"user_id"})
Order.belongsTo(User,{foreignKey:"user_id"})
User.hasOne(seller, { foreignKey: "user_id", onDelete: "CASCADE",as:"seller" })
seller.belongsTo(User,{ foreignKey: "user_id"  })
seller.hasMany(Categories_Commission,{foreignKey:"seller_id", onDelete: "CASCADE" ,as:"categories"})
Categories_Commission.belongsTo(seller,{foreignKey:"seller_id"})
seller.hasOne(store,{foreignKey:"seller_id", onDelete: "CASCADE",as:"store"})
store.belongsTo(seller,{foreignKey:"seller_id"})
User.hasMany(OrderItems, { foreignKey: "seller_id", as: "orderItems" })
OrderItems.belongsTo(User,{foreignKey:"seller_id",as:"seller"})
