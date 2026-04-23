import multer from "multer";
import path from "path";
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

export const singleUpload = multer({ storage }).any();

export const singleFileUpload=multer({storage}).single("image")
