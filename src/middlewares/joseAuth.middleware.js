import jose from "node-jose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"


const verifyAccessToken = asyncHandler(async (req, _, next) => {
    const token = req.cookies?.accessToken || req.headers["Authorization"]?.replace("Bearer ", "");
    if (!token) {
        throw new ApiError(401, "Unauthorised request")
    }

    const signKey = await jose.JWK.asKey(Buffer.from(process.env.SIGN_KEY_ACCESS_TOKEN, "base64"), "oct");

    if (!signKey) {
        throw new ApiError(400, "Sign key is required")
    }

    const result = await jose.JWS.createVerify(signKey).verify(token);

    if ((!result.payload)) {
        throw new ApiError(401, "Inavlid Signature")
    }

    const encKey = await jose.JWK.asKey(Buffer.from(process.env.ENC_KEY_ACCESS_TOKEN, "base64"), "oct");

    if (!encKey) {
        throw new ApiError(400, "Enc key is required")
    }

    const decrypt = await jose.JWE.createDecrypt(encKey).decrypt(result.payload.toString());
    const decryptedData = JSON.parse(decrypt.plaintext.toString());

    if (!decryptedData._id) {
        throw new ApiError(401, "Data decryption failed")
    }

    if (decryptedData.exp && decryptedData.exp < Math.floor(Date.now() / 1000)) {
        throw new ApiError(401, " Access Token expired");
    }

    const user = await User.findById(decryptedData._id).select("-password")

    if (!user) {
        throw new ApiError(404, "User doesn't exists")
    }

    req.user = user;
    next();
})

const verifyRefreshToken = asyncHandler(async (req, _, next) => {
    const token = req.cookies?.refreshToken || req.headers["Authorization"]?.replace("Bearer ", "");
    if (!token) {
        throw new ApiError(401, "Unauthorised request")
    }

    const signKey = await jose.JWK.asKey(Buffer.from(process.env.SIGN_KEY_REFRESH_TOKEN, "base64"), "oct");

    if (!signKey) {
        throw new ApiError(400, "Sign key is required")
    }

    const result = await jose.JWS.createVerify(signKey).verify(token);

    if ((!result.payload)) {
        throw new ApiError(401, "Inavlid Signature")
    }

    const encKey = await jose.JWK.asKey(Buffer.from(process.env.ENC_KEY_REFRESH_TOKEN, "base64"), "oct");

    if (!encKey) {
        throw new ApiError(400, "Enc key is required")
    }

    const decrypt = await jose.JWE.createDecrypt(encKey).decrypt(result.payload.toString());
    const decryptedData = JSON.parse(decrypt.plaintext.toString());

    if (!decryptedData._id) {
        throw new ApiError(401, "Data decryption failed")
    }

    if (decryptedData.exp && decryptedData.exp < Math.floor(Date.now() / 1000)) {
        throw new ApiError(401, " Access Token expired");
    }

    const user = await User.findById(decryptedData._id).select("-password")

    if (!user) {
        throw new ApiError(404, "User doesn't exists")
    }

    req.user = user;
    next();
})

export {
    verifyAccessToken,
    verifyRefreshToken
}
