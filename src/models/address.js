import { DataTypes } from "sequelize";
import sequelize from "../../db.js";


export const Address = sequelize.define("Address", {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "users",
            key: "id"
        }

    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },


    country: {
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
    street: {
        type: DataTypes.STRING,
        allowNull: false
    },
    building: {
        type: DataTypes.STRING,
        allowNull: false
    },

    phone: {
        type: DataTypes.INTEGER,
        allowNull: false
    },




}, {
    timestamps: true,
    tableName: "address"
}
    , {

    }

)