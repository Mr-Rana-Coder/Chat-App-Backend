import jose from "node-jose";
import { ApiError } from "../utils/ApiError.js";

const accessTokenGeneration = async (payload) => {
    try {
        const exp = Math.floor(Date.now() / 1000) + process.env.ACCESS_TOKEN_EXPIRY;
        const payloadWithExp = { ...payload, exp };

        const encKey = await jose.JWK.asKey(Buffer.from(process.env.ENC_KEY_ACCESS_TOKEN, "base64"), "oct");
        if (!encKey) {
            throw new ApiError(400, "Enc Key is required")
        }
        const encrypted = await jose.JWE.createEncrypt({ format: "compact" }, encKey)
            .update(JSON.stringify(payloadWithExp))
            .final();

        if (!encrypted) {
            throw new ApiError(500, "Payload encryption failed in access token")
        }

        const signKey = await jose.JWK.asKey(Buffer.from(process.env.SIGN_KEY_ACCESS_TOKEN, "base64"), "oct");
        if (!signKey) {
            throw new ApiError(400, "Sign Key is missing")
        }

        const signed = await jose.JWS.createSign({ format: "compact" }, signKey)
            .update(encrypted)
            .final();
        return signed;

    } catch (error) {
        console.error("Unable to generate Access token", error.message);
        throw new ApiError(500, "Access token generation failed");
    }

}

const refreshTokenGeneration = async (payload) => {
    try {
        const exp = Math.floor(Date.now() / 1000) + process.env.REFRESH_TOKEN_EXPIRY;
        const payloadWithExp = { ...payload, exp };

        const encKey = await jose.JWK.asKey(Buffer.from(process.env.ENC_KEY_REFRESH_TOKEN, "base64"), "oct");
        if (!encKey) {
            throw new ApiError(400, "Enc Key is required")
        }
        const encrypted = await jose.JWE.createEncrypt({ format: "compact" }, encKey)
            .update(JSON.stringify(payloadWithExp))
            .final();

        if (!encrypted) {
            throw new ApiError(500, "Payload encryption failed in refresh token")
        }

        const signKey = await jose.JWK.asKey(Buffer.from(process.env.SIGN_KEY_REFRESH_TOKEN, "base64"), "oct");
        if (!signKey) {
            throw new ApiError(400, "Sign Key is missing")
        }
        const signed = await jose.JWS.createSign({ format: "compact" }, signKey)
            .update(encrypted)
            .final();

        return signed;

    } catch (error) {
        console.error("Unable to generate Refresh token", error.message);
        throw new ApiError(500, "Refresh token generation failed");
    }
}

export {
    accessTokenGeneration,
    refreshTokenGeneration
}
