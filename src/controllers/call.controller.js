import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Call } from "../models/call.model.js";
import mongoose from "mongoose";

const getCallDetails = asyncHandler(async (req, res) => {
    const { senderId, receiverId } = req.params;
    if (!senderId || !receiverId) {
        throw new ApiError(400, "Sender id and reciever id both are required")
    }
    if (!mongoose.isValidObjectId(senderId) || !mongoose.isValidObjectId(receiverId)) {
        throw new ApiError(400, "Sender id or reciever id is invalid");
    }
    const callDetails = await Call.find({
        senderId:senderId,
        receiverId:receiverId
    })

    if(!callDetails){
        throw new ApiError(404,"Call details between these two user is not available")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,callDetails,"Call details fetched successfully"))
});

const getCallDetailsByCallId = asyncHandler(async (req, res) => {
    const {callId} = req.params;
    if(!callId){
        throw new ApiError(400,"Call id is required")
    }
    if(!mongoose.isValidObjectId(callId)){
        throw new ApiError(400,"Call id is invalid")
    }

    const callDetails = await Call.findById(callId);
    if(!callDetails){
        throw new ApiError(404,"Call details with the given id is not present")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,callDetails,"Call details fetched successfully"))
});

const deleteCallDetailsById = asyncHandler(async (req, res) => {
    const {callId} = req.params;
    if(!callId){
        throw new ApiError(400,"Call id is required")
    }
    if(!mongoose.isValidObjectId(callId)){
        throw new ApiError(400,"Call id is invalid")
    }
    const callDetails = await Call.findById(callId);
    if(!callDetails){
        throw new ApiError(404,"Call details with the given id is not present")
    }

    await callDetails.deleteOne();
    console.log("file deleted")
    return res
    .status(200)
    .json(new ApiResponse(200,{},"Call detail deleted successfully with the given call id"))
});

export {
    getCallDetailsByCallId,
    getCallDetails,
    deleteCallDetailsById
}