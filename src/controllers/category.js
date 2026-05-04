import { fr_SN } from "@faker-js/faker";
import { nodeCache } from "../app.js";
import { TryCatch } from "../middleware/error.js";
import { Category } from "../models/category.js";
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url";
import ErrorHandler from '../utils/utilityclass.js'
import { client } from "../utils/elastic.js";
import { Product } from "../models/product_Two.js";
// ✅ Add these two lines at top of your file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const deleteCategoryImage = TryCatch(async (req, res, next) => {
    const { id } = req.params
    const category = await Category.findByPk(id)
    console.log("Category",category.image)
        console.log("Category",category.image)

    if (!category) return next(new ErrorHandler("Invalid category", 400))
    if (!category.image) {
  return next(new ErrorHandler("No image found", 400))
}
            const imagePath=path.join(__dirname,"..",category.image)
            if(fs.existsSync(imagePath)){
                fs.unlinkSync(imagePath)
            }
            await category.update({image:null});
            nodeCache.del("categories");
    return res.status(200).json({
        success: true,
        message: "Category deleted successfully"
    })
})



export const createCategory = TryCatch(async (req, res, next) => {
       console.log("req.body:", req.body)       // 👈 check body
    console.log("req.file:", req.file)       // 👈 check file
    console.log("req.headers:", req.headers) //
    const { name } = req.body
    const image= req.file?.path
    console.log("Req.file",req.file)
    console.log("image",req)
    if(!image){
      return next(new ErrorHandler("Image is required", 400))
    }
    const category = await Category.create({ name,image })
        // ✅ CLEAR CACHE after create
    nodeCache.del("categories");
    return res.status(201).json({
        success: true,
        message: `Category ${category.name} created successfully`
    })
})

export const getAllCategories = TryCatch(async (req, res, next) => {
    let categories;
    if (nodeCache.has("categories")) {
        categories = JSON.parse(nodeCache.get("categories"))
    }

    else {
        categories = await Category.findAll({
            attributes:['name','image']
        })
        nodeCache.set("categories", JSON.stringify(categories))
    }
    return res.status(200).json({
        success: true,
        categories
    })
})

export const getAdminCategories=TryCatch(async (req, res, next) => {
    let categories;
    if (nodeCache.has("categories")) {
        categories = JSON.parse(nodeCache.get("categories"))
    }

    else {
        categories = await Category.findAll({
            attributes:['id','name','image',]
        })
        nodeCache.set("categories", JSON.stringify(categories))
    }
    return res.status(200).json({
        success: true,
        categories
    })
})


export const getSingleCategory = TryCatch(async (req, res, next) => {
    const { id } = req.params
    const category = await Category.findByPk(id)
    if (!category) return next(new ErrorHandler("Invalid category", 400))
    return res.status(200).json({
        success: true,
        category
    })
})

export const updateCategory = TryCatch(async (req, res, next) => {
    const { id } = req.params
    const { name } = req.body
    const image =req.file?.path
    if(!image){
      return next(new ErrorHandler("Image is required", 400))
    }
    const category = await Category.findByPk(id)
    if (!category) return next(new ErrorHandler("Invalid category", 400))
    if (name !== undefined || image!==undefined)
         category.name = name
        category.image=image
    await category.save()
    nodeCache.del("categories");  
    return res.status(200).json({
        success: true,
        message: "Category updated successfully"
    })
})

export const deleteCategory = TryCatch(async (req, res, next) => {
    const { id } = req.params
    const category = await Category.findByPk(id)
    if (!category) return next(new ErrorHandler("Invalid category", 400))
    await category.destroy()
 nodeCache.del("categories");
    return res.status(200).json({
        success: true,
        message: "Category deleted successfully"
    })
})


 export const filterCategory =TryCatch(async (req,res)=>{
  
 const {slug}=req.params;
   const {q,price}=req.query;
   console.log("price",price)
  const filterClause=[]
let category;
  if(slug){
      category=await Category.findOne({where:{name:slug}})
  
  }

//    if(q) filter.push({match:{name:q}})
if (price) {
    // Remove any characters that aren't numbers or the hyphen
    const cleanPrice = price.replace(/[^0-9-]/g, ''); 
    const [min, max] = cleanPrice.split("-").map(Number);

    console.log("Fixed price log:", min, max);

    if (!isNaN(min) || !isNaN(max)) {
        const rangeObj = {};
        if (!isNaN(min)) rangeObj.gte = min;
        if (!isNaN(max)) rangeObj.lte = max;

        filterClause.push({
            range: { price: rangeObj }
        });
    }
}

if(category)  filterClause.push({term:{category_id:category.id}})

//    console.log("filter",filter) 
 const result=await client.search({
     index:'products',
     body:{
         query:{
             bool:{
              filter:filterClause
             }
         }
     }
 })
   const hits = result.body.hits.hits;
          const suggestions = hits.map(hit => ({
    name: hit._source.name,
    slug: hit._source.slug,
    price: hit._source.price,
    image: hit._source.image,
    stock: hit._source.stock > 0, // ✅ just boolean, not actual count
}));
        console.log("price suggestion ",suggestions)
 return res.status(200).json({
        success: true,
        suggestions
        // message: "Cat"
    })


 })