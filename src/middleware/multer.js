import multer from "multer";
import path from "node:path";
import { v4 as uuid } from "uuid";
const storage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, "uploads");
    },
    filename(req, file, callback) {
        const ext = path.extname(file.originalname);
        const id = uuid()
        callback(null, id + ext); // unique filename
    },
});

export const singleUpload = multer({ storage }).single("image");
