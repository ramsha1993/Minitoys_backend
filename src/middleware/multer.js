import multer from "multer";
import path from "path";
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from "../../config/cloudinary.js";
import { v4 as uuid } from "uuid";
const storage = multer.diskStorage({
    destination(req, file, callback) {
        console.log("Multer runing")
        callback(null, "uploads");
    },
    filename(req, file, callback) {
        const ext = path.extname(file.originalname);
        const id = uuid()
        console.log("image file",file)
        callback(null, id + ext); // unique filename
    },
});
const cloudStorage=new CloudinaryStorage({
    cloudinary,
    params:{
        folder: "products",      
    allowed_formats: ["jpg", "png", "jpeg", "gif", "webp"], // allowed file types
     }
})
const cloudStorageCategory=new CloudinaryStorage({
    cloudinary,
    params:{
        folder: "category",      
    allowed_formats: ["jpg", "png", "jpeg", "gif", "webp"], // allowed file types
     }
})

// const excelStorage=multer.diskStorage({
//     destination:'uploads/excel/',
//     filename:(req,file,cb)=>cb(null,`products_${Date.now()}.xlsx`)
// })
const csvStorage = multer.diskStorage({
  destination: "uploads/csv/",
  filename: (req, file, cb) => {
    cb(null, `products_${Date.now()}.csv`);
  },
});


export const singleUpload = multer({ storage }).any();
export const cloudUpload=multer({storage:cloudStorage}).any()
export const cloudSingleUpload=multer({storage:cloudStorageCategory}).single("image")
export const csvUpload = multer({
  storage: csvStorage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isCsv = ext === ".csv" && file.mimetype === "text/csv";
    if (!isCsv) {
      return cb(new Error("Only CSV files are allowed"));
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 },
}).single("file");

export const singleFileUpload=multer({storage}).single("image")
