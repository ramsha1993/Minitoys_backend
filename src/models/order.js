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
    address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false
    },
    state: {
        type: DataTypes.STRING,
        allowNull: false

    },
    PhoneNumber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false
    },
    pinCode: {
        type: DataTypes.STRING,
        allowNull: false
    },
    subtotal: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    tax: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    shippingCharges: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    discount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    totalAmount: {
        type: DataTypes.INTEGER,
        allowNull: false
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



}, {
    timestamps: true,
    // paranoid: true,
    tableName: 'order',
})




