import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import jwt from "jsonwebtoken";


const verifyAccessToken = asyncHandler(async (req, _, next) => {
    const token = req.cookies?.accessToken || req.headers["Authorization"]?.replace("Bearer ", "");
    if (!token) {
        throw new ApiError(401, "Unauthorised request")
    }

    const decode = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET_KEY);

    if(!decode){
        throw new ApiError(500,"Unable to decode the token")
    }

    const user = await User.findById(decode._id).select("-password")

    if (!user) {
        throw new ApiError(404, "User doesn't exists with the given token")
    }

    req.user = user;
    next();
})

const verifyRefreshToken = asyncHandler(async (req, _, next) => {
    const token = req.cookies?.refreshToken || req.headers["Authorization"]?.replace("Bearer ", "");
    if (!token) {
        throw new ApiError(401, "Unauthorised request")
    }

    const decode = jwt.verify(token,process.env.REFRESH_TOKEN_SECRET_KEY);

    if(!decode){
        throw new ApiError(500,"Unable to decode the token")
    }

    const user = await User.findById(decode._id).select("-password")

    if (!user) {
        throw new ApiError(404, "User doesn't exists with the given token")
    }

    req.user = user;
    next();
})

export {
    verifyAccessToken,
    verifyRefreshToken
}
