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
        videos: [{ url: String, public_id: String }],
        audios: [{ url: String, public_id: String }],
        images: [{ url: String, public_id: String }]
    }
}, { timestamps: true });

const Chat = mongoose.model("Chat", chatSchema);

export {
    Chat
}