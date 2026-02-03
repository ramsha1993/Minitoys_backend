import sequelize from "../../db.js"
import { DataTypes } from "sequelize"
export const Product = sequelize.define("Product", {
    name: {
        type: DataTypes.STRING,
        allowNull: false

    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false

    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    image: {
        type: DataTypes.STRING,
        allowNull: [false, "Please insert product image"]
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    category_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: "category", // table name
            key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT" // prevent deleting category if products exist
    }
},
    {
        timestamps: true,
        // paranoid: true,
        tableName: 'product',
    })




