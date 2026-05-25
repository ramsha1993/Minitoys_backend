import constants from "node:constants";
import { TryCatch } from "../middleware/error.js";
import { Product } from "../models/product_Two.js";
import ErrorHandler from "../utils/utilityclass.js";
import { rm } from "node:fs";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
import slugify from 'slugify';
import { nodeCache } from "../app.js";
import { InvalidateCache } from "../utils/feature.js";
import { client } from '../utils/elastic.js'
import sequelize from "../../db.js";
import { Op, literal } from "sequelize"; // <-- this is the class
import fs from 'fs';
import csv from "csv-parser";
import { User } from "../models/user_two.js";
import XLSX from 'xlsx';
import { Category } from "../models/category.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import rateLimit from "express-rate-limit";
import {
  parseCSV, cleanupFile, buildCategoryMap,
  fetchExistingNames, validateRows, indexToOpenSearch,
} from "../helpers/producthelpers.js";




dotenv.config();




export const createProduct = TryCatch(async (req, res, next) => {
const { name, price, stock, category_id, description } = req.body
const user_id = req.user.id
console.log("name, price, stock, category_id, description",name, price, stock, category_id, description)
const photo = req.files.find(f => f.fieldname === "image")
const additionalImage = req.files
    .filter(f => f.fieldname === "additional_images")
    .map(f => f.path)

    const product = await Product.findOne({ where: { name } })
    
    if (product) return next(new ErrorHandler("Product already exists", 400))
    if (!name || !price || !stock || !category_id || !description) {
     
         await deleteFromCloudinary([photo?.path,...additionalImage])
        return next(new ErrorHandler("Please enter all fields", 400))

    }
    const newProduct = await Product.create({
        name, price, stock, category_id, description, image: photo?.path, user_id,additional_images:additionalImage
    })
       console.log("newProduct",newProduct);

      await client.index({
        index: 'products',
        id: newProduct.id,
        body: newProduct.get({ plain: true }),
        refresh: true
    });
   await InvalidateCache(products)
    return res.status(201).json({
        success: true,
        message: `Product ${newProduct.name} created successfully`
    })

})

// Revalidate on new,update and delete product & new order & change in stock

export const getLatestProducts = TryCatch(async (req, res, next) => {
    let products = []
    if (nodeCache.has('latestProducts')) {
        products = JSON.parse(nodeCache.get('latestProducts'))

    }
    else {

        products = await Product.findAll({
            order: [['createdAt', 'DESC']],
        })

        nodeCache.set("latestProducts", JSON.stringify(products))
    }
    return res.status(200).json({
        success: true,
        products
    });
});
export const updateProducts = TryCatch(async (req, res, next) => {
    const {slug } = req.params
    const { name, price, stock, category_id, description } = req.body
const photo = req.files.find(f => f.fieldname === "image")
const additionalImage = req.files
    .filter(f => f.fieldname === "additional_images")
    .map(f => f.path)

    const product = await Product.findOne({where:{slug}})
if (!product) {
  if (photo) {
    fs.unlink(photo.path, (err) => {
      if (err) console.log("Error deleting uploaded image:", err)
    })
  }

  if (additionalImage.length > 0) {
    additionalImage.forEach(imgPath => {
      fs.unlink(imgPath, (err) => {
        if (err) console.log("Error deleting additional image:", err)
      })
    })
  }

  return next(new ErrorHandler("Invalid product", 400))
}

    if (name !== undefined) product.name = name
    if (price !== undefined) product.price = price
    if (stock !== undefined) product.stock = stock
    if (category_id !== undefined) product.category_id = category_id
    if (description !== undefined) product.description = description
   if (photo !== undefined) {
    if (product.image) {
      fs.unlink(product.image, (err) => {
        if (err) console.log("Error deleting old image:", err)
      })
    }
    product.image = photo.path
  }

  // ✅ Bug 1 fixed
  if (additionalImage.length > 0) {
    product.additional_images = additionalImage
  }

    await product.save()
    await client.update({
        index:"products",
        id:product.id,
        body:{
            doc:{
                name,
                stock,
                image,
                description,
                category_id,
                price
            }
        }
    })
    await InvalidateCache(products)
    return res.status(200).json({
        success: true,
        message: "Product updated successfully"
    })
})


export const getAdminProducts = TryCatch(async (req, res, next) => {
    let products;
    if (nodeCache.has("adminProducts")) {
        products = JSON.parse(nodeCache.get("adminProducts"))
        console.log("Key Exists")
    }
    else {
        products = await Product.findAll()
        console.log("Key Not Exists")
        nodeCache.set("adminProducts", JSON.stringify(products))
    }
    return res.status(200).json({
        success: true,
        products
    })
})




// export const bulkCreateFromExcel =TryCatch( async (req, res,next) => {
//   if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
//   // Parse Excel
//   const workbook = XLSX.readFile(req.file.path);
//   const user_id=req.user.id;
//   const sheet  = workbook.Sheets[workbook.SheetNames[0]];
//   const rows   = XLSX.utils.sheet_to_json(sheet);
//   if (!rows.length) return res.status(400).json({ error: 'Excel sheet is empty' });
//   // Validate & shape rows
//   const errors   = [];
//   const categories=await Category.findAll({})
//   const products = rows.map((row, i) => {
   
//     const rowNum = i + 2; // +2 because row 1 is header
//     const categoryName = row.category ? String(row.category).toLowerCase().trim() : "";
// const category=categories.find((e)=>e.name.toLowerCase()== categoryName)
// if(!category) return  next(new ErrorHandler("Invalid category", 404))
//     if (!row.name)  errors.push(`Row ${rowNum}: missing name`);
//     if (!row.price) errors.push(`Row ${rowNum}: missing price`);
// //    const category= await Category.findOne({id:row?.category_id})
// //    if(!category) return next(new ErrorHandler("Invalid category", 400))
//     return {
//       name:        row.name,
//       price:       parseFloat(row.price),
//       description: row.description ?? null,
//        category_id:category.id,
//        stock:row.stock,
//       // Cloudinary full URL — already uploaded before making the sheet
//       image: row.image ?? null,
//       user_id:user_id,
//       // Comma-separated Cloudinary URLs in one cell
//       // e.g. "https://res.cloudinary.com/.../a.jpg, https://res.cloudinary.com/.../b.jpg"
//       additional_images: row.additional_images
//         ? row.additional_images.split(',').map(s => s.trim())
//         : [],
//     };
//   });

//   if (errors.length) return res.status(400).json({ errors });

//   // Bulk insert (reuses your transaction pattern)
//   const transaction = await sequelize.transaction();
//   try {
//     const result = await Product.bulkCreate(products, { transaction });
    
    
//     const bulkBody=result.flatMap(product=>[
//        { index:{_index:'products',_id:product.id}},
//         product.get({plain:true})
//     ])
//   const response=  await client.bulk({
//         body:bulkBody,
//         refresh: true  

//     })
//   if(response.errors){
//     const failedItems= response.items.filter((item,i)=>item.index?.error).map((item)=>item.index._id)
  
//       const successfullItems= response.items.filter((item,i)=>!item.index?.error).map((item)=>item.index._id)
//     const deleteBody = result
//     .filter(p => successfullItems.includes(String(p.id))).flatMap(product => [
//                 { delete: { _index: 'products', _id: product.id } }
//             ]);

//         if (deleteBody.length) {
//             await client.bulk({ body: deleteBody, refresh: true });
//         }
//          await transaction.rollback();
//    return res.status(500).json({ error: 'OpenSearch indexing failed' });
     
// }

// await transaction.commit();
//     res.status(201).json({
//       message: `${result.length} products created`,
//       data: result,
//     });
//   } catch (err) {
//     await transaction.rollback();
//     console.log(" bulk error",err)
//     res.status(400).json({ error: err.message });
//   }
// })
// export const bulkCreateFromCSV = TryCatch(async (req, res, next) => {
//   if (!req.file) return res.status(400).json({ error: "No file uploaded" });

//   const user_id = req.user.id;
//   const errors = [];
//   const rows = [];

//   await new Promise((resolve, reject) => {
//     fs.createReadStream(req.file.path)
//       .pipe(csv())
//       .on("data", (data) => rows.push(data))
//       .on("end", resolve)
//       .on("error", reject);
//   });

//   if (!rows.length) {
//     return res.status(400).json({ error: "CSV file is empty" });
//   }

//   const categories = await Category.findAll({});

//   const products = rows.map((row, i) => {
//     const rowNum = i + 2;
//     const categoryName = row.category ? String(row.category).toLowerCase().trim() : "";
//     const category = categories.find(
//       (e) => e.name.toLowerCase().trim() === categoryName
//     );

//     if (!category) {
//       errors.push(`Row ${rowNum}: invalid category`);
//       return null;
//     }

//     if (!row.name) errors.push(`Row ${rowNum}: missing name`);
//     if (!row.price) errors.push(`Row ${rowNum}: missing price`);

//     return {
//       name: row.name,
//       price: parseFloat(row.price),
//       description: row.description ?? null,
//       category_id: category.id,
//       stock: row.stock ? parseInt(row.stock, 10) : 0,
//       image: row.image ?? null,
//       user_id,
//       additional_images: row.additional_images
//         ? String(row.additional_images).split(",").map((s) => s.trim())
//         : [],
//     };
//   }).filter(Boolean);

//   if (errors.length) {
//     return res.status(400).json({ errors });
//   }

//   const transaction = await sequelize.transaction();

//   try {
//     const result = await Product.bulkCreate(products, { transaction });

//     const bulkBody = result.flatMap((product) => [
//       { index: { _index: "products", _id: product.id } },
//       product.get({ plain: true }),
//     ]);

//     const response = await client.bulk({
//       body: bulkBody,
//       refresh: true,
//     });

//     if (response.errors) {
//       const successfullItems = response.items
//         .filter((item) => !item.index?.error)
//         .map((item) => item.index._id);

//       const deleteBody = result
//         .filter((p) => successfullItems.includes(String(p.id)))
//         .flatMap((product) => [
//           { delete: { _index: "products", _id: product.id } },
//         ]);

//       if (deleteBody.length) {
//         await client.bulk({ body: deleteBody, refresh: true });
//       }

//       await transaction.rollback();
//       return res.status(500).json({ error: "OpenSearch indexing failed" });
//     }

//     await transaction.commit();

//     return res.status(201).json({
//       message: `${result.length} products created`,
//       data: result,
//     });
//   } catch (err) {
//     await transaction.rollback();
//     return res.status(400).json({ error: err.message });
//   } 
// });




const MAX_ROWS = 500;

export const bulkCreateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many bulk-upload requests, please try again later." },
});

export const bulkCreateFromCSV = TryCatch(async (req, res) => {
  const filePath = req.file?.path;
  if (!filePath) return res.status(400).json({ error: "No file uploaded." });

  try {
    // 1. Parse
    let rows;
    try { rows = await parseCSV(filePath); 
console.log("rows:", rows);  
console.log("rows length:", rows.length); 
    }
 catch (err) {  //  add err
  console.error("CSV parse error:", err);
  return res.status(400).json({ error: "Failed to parse CSV file." });
}

    // 2. Row-count guards
    if (!rows.length )        return res.status(400).json({ error: "CSV file is empty." });
    if (rows.length > MAX_ROWS) return res.status(400).json({ error: `CSV exceeds the ${MAX_ROWS}-row limit (got ${rows.length}).` });

    // 3. Load reference data in parallel
    const [categoryMap, existingNameSet] = await Promise.all([
      buildCategoryMap(),
      fetchExistingNames(rows.map((r) => (r.name ?? "").trim()).filter(Boolean), req.user.id),
    ]);

    // 4. Validate
    const { errors, products } = validateRows(rows, categoryMap, existingNameSet);
    if (errors.length) return res.status(400).json({ errors });

    // 5. Persist
    const transaction = await sequelize.transaction();
    try {
      const result  = await Product.bulkCreate(
        products.map((p) => ({ ...p, user_id: req.user.id })),
        { transaction }
      );
      const indexed = await indexToOpenSearch(result);
      if (!indexed) {
        await transaction.rollback();
        return res.status(500).json({ error: "OpenSearch indexing failed." });
      }
      await transaction.commit();
     await InvalidateCache(products)
          cleanupFile(filePath);
      return res.status(201).json({ message: `${result.length} products created successfully.`, data: result });
    } catch (err) {
      await transaction.rollback();
      return res.status(400).json({ error: err.message });
    }

  } 
  catch (err) {
// handle and respond
await cleanupFile(filePath); // explicit cleanup on error path
return res.status(400).json({ error: err.message });
  }
  finally {
    cleanupFile(filePath);
    console.log("file deleted")
  }
});


export const getAllProducts = TryCatch(async (req, res, next) => {
    const { name, category } = req.query
    const page = Number(req.query.page) || 1
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8
    const skip = (page - 1) * limit
    const baseQuery = {}

    if (name) {

        baseQuery[Op.or] = [
            { name: { [Op.like]: `%${name}%` } },
            { description: { [Op.like]: `%${name}%` } }
        ]
    }

    if (category) {
        baseQuery.category_id = category
    }
    // if (price) {
    //     baseQuery.price = { [Op.lte]: price }
    // }
    const sortOrder = req.query.sort === 'sort' ? 'high-to-low' : 'ASC';

    const products = await Product.findAndCountAll({
        where: baseQuery,
        limit: limit, offset: skip,
        order: [['price', sortOrder]],
        attributes:["name","price","slug","stock","image","additional_images","description"]
    })
    console.log("get products", products.rows)
    return res.status(200).json({

        success: true,
        products: products.rows,
        sortOrder,
        totalProducts: products.count,
        currentPage: page,
        totalPages: Math.ceil(products.count / limit)
    })
})

export const deleteProducts = TryCatch(async (req, res, next) => {
    const { id } = req.params
    const product = await Product.findByPk(id)
    if (!product) return next(new ErrorHandler("Invalid product", 400))
      const imagesToDelete = [
        product.image,                        // main image
        ...(product.additional_images || [])  // additional images
    ];
     console.log("product.image",[
        product.image,                        // main image
        ...(product.additional_images || [])  // additional images
    ])
    await product.destroy()
   try {
        const response = await client.delete({
            index: 'products',
            id: product.id,
            refresh: true
        });
       
        console.log("ES deleted", response);
    } catch (searchError) {
        console.error("ES delete failed:", searchError.message);
    }

    // delete from Cloudinary
    await deleteFromCloudinary(imagesToDelete);

    InvalidateCache(product)
    return res.status(200).json({
        success: true,
        message: "Product deleted successfully"
    })
})

export const getSingleProduct = TryCatch(async (req, res, next) => {
    let product;
    let seller_name;
    let seller_id;
    const { slug } = req.params
    if (nodeCache.has(`product-${slug}`)) {
        product = JSON.parse(nodeCache.get(`product-${slug}`))
    }
    else {
        product = await Product.findOne({ where: { slug } })
        nodeCache.set(`product-${slug}`, JSON.stringify(product))
    }
            console.log("product",product)
        const user_id = product?.dataValues?.user_id || product?.user_id;
        console.log("userid",user_id)
        const user = await User.findOne({ where: { id: user_id } });
        console.log("user",user)
         seller_name =user?.dataValues?.name 
         seller_id=user_id
         console.log("seller_name",seller_name)
         console.log("seller_id",seller_id)
    if (!product) return next(new ErrorHandler("Invalid product", 400))
    return res.status(200).json({
        success: true,
        product,
        sellerName:seller_name,
        seller_id:seller_id
        
    })
})






export const searchProducts = TryCatch(async (req, res) => {
    const { q } = req.query;
    console.log("Query",q)

    if (!q) return res.json([]);

    try {
        const result = await client.search({
            index: "products",
         body:{query: {multi_match: { // multi_match is better than match
                        query: q,
                        fields: ["name", "description"], // Search in both name and description
                        fuzziness: "AUTO" // Handles typos!
                    } }},
            size: 10
        });
        console.log("result", result)
        const hits = result.body.hits.hits;
        console.log("hits",hits)
     const suggestions = hits.map(hit => ({
    name: hit._source.name,
    slug: hit._source.slug,
    price: hit._source.price,
    image: hit._source.image,
    stock: hit._source.stock > 0, // ✅ just boolean, not actual count
}));
        return res.status(200).json({
            success: true,
            message: "Search query",
            suggestions
        })
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});



