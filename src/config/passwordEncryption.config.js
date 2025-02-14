import argon2 from "argon2";
import { ApiError } from "../utils/ApiError.js";

const hashPassword = async(password)=>{
    try{
        const hash = await argon2.hash(password);
        return hash;
    }catch(error){
        throw new ApiError(400,"Unable to encrypt the password")
    }
}

const verifyPassword = async(password,hashPassword) =>{
    try {
        const isVerified = await argon2.verify(password,hashPassword);
        return isVerified;
    } catch (error) {
        throw new ApiError(400,"Password verification failed. Invalid password !!")
    }
}

export {
    hashPassword,
    verifyPassword
}