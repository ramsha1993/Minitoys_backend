import sequelize from "../../db.js";
import { DataTypes } from "sequelize";
export const Cart = sequelize.define("cart", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true

    },

    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "users",
            key: "id"
        }

    }




}, {
    timestamps: true,
    tableName: 'cart'

})
