import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String,
    },
    avatar: {
        type: String,
    },
    avatarPublicId: {
        type: String,
    }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export {
    User
}