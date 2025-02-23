import { verifyAccessToken } from "../middlewares/jwtAuth.middleware.js";
import {upload} from "../middlewares/multer.middleware.js";
import express from "express";
import {
    sendMediaToGroup,
    sendMediaToReciever,
    getChatOfMember,
    getChatOfGroup,
    deleteSingleChat,
    deleteAllGroupChats,
    deleteMedia,
    deleteAllUserChats
} from "../controllers/chat.controller.js";

const router = express.Router();
router.use(verifyAccessToken);

router.route("/send-media-reciever/:receiverId").post(upload.array('mediaFiles', 10), sendMediaToReciever);
router.route("/send-media-group/:groupId").post(upload.array('mediaFiles', 10), sendMediaToGroup);
router.route("/get-chat-reciever/:receiverId").get(getChatOfMember);
router.route("/get-chat-group/:groupId").get(getChatOfGroup);
router.route("/delete-single-chat/:chatId").delete(deleteSingleChat)
router.route("/delete-media/:chatId").delete(deleteMedia);
router.route("/delete-all-group-chats/:groupId").delete(deleteAllGroupChats)
router.route("/delete-all-user-chats/:groupId").delete(deleteAllUserChats)

export {
    router
}