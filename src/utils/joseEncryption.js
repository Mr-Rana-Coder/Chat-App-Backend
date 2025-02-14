import jose from "node-jose";

const encryptPayloadAccessToken = async (payload) => {
    const encKey = await jose.JWK.asKey(Buffer.from(process.env.ENC_KEY_ACCESS_TOKEN, "base64"), "oct");
    if (!encKey) {
        throw new ApiError(400, "Enc Key is required")
    }
    const encrypted = await jose.JWE.createEncrypt({ format: "compact" }, encKey)
        .update(JSON.stringify(payload))
        .final();
    return encrypted;
}

const signPayloadAccessToken = async (encryptedData) => {
    const signKey = await jose.JWK.asKey(Buffer.from(process.env.SIGN_KEY_ACCESS_TOKEN, "base64"), "oct");
    if (!signKey) {
        throw new ApiError(400, "Sign Key is missing")
    }
    const signed = await jose.JWS.createSign({ format: "compact" }, signKey)
        .update(encryptedData)
        .final();

    return signed;
};

const encryptPayloadRefreshToken = async (payload) => {
    const encKey = await jose.JWK.asKey(Buffer.from(process.env.ENC_KEY_REFRESH_TOKEN, "base64"), "oct");
    if (!encKey) {
        throw new ApiError(400, "Enc Key is required")
    }
    const encrypted = await jose.JWE.createEncrypt({ format: "compact" }, encKey)
        .update(JSON.stringify(payload))
        .final();
    return encrypted;
}

const signPayloadRefreshToken = async (encryptedData) => {
    const signKey = await jose.JWK.asKey(Buffer.from(process.env.SIGN_KEY_REFRESH_TOKEN, "base64"), "oct");
    if (!signKey) {
        throw new ApiError(400, "Sign Key is missing")
    }
    const signed = await jose.JWS.createSign({ format: "compact" }, signKey)
        .update(encryptedData)
        .final();

    return signed;
};

export {
    encryptPayloadAccessToken,
    encryptPayloadRefreshToken,
    signPayloadAccessToken,
    signPayloadRefreshToken
}
