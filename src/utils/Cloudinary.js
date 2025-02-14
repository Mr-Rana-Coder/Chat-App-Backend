import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError.js"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            throw new ApiError(400, "Local file path is required")
        }
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log("The file uploaded successfully", response.url)
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath)
        console.error("There is an error while uploading the file to cloudinary", error.message)
        return null;
    }
}

const deleteFromCloudinary = async (publicId, resourceType) => {
    try {
        if (!publicId || !resourceType) {
            throw new ApiError(400, "Public id and resource type both are required")
        }
        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        })
        console.log("The file deleted successfully")
        return response;
    } catch (error) {
        console.error("Error while deleting the file from cloudinary", error)
        return null;
    }
}

export {
    uploadOnCloudinary,
    deleteFromCloudinary
}