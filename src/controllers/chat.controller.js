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

    let media = { videos: [], audios: [], images: [] }

    if (req.files) {
        for (const file of req.files) {
            const response = await uploadOnCloudinary(file.path);
            const mediaUrls = {
                url: response.url,
                public_id: response.public_id
            }
            if (file.mimetype.startsWith("video/")) {
                media.videos.push(mediaUrls);
            } else if (file.mimetype.startsWith("audio/")) {
                media.audios.push(mediaUrls);
            } else if (file.mimetype.startsWith("image/")) {
                media.images.push(mediaUrls);
            }
        }
    }
    req.io.emit("sendMessage", {
        senderId,
        receiverId,
        media: mediaUrls
    });

    res
        .staus(201)
        .json(new ApiResponse(201, {}, "File sent Successfully"))

})

const sendMediaToGroup = asyncHandler(async (req, res) => {
    const senderId = req.user?._id;
    if (!senderId) {
        throw new ApiError(401, "Sender not verified")
    }
    const { groupId } = req.params;
    if (!groupId) {
        throw new ApiError(400, "group Id is required")
    }
    let mediaUrls = { videos: [], audios: [], images: [] };

    if (req.files) {
        for (const file of req.files) {
            const response = await uploadOnCloudinary(file.path);
            if (file.mimetype.startsWith("video/")) {
                mediaUrls.videos.push(response.url);
            } else if (file.mimetype.startsWith("audio/")) {
                mediaUrls.audios.push(response.url);
            } else if (file.mimetype.startsWith("image/")) {
                mediaUrls.images.push(response.url);
            }
        }
    }

    req.io.emit("sendMessageToGroup", {
        senderId,
        groupId,
        media: mediaUrls
    });

    res
        .staus(201)
        .json(new ApiResponse(201, {}, "File sent Successfully"))

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
            { senderId: userId, receiverId: receiverId },
            { senderId: receiverId, receiverId: userId }
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
        senderId: userId, groupId: groupId
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
    const { receiverId } = req.params;
    if (!receiverId) {
        throw new ApiError(400, "Reciever id is required")
    }
    const { mediaUrl, mediaType } = req.body;
    if (!mediaUrl || !mediaType) {
        throw new ApiError(400, "Media Url and media type is required")
    }
    const chat = await Chat.findOne({
        senderId: senderId,
        receiverId: receiverId
    })

    if (!chat) {
        throw new ApiError(404, "Media doesn't exist in the chat")
    }
    const mediaArray = chat.media[mediaType];
    const fileIndex = mediaArray.findIndex(file => file.url === fileUrl);

    if (fileIndex === -1) {
        return res.status(404).json({ message: "File not found" });
    }
    const public_id = mediaArray[fileIndex].public_id;

    const response = await deleteFromCloudinary(public_id, mediaType);
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
    const chatKey = `chat:${senderId}:${receiverId}`;
    await redis.del(chatKey);
    const chat = await Chat.findById(chatId);
    if (!chat) {
        throw new ApiError(404, "Chat with the give id doesn't exist")
    }
    chat.message="";
    await chat.save();

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Chat deleted successfully"))

})

const deleteAllChats = asyncHandler(async (req, res) => {
    const senderId = req.user?._id;
    if (!senderId) {
        throw new ApiError(401, "Sender not verified")
    }
    const { groupId, receiverId } = req.params;
    if (!receiverId) {
        throw new ApiError(400, "receiver Id is required")
    }
    if (!mongoose.isValidObjectId(receiverId)) {
        throw new ApiError(400, "Receiver id is invalid")
    }
    const chatKey = `chat:${senderId}:${receiverId}`;
    await redis.del(chatKey);

    if (groupId) {
        if (!mongoose.isValidObjectId(groupId)) {
            throw new ApiError(400, "group Id is invalid")
        }
        const chatKey = `chat:${senderId}:${groupId}`;
        await redis.del(chatKey);

        const chat = await Chat.find({
            sender: senderId,
            groupId: groupId
        });

        if (!chat) {
            throw new ApiError(404, "Chat with the given group id not found")
        }

        chat.message = "";
        await chat.save();

        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Chat deleted successfully"))
    }

    const chat = await Chat.find({
        sender: senderId,
        receiverId: receiverId
    });

    if (!chat) {
        throw new ApiError(404, "Chat with the given group id not found")
    }

    await chat.delete();

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Chat deleted successfully"))

})

export {
    sendMediaToGroup,
    sendMediaToReciever,
    getChatOfMember,
    getChatOfGroup,
    deleteSingleChat,
    deleteAllChats,
    deleteMedia
}