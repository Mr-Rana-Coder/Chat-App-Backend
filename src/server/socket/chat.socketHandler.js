import { Chat } from "../../models/chat.model.js";
import { redis } from "../redis/redis.server.js";
import mongoose from "mongoose";

const handleChatEvents = (socket, io) => {
    socket.on("sendMessage", async ({ senderId, receiverId, message, media }) => {
        if (!senderId || !receiverId || (!message && !media)) return;
        const extractedReceiverId = receiverId.receiverId ? receiverId.receiverId.toString() : receiverId.toString();
        const extractedsenderId = senderId.senderId ? senderId.senderId.toString() : senderId.toString();

        const receiverSocket = await redis.get(`user:${extractedReceiverId}`)
        if (receiverSocket) {
            const newMessage = await Chat.create({
                senderId,
                receiverId,
                message: message || "",
                isRead: true,
                media: media || null
            });
            const chatKey = `chat:${extractedsenderId}:${extractedReceiverId}` 
            await redis.lpush(chatKey, JSON.stringify(message));
            await redis.ltrim(chatKey, 0, 99);
            await redis.expire(chatKey, 3600);

            io.to(receiverSocket).emit("receiveMessage", newMessage);
            io.to(socket.id).emit("messageDelivered", {
                messageId: newMessage._id,
                receiverId
            });
        }
        else {
            await Chat.create({
                senderId,
                receiverId,
                message: message || "",
                isRead: false,
                media: media || null
            });
            console.log(`User ${receiverId} is offline. Message stored in DB.`);

        }
    });

    socket.on("readOfflineMessage", async (receiverId) => {
        const extractedReceiverId = receiverId.receiverId ? receiverId.receiverId.toString() : receiverId.toString();
        const objectRecieverId = new mongoose.Types.ObjectId(extractedReceiverId);
        const unreadMessage = await Chat.find({
            receiverId: objectRecieverId,
            isRead: false
        })
        io.to(socket.id).emit("receiveOfflineMessages", unreadMessage);
        await Chat.updateMany({ receiverId: objectRecieverId, isRead: false }, { isRead: true });
    })

    socket.on("sendMessageToGroup", async ({ senderId, groupId, message, media }) => {
        const extractedsenderId = senderId.senderId ? senderId.senderId.toString() : senderId.toString();
        const extractedGroupId = groupId.groupId ? groupId.groupId.toString() : groupId.toString();
        if (!senderId || !groupId || (!message && !media)) return;
        const newGroupMessage = await Chat.create({
            senderId,
            groupId,
            message: message || "",
            isRead: false,
            media: media || null
        });

        const chatKey = `chat:${extractedsenderId}:${extractedGroupId}`
        await redis.lpush(chatKey, JSON.stringify(message));
        await redis.ltrim(chatKey, 0, 99);
        await redis.expire(chatKey, 3600);

        io.to(groupId).emit("receiveGroupMessage", newGroupMessage);

        io.to(socket.id).emit("messageDelivered", {
            messageId: newGroupMessage._id,
            groupId
        });
    });

    socket.on("markAsRead", async ({ senderId, receiverId, groupId, messageId }) => {
        if (!senderId || !messageId || (!receiverId && !groupId)) return;
        const extractMessageId = messageId.messageId ? messageId.messageId.toString() : messageId.toString();
        if (receiverId) {
            await Chat.findByIdAndUpdate(extractMessageId, { isRead: true });
            console.log(`Message ${extractMessageId} marked as read`);
        }
        if (groupId) {
            await Chat.findByIdAndUpdate(extractMessageId, { isRead: true });
            console.log(`Message ${extractMessageId} marked as read`);
        }
    });
};

export {
    handleChatEvents
}
