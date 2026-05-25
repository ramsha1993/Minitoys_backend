import { v2 as cloudinary } from "cloudinary";

export const deleteFromCloudinary = async (urls = []) => {
    const publicIds = urls
        .filter(Boolean)
        .map(url => {
            const parts = url.split("/");
            const filename = parts.at(-1).split(".")[0];
            const folder = parts.at(-2);
            return `${folder}/${filename}`;
        });

    if (publicIds.length === 0) return;

   const response= await cloudinary.api.delete_resources(publicIds);
    console.log("Deleted from Cloudinary:", publicIds);
      return response;
};