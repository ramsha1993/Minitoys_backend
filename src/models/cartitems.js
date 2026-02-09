import sequelize from "../../db.js";
import { DataTypes } from "sequelize";
export const Cartitems = sequelize.define("cartitems", {

    cart_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "cart",
            key: "id"
        }
    }
    ,
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
    tableName: 'cartitems'

})
