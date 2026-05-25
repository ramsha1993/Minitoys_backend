import express from "express";
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
import cors from "cors";
import address from './routes/address.js'
import path from "path";
const app = express();
const __dirname = path.resolve();
import { client } from './utils/elastic.js';
import { Product } from "./models/product_Two.js";
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'









const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500,                  // 100 requests per IP
    message: { status: 429, error: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

dotenv.config();
app.use(cors({
    origin: ['https://mini-toys.vercel.app/', 'https://minitoys.ae', 'https://admin.minitoys.ae'],
    credentials: true
}));
// allow all origins
app.use(express.json());
app.use(morgan('dev'))
app.use(helmet());
app.use(express.urlencoded({ extended: true }))
app.use(globalLimiter);
const port = process.env.PORT || 4000
// connectDb()



// Test connection
async function testElastic() {
    try {
        await client.ping();
        console.log('Elasticsearch is running');
    } catch (error) {
        console.error('Elasticsearch is down:', error.message);
        if (error.statusCode === 401) {
            console.error('👉 Fix the credentials in your .env file or client config.');
        }
    }
}


// async function insertProducts() {
//     try {
//         const products = await Product.findAll({});

//         // Map products to the "Action/Metadata" + "Source" pairs OpenSearch needs
//         const bulkBody = products.flatMap(product => [
//             { index: { _index: 'products', _id: product.id } },
//             product.get({ plain: true }) // Safer way to get raw data from Sequelize
//         ]);

//         // IMPORTANT: Use 'body' (Elastic uses 'operations', OpenSearch uses 'body')
//         const response = await client.bulk({ 
//             body: bulkBody, 
//             refresh: true 
//         });

//         console.log("Response",response)
//         if (response.errors) {
//             console.error('❌ Errors in bulk operation:', response.items);
//         } else {
//             console.log(`✅ ${products.length} products successfully indexed into OpenSearch!`);
//         }
//     } catch (error) {
//         console.error('❌ Indexing failed:', error);
//     }
// }









app.use("/uploads", express.static(path.join(__dirname, "uploads")));
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
app.use('/api/v1/address', address);
app.use(errorMiddleware);
testElastic();
// insertProducts();
// 3. START LISTENING ONLY NOW
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});