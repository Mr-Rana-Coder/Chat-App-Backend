import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const router = express.Router();

router.route("/").get(asyncHandler(async(_,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200,{},"Health check is working fine"))
}))

export {
    router
}