import sequelize from "../../db.js"
import { DataTypes, Model } from "sequelize"
import { User } from "./user_two.js"
import { Product } from "./product_Two.js"
export const Order = sequelize.define("order", {

    user_id: {
        type: DataTypes.INTEGER, // match parent type
        allowNull: false,
        references: {
            model: "users",
            key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    },


    pay_method: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM("Pending", "Processing", "Shipped", "Delivered", "Cancelled"),
        allowNull: false,
        defaultValue: "Pending"
    },
    subTotal: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    shippingFee: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    totalAmount: {
        type: DataTypes.INTEGER,
        allowNull: true
    }

    , address_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "address",
            key: "id"
        }
    },


}, {
    timestamps: true,
    // paranoid: true,
    tableName: 'order',
})




