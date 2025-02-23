import { ApiError } from "./ApiError.js";
import jwt from "jsonwebtoken";

const accessTokenGeneration = async (payload) => {
    if(!payload){
        throw new ApiError(400,"Payload is required")
    }
    const accessToken = jwt.sign(payload,process.env.ACCESS_TOKEN_SECRET_KEY,{
        expiresIn : process.env.ACCESS_TOKEN_EXPIRY
    });
    if(!accessToken){
        throw new ApiError(500,"Access token generation failed")
    }
    return accessToken;
}

const refreshTokenGeneration = async (payload) => {
    if(!payload){
        throw new ApiError(400,"Payload is required")
    }
    const refreshToken = jwt.sign(payload,process.env.REFRESH_TOKEN_SECRET_KEY,{
        expiresIn : process.env.REFRESH_TOKEN_EXPIRY
    });
    if(!refreshToken){
        throw new ApiError(500,"Refresh token generation failed")
    }
    return refreshToken;
}

export {
    accessTokenGeneration,
    refreshTokenGeneration
}
