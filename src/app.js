import express, { urlencoded } from "express";
// import { connectDb } from "./utils/feature.js";
import { errorMiddleware } from "./middleware/error.js";
import user from './routes/user.js'
import { User } from './models/user_two.js'
import product from './routes/product.js'
import category from './routes/category.js'
import sequelize from "../db.js";
import dotenv from "dotenv";
import NodeCache from "node-cache";
import order from './routes/orders.js'
import morgan from "morgan";
import cart from './routes/cart.js'
import { Order } from "./models/order.js";
import { OrderItems } from "./models/orderitems.js";
import "./models/association.js";
const app = express();
dotenv.config();

app.use(express.json());
app.use(morgan('dev'))
app.use(urlencoded({ extended: true }))
const port = process.env.PORT || 4000
// connectDb()
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection to XAMPP successful.');

        // 1. CREATE THE TABLE FIRST
        await sequelize.sync({ force: false, alter: true });
        console.log('Database synced (Tables are ready).');

        // 2. DEFINE ROUTES AFTER SYNC (Best practice)




    } catch (error) {
        console.error(' Error starting server:', error);
        process.exit(1);
    }
};

startServer();
export const nodeCache = new NodeCache()
app.get("/", (req, res) => res.send("Hi"));
app.use('/api/v1/user', user);
app.use('/api/v1/product', product);
app.use('/api/v1/category', category);
app.use('/api/v1/order', order);
app.use('/api/v1/cart', cart);
app.use(errorMiddleware);
// 3. START LISTENING ONLY NOW
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});