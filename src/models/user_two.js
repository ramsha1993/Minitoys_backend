import { Sequelize, DataTypes } from "sequelize";
import sequelize from '../../db.js';

export const User = sequelize.define('users', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true // Ensures the data is actually an email format
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM("admin", "user"),
        allowNull: false,
        defaultValue: "user" // Fixed the case-sensitivity here
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true // true = 1, false = 0
    }
}, {
    timestamps: true,
    paranoid: true,
    tableName: 'users',
});