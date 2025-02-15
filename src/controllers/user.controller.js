import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

import {
    accessTokenGeneration,
    refreshTokenGeneration
} from "../utils/joseEncryption.js";

import {
    hashPassword,
    verifyPassword
} from "../config/passwordEncryption.config.js";

import {
    uploadOnCloudinary,
    deleteFromCloudinary
} from "../utils/Cloudinary.js";


const registerUser = asyncHandler(async (req, res) => {
    const { userName, fullName, email, password } = req.body;
    if ([userName, fullName, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }
    const isUserAvailable = await User.findOne({
        $or: [{ userName: userName }, { email: email }]
    })
    if (isUserAvailable) {
        throw new ApiError(400, "User already exists")
    }

    const filePath = req.file?.path;
    if (!filePath) {
        throw new ApiError(404, "File path is required")
    }

    const response = await uploadOnCloudinary(filePath);

    if (!response) {
        throw new ApiError(404, "File uploadation failed.")
    }

    const encryptedPassword = await hashPassword(password);
    if (!encryptedPassword) {
        throw new ApiError(400, "Password encryption unsuccessfull")
    }

    const user = await User.create({
        userName: userName,
        email: email,
        fullName: fullName,
        password: encryptedPassword,
        avatar: response.url,
        avatarPublicId: response.public_id
    })

    if (!user) {
        throw new ApiError(400, "Unable to register user")
    }

    const userDetail = await User.findById(user._id).select("-password -refreshToken - avatarPublicId");

    return res
        .status(201)
        .json(new ApiResponse(201, userDetail, "User registeration successfull"))

})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ApiError(400, "Email and password both are required")
    }
    const user = await User.findOne({
        email: email
    });

    if (!user) {
        throw new ApiError(404, "User doesn't exists !")
    }

    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Password is invalid")
    }

    const payload = {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        userName: user.userName
    }

    const accessToken = await accessTokenGeneration(payload);
    const refreshToken = await refreshTokenGeneration(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    const userDetail = await User.findById(userId).select("-password -refreshToken -avatarPublicId")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, {
            user: userDetail,
            accessToken: accessToken,
            refreshToken: refreshToken
        }, "User logged in successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "User is not authenticated")
    }
    const userDetail = await User.findById(userId).select("-password -refreshToken -avatarPublicId")

    if (!user) {
        throw new ApiError(404, "User doesn't exists")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, userDetail, "User details fetched successfully"))
})

const logoutUser = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "User is not authenticated")
    }
    const user = await User.findByIdAndUpdate(userId, {
        $unset: {
            refreshToken: 1
        }
    }, { new: true })

    options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"))
})

const updatePassword = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "User is not authenticated")
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Old and new password are required")
    }
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User doesn't exist")
    }
    const isPasswordValid = await verifyPassword(oldPassword, user.password);

    if (!isPasswordValid) {
        throw new ApiError(400, "Old password is incorrect")
    }
    user.password = await hashPassword(newPassword);
    await user.save();

    const userDetail = await User.findById(userId).select("-password -refreshToken -avatarPublicId")

    return res
        .status(200)
        .json(new ApiResponse(200, userDetail, "User password updated successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if(!userId){
        throw new ApiError(401,"")
    }
    const user = await User.findById(userId);
    if(!user){
        throw new ApiError(404,"User not exists"0)
    }
    const payload = {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        userName: user.userName
    }

    const accessToken = await accessTokenGeneration(payload);
    const refreshToken = await refreshTokenGeneration(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    const userDetail = await User.findById(userId).select("-password -avatarPublicId -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, {
            user: userDetail,
            accessToken: accessToken,
            refreshToken: refreshToken
        }, "Acess Token refreshed"))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "User is not authenticated")
    }

    const {userName,fullName} = req.body;
    const allowedUpdates = {};
    if(userName){
        allowedUpdates.userName = userName;
    }
    if(fullName){
        allowedUpdates.fullName = fullName;
    }
    if(Object.keys(allowedUpdates).length === 0){
        throw new ApiError(400, "At least 1 field is required to be updated")
    }
    cons user = await User.findByIdAndUpdate(userId,allowedUpdates,{new:true});

    if(!user){
        throw new ApiError(404,"User doesn't exist")
    }

    const userDetail = await User.findById(userId).select("-password -refreshToken -avatarPublicId")
    
    return res
    .status(200)
    .json(new ApiResponse(200,userDetail,"User details updated"))

})

const updateAccountAvatar = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "User is not authenticated")
    }
    const user = await User.findById(userId);
    if(!user){
        throw new ApiError(404,"User with the given id doesn't exist")
    }
    const path = req.file?.path;
    const response = await uploadOnCloudinary(path);

    user.avatar = response.url;
    user.avatarPublicId = response.public_id;
    await user.save();

    const userDetail = await User.findById(userId).select("-password -refreshToken -avatarPublicId")

    return res
    .status(200)
    .json(new ApiResponse(200,userDetail,"Avatar Updated successfully"))
})

const deleteUser = asyncHandler(async(req,res)=>{
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "User is not authenticated")
    }
    const user = await User.findByIdAndDelete(userId);

    if(!user){
        throw new ApiError(404,"User doesn't exist")
    }

    const options ={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User deleted successfully"))
})
export {
    registerUser,
    loginUser,
    getCurrentUser,
    logoutUser,
    updatePassword,
    refreshAccessToken,
    updateAccountDetails,
    updateAccountAvatar,
    deleteUser
}