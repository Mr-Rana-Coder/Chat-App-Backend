import jose from "node-jose";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {ApiError} from "../utils/ApiError.js";
import User from "../models/user.model.js"


const verifyToken = asyncHandler(async(req,res,next)=>{
    const token = req.cookies?.accessToken || req.headers["Authorization"]?.replace("Bearer ","");
    if(!token){
        throw new ApiError(401,"Unauthorised request")
    }

    signKey = await jose.JWK.asKey(Buffer.from(process.env.SIGN_KEY, "base64"), "oct");

    if(!signKey){
        throw new ApiError(400,"Sign key is required")
    }

    const result = await jose.JWS.createVerify(signKey).verify(token);
    if(!(result.payload.toString())){
        throw new ApiError(401,"Inavlid Signature")
    }

    encKey = await jose.JWK.asKey(Buffer.from(process.env.ENC_KEY, "base64"), "oct");

    if(!encKey){
        throw new ApiError(400,"Enc key is required")
    }

    const decrypt = await jose.JWE.createDecrypt(encKey).decrypt(result.payload.toString());
    const decryptedData = JSON.parse(decrypted.plaintext.toString());

    if(!decryptedData._id){
        throw new ApiError(401,"Data decryption failed")
    }

    const user = await User.findById(decryptedData._id).select("-password ")
    if(!user){
        throw new ApiError(404,"User doesn't exist with the given id")
    }
    
    req.user = user
    next();
})

export {
    verifyToken
}
