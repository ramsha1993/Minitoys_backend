
import { OrderItems } from "./orderitems.js"
import { Order } from "./order.js"


// Order ↔ OrderItem
Order.hasMany(OrderItems, { foreignKey: "order_id", onDelete: "CASCADE" })
OrderItems.belongsTo(Order, { foreignKey: "order_id" })


