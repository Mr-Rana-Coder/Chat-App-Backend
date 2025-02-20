import { verifyAccessToken } from "../middlewares/joseAuth.middleware.js";
import {upload} from "../middlewares/multer.middleware.js";
import express from "express";
import {
    sendMediaToGroup,
    sendMediaToReciever,
    getChatOfMember,
    getChatOfGroup,
    deleteSingleChat,
    deleteAllChats,
    deleteMedia
} from "../controllers/chat.controller.js";

const router = express.Router();
router.use(verifyAccessToken);

router.route("/send-media-reciever/:recieverId").post(upload.array('mediaFiles', 10), sendMediaToReciever);
router.route("/send-media-group/:groupId").post(upload.array('mediaFiles', 10), sendMediaToGroup);
router.route("/get-chat-reciever/:receiverId").get(getChatOfMember);
router.route("/get-chat-group/:groupId").get(getChatOfGroup);
router.route("/delete-single-chat/:chatId").delete(deleteSingleChat)
router.route("/delete-all-chats/:groupId/:receiverId").delete(deleteAllChats)
router.route("/delete-media/:receiverId").delete(deleteMedia);

export {
    router
}