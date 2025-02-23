import mongoose, { Schema } from "mongoose";

const chatSchema = new mongoose.Schema({
    groupId: {
        type: Schema.Types.ObjectId,
        ref: "Group"
    },
    senderId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiverId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    message: {
        type: String,
    },
    isRead: {
        type: Boolean,
        default: false
    },
    media: {
        video: [{ url: String, publicId: String, _id: false }],
        audio: [{ url: String, publicId: String, _id: false }],
        image: [{ url: String, publicId: String, _id: false }]
    }
}, { timestamps: true });

const Chat = mongoose.model("Chat", chatSchema);

export {
    Chat
}