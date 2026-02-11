import sequelize from "../../db.js"
import { DataTypes } from "sequelize"

import SequelizeSlugify from 'sequelize-slugify';
export const Product = sequelize.define("Product", {


    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "users",
            key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false

    },
    slug: {
        type: DataTypes.STRING,
        // unique: true // Importan
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
    },

},
    {
        timestamps: true,
        // paranoid: true,
        tableName: 'product',
    })
// Automatically create slug from name
// Automatically generate slug from name
SequelizeSlugify.slugifyModel(Product, {
    source: ['name'],
    overwrite: false // do not overwrite slug if it already exists
});



