import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Chat } from "../models/chat.model.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary
} from "../services/cloudinary.service.js";
import { redis } from "../server/redis/redis.server.js";

const sendMediaToReciever = asyncHandler(async (req, res) => {
    const senderId = req.user?._id;
    if (!senderId) {
        throw new ApiError(401, "Sender not verified")
    }
    const { receiverId } = req.params;
    if (!receiverId) {
        throw new ApiError(400, "Reciever id is required")
    }

    if(!mongoose.isValidObjectId(receiverId)){
        throw new ApiError(400,"Reciever id is invalid")
    }

    let media = { videos: [], audios: [], images: [] }

    if (req.files) {
        for (const file of req.files) {
            const response = await uploadOnCloudinary(file.path);
            const mediaUrls = {
                url: response.url,
                publicId: response.public_id
            };
            if (file.mimetype.startsWith("video/")) {
                media.videos.push(mediaUrls);
            } else if (file.mimetype.startsWith("audio/")) {
                media.audios.push(mediaUrls);
            } else if (file.mimetype.startsWith("image/")) {
                media.images.push(mediaUrls);
            }
        }
    }
    if (Object.keys(media).length === 0) {
        throw new ApiError((400, "At least 1 file is required to send"))
    }
    const senderSocket = await redis.get(`user:${senderId}`)
    const receiverSocket = await redis.get(`user:${receiverId}`)
    if (!senderSocket || !receiverSocket) {
        throw new ApiError(404, "Sender or reciever socket is missing")
    }
    const newChat = await Chat.create({
        senderId: senderId,
        receiverId: receiverId,
        media: media
    })
    
    req.io.to(receiverSocket).emit("receiveMessage", {
        newChat
    })
    req.io.to(senderSocket).emit("messageDelivered", {
        messageId: newChat._id,
        receiverId
    });
    return res
        .status(201)
        .json(new ApiResponse(201, newChat, "File sent Successfully"))
})

const sendMediaToGroup = asyncHandler(async (req, res) => {
    const senderId = req.user?._id;
    if (!senderId) {
        throw new ApiError(401, "Sender not verified")
    }
    const { groupId } = req.params;
    if (!groupId) {
        throw new ApiError(400, "groupId is required")
    }

    if(!mongoose.isValidObjectId(groupId)){
        throw new ApiError(400,"Group id is invalid")
    }

    let media = { videos: [], audios: [], images: [] }

    if (req.files) {
        for (const file of req.files) {
            const response = await uploadOnCloudinary(file.path);
            const mediaUrls = {
                url: response.url,
                publicId: response.public_id
            };
            if (file.mimetype.startsWith("video/")) {
                media.videos.push(mediaUrls);
            } else if (file.mimetype.startsWith("audio/")) {
                media.audios.push(mediaUrls);
            } else if (file.mimetype.startsWith("image/")) {
                media.images.push(mediaUrls);
            }
        }
    }
    if (Object.keys(media).length === 0) {
        throw new ApiError((400, "At least 1 file is required to send"))
    }
    const senderSocket = await redis.get(`user:${senderId}`)
    if (!senderSocket) {
        throw new ApiError(404, "Sender socket is missing")
    }
    const newChat = await Chat.create({
        senderId: senderId,
        groupId: groupId,
        media: media
    })
    req.io.to(groupId).emit("receiveMessage", {
        newChat
    })
    req.io.to(senderSocket).emit("messageDelivered", {
        messageId: newChat._id,
        groupId
    });
    return res
        .status(201)
        .json(new ApiResponse(201, newChat, "File sent Successfully"))
})

const getChatOfMember = asyncHandler(async (req, res) => {
    const senderId = req.user?._id;
    if (!senderId) {
        throw new ApiError(401, "Sender not verified")
    }
    const { receiverId } = req.params;
    if (!receiverId) {
        throw new ApiError(400, "Reciever id is required")
    }
    if (!mongoose.isValidObjectId(receiverId)) {
        throw new ApiError(400, "Receiver id is invalid")
    }

    const chatKey = `chat:${senderId}:${receiverId}`;
    const message = await redis.get(chatKey);
    if (message) {
        return res
            .status(200)
            .json(new ApiResponse(200, message, "Message fetched successfully"))
    }

    const chat = await Chat.find({
        $or: [
            { senderId: senderId, receiverId: receiverId },
            { senderId: receiverId, receiverId: senderId }
        ]
    }).sort({
        createdAt: 1
    })

    if (!chat) {
        throw new ApiError(404, "No coversation found !")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, chat, "Chat fetched successfully"))
})

const getChatOfGroup = asyncHandler(async (req, res) => {
    const senderId = req.user?._id;
    if (!senderId) {
        throw new ApiError(401, "Sender not verified")
    }
    const { groupId } = req.params;
    if (!groupId) {
        throw new ApiError(400, "group Id is required")
    }
    if (!mongoose.isValidObjectId(groupId)) {
        throw new ApiError(400, "Receiver id is invalid")
    }

    const chatKey = `chat:${senderId}:${groupId}`
    const message = await redis.get(chatKey);
    if (message) {
        return res
            .status(200)
            .json(new ApiResponse(200, message, "Message fetched successfully"))
    }
    const chat = await Chat.find({
        senderId: senderId, groupId: groupId
    }).sort({
        createdAt: 1
    })

    if (!chat) {
        throw new ApiError(404, "No coversation found !")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, chat, "Chat fetched successfully"))
})

const deleteMedia = asyncHandler(async (req, res) => {
    const senderId = req.user?._id;
    if (!senderId) {
        throw new ApiError(401, "Sender not verified")
    }
    const { chatId } = req.params;
    if (!chatId) {
        throw new ApiError(400, "messageId is required")
    }
    const { mediaUrl, mediaType } = req.body;
    if (!mediaUrl || !mediaType) {
        throw new ApiError(400, "Media Url and media type is required")
    }
    const chat = await Chat.findById(chatId);

    if (!chat) {
        throw new ApiError(404, "Media doesn't exist in the chat")
    }
    const mediaArray = chat.media[mediaType];

    const fileIndex = await mediaArray.findIndex(file => file.url.trim().toString() === mediaUrl.trim().toString()); 

    if (fileIndex === -1) {
        return res.status(404).json({ message: "File not found" });
    }
    const public_id = mediaArray[fileIndex].publicId;
    if(!public_id){
        throw new ApiError(404,"Unable to find public id")
    }
    const response = await deleteFromCloudinary(public_id, "image");
    if (!response) {
        throw new ApiError(500, "Unable to delete the file from cloudinary")
    }

    mediaArray.splice(fileIndex, 1);
    await chat.save();

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Media deleted successfully"))

})

const deleteSingleChat = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    if (!chatId) {
        throw new ApiError(400, "Chat id is required")
    }
    if (!mongoose.isValidObjectId(chatId)) {
        throw new ApiError(400, "Chat id is invalid")
    }
    // const chatKey = `chat:${senderId}:${receiverId}`;
    // await redis.del(chatKey);
    const chat = await Chat.findByIdAndDelete(chatId);
    if (!chat) {
        throw new ApiError(404, "Chat with the give id doesn't exist")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Chat deleted successfully"))

})

const deleteAllGroupChats = asyncHandler(async (req, res) => {
    const senderId = req.user?._id;
    if (!senderId) {
        throw new ApiError(401, "Sender not verified")
    }
    const { groupId} = req.params;
   
    if (groupId) {
        if (!mongoose.isValidObjectId(groupId)) {
            throw new ApiError(400, "group Id is invalid")
        }
        const chatKey = `chat:${senderId}:${groupId}`;
        await redis.del(chatKey);

        const chat = await Chat.deleteMany({ senderId: senderId, groupId: groupId });
        if (!chat) {
            throw new ApiError(404, "Chat with the given group id not found")
        }else{
            console.log("Chat deleted")
        }

        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Group Chat deleted successfully"))
    }else{
        throw new ApiError(404,"Group id not found")
    }
})

const deleteAllUserChats = asyncHandler(async (req, res) => {
    const senderId = req.user?._id;
    if (!senderId) {
        throw new ApiError(401, "Sender not verified")
    }
    const { receiverId} = req.params;
   
    if (receiverId) {
        if (!mongoose.isValidObjectId(receiverId)) {
            throw new ApiError(400, "receiverId is invalid")
        }
        const chatKey = `chat:${senderId}:${receiverId}`;
        await redis.del(chatKey);

        const chat = await Chat.deleteMany({ senderId: senderId, receiverId: receiverId });
        if (!chat) {
            throw new ApiError(404, "Chat with the given receiver Id not found")
        }else{
            console.log("Chat deleted")
        }

        return res
            .status(200)
            .json(new ApiResponse(200, {}, "User Chat deleted successfully"))
    }else{
        throw new ApiError(404,"Receiver Id not found")
    }
})

export {
    sendMediaToGroup,
    sendMediaToReciever,
    getChatOfMember,
    getChatOfGroup,
    deleteSingleChat,
    deleteAllGroupChats,
    deleteMedia,
    deleteAllUserChats
}