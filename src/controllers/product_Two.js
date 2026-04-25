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
// import { client } from '../utils/elastic.js'
import sequelize from "../../db.js";
import { Op, literal } from "sequelize"; // <-- this is the class
import fs from 'fs'
import { User } from "../models/user_two.js";
import XLSX from 'xlsx';
import { Category } from "../models/category.js";


dotenv.config();




export const createProduct = TryCatch(async (req, res, next) => {
const { name, price, stock, category_id, description } = req.body
const user_id = req.user.id
console.log("name, price, stock, category_id, description",name, price, stock, category_id, description)
const photo = req.files.find(f => f.fieldname === "image")
const additionalImage = req.files
    .filter(f => f.fieldname === "additional_images")
    .map(f => f.path)

console.log("photo", photo)
console.log("additionalImage", additionalImage)
    const product = await Product.findOne({ where: { name } })
    if (product) return next(new ErrorHandler("Product already exists", 400))
    if (!name || !price || !stock || !category_id || !description) {
        if (photo || additionalImage) {
            rm(photo?.path , () => {
                console.log("deleted")
            })
// rm(additionalImage?.path, () => {
//                 console.log("deleted")
//             })
        }

        return next(new ErrorHandler("Please enter all fields", 400))

    }
    const products = await Product.create({
        name, price, stock, category_id, description, image: photo?.path, user_id,additional_images:additionalImage
    })

    console.log("product",products)
    console.log("Produt succesfully created")

    await InvalidateCache(products)
    return res.status(201).json({
        success: true,
        message: `Product ${products.name} created successfully`
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

// export const bulkCreate=TryCatch(async (req,res,next)=>{
// const {products}=req.body
// console.log("req.body" ,req.body)
// const result= await Product.bulkCreate(products,{
//     validate:true,
//     ignoreDuplicates:true
// })
// console.log("Result",result)

// res.status(201).json({
// message:`${result.length} Product Created`,
// data:result

// })
// })



export const bulkCreateFromExcel =TryCatch( async (req, res,next) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  // Parse Excel
  const workbook = XLSX.readFile(req.file.path);
  const user_id=req.user.id;
  const sheet  = workbook.Sheets[workbook.SheetNames[0]];
  const rows   = XLSX.utils.sheet_to_json(sheet);
  if (!rows.length) return res.status(400).json({ error: 'Excel sheet is empty' });
  // Validate & shape rows
  const errors   = [];
  const categories=await Category.findAll({})
  const products = rows.map((row, i) => {
   
    const rowNum = i + 2; // +2 because row 1 is header
    const categoryName = row.category ? String(row.category).toLowerCase().trim() : "";
const category=categories.find((e)=>e.name.toLowerCase()== categoryName)
console.log("selected category",categories)
if(!category) return  next(new ErrorHandler("Invalid category", 404))
    if (!row.name)  errors.push(`Row ${rowNum}: missing name`);
    if (!row.price) errors.push(`Row ${rowNum}: missing price`);
//    const category= await Category.findOne({id:row?.category_id})
//    if(!category) return next(new ErrorHandler("Invalid category", 400))
    return {
      name:        row.name,
      price:       parseFloat(row.price),
      description: row.description ?? null,
       category_id:category.id,
       stock:row.stock,
      // Cloudinary full URL — already uploaded before making the sheet
      image: row.image ?? null,
      user_id:user_id,

      // Comma-separated Cloudinary URLs in one cell
      // e.g. "https://res.cloudinary.com/.../a.jpg, https://res.cloudinary.com/.../b.jpg"
      additional_images: row.additional_images
        ? row.additional_images.split(',').map(s => s.trim())
        : [],
    };
  });

  if (errors.length) return res.status(400).json({ errors });

  // Bulk insert (reuses your transaction pattern)
  const transaction = await sequelize.transaction();
  try {
    const result = await Product.bulkCreate(products, { transaction });
    await transaction.commit();

    res.status(201).json({
      message: `${result.length} products created`,
      data: result,
    });
  } catch (err) {
    await transaction.rollback();
    console.log(" bulk error",err)
    res.status(400).json({ error: err.message });
  }
})

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
        order: [['price', sortOrder]]
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
    await product.destroy()
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
export const generateRandomProducts = async (count) => {
    const products = []
    for (let i = 0; i < count; i++) {
        const name = faker.commerce.productName()
        const slug = slugify(name + '-', { lower: true });
        const product = {
            name,
            slug,
            price: faker.commerce.price({ min: 1500, max: 10000 }),
            stock: faker.number.int({ min: 10, max: 100 }),
            category_id: faker.number.int({ min: 1, max: 5 }),
            description: faker.commerce.productDescription(),
            image: `https://picsum.photos/seed/${i}/400/400.webp`,
        }
        products.push(product)
    }
    await Product.bulkCreate(
        products
    )
    console.log("Success")
}
// generateRandomProducts(40)

const delteteAllproducts = async () => {
    const products = await Product.findAll({ offset: 10 })
    console.log("products", products)
    for (let i = 0; i < products.length; i++) {
        await products[i].destroy()
    }
    console.log("products deleted successfully", products)
}
// delteteAllproducts()

const getproducts = async () => {
    products = await Product.findAll({})
    console.log("products", products.map(p => p.toJSON()))
}
getproducts()

let products;

// async function insertProducts() {

//     products = await Product.findAll({})
//     const bulkOps = products.flatMap(product => [
//         { index: { _index: 'product', _id: product.id } },
//         product.toJSON() // converts Sequelize model to plain object
//     ]);
//     await client.bulk({ operations: bulkOps, refresh: true });
//     console.log('✅ Products indexed into Elastic Cloud');
// }



// insertProducts();

// async function DeleteElastic() {
//     products = await Product.findAll({})
//     await client.deleteByQuery({
//         index: 'product',
//         query: {
//             match_all: {}
//         },
//         refresh: true
//     });

// }

// DeleteElastic()


// export const searchProducts = TryCatch(async (req, res) => {
//     const { q } = req.query;

//     if (!q) return res.json([]);

//     try {
//         const result = await client.search({
//             index: "product",
//             query: { match_phrase_prefix: { name: q } },
//             size: 10
//         });
//         console.log("result", result)
//         const suggestions = result.hits.hits.map(hit => hit._source);
//         return res.status(200).json({
//             success: true,
//             message: "Search query",
//             suggestions
//         })
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Elasticsearch search failed" });
//     }
// });


// Delete all products not referenced in orderitems
// Delete all products not referenced in orderitems
// await Product.destroy({
//     where: {
//         id: {
//             [Op.notIn]: literal(`(
//         SELECT DISTINCT product_id FROM orderitems
//         UNION
//         SELECT DISTINCT product_id FROM cartitems
//       )`)
//         },

//     }
// });