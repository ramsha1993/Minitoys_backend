import sequelize from "../../db.js";
import { DataTypes } from "sequelize";

export const Category = sequelize.define(
    "Category",
    {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true
        }

    },
    {
        timestamps: true,
        tableName: "category"
    }
);
