import sequelize from "../../db.js"
import { DataTypes, Model } from "sequelize"
import { User } from "./user_two.js"
import { Product } from "./product_Two.js"
export const OrderItems = sequelize.define("orderitems", {
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "order",
            key: "id"
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: false
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "product",
            key: "id"
        }
    }
}, {
    timestamps: true,
    // paranoid: true,
    tableName: 'orderitems',
})




