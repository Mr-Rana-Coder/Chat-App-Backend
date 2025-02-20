import { Chat } from "../../models/chat.model.js";
import { redis } from "../redis/redis.server.js";

const handleChatEvents = (socket, io) => {
    socket.on("sendMessage", async ({ senderId, receiverId, message, media }) => {
        if (!senderId || !receiverId || (!message && !media)) return;

        const chatKey = `chat:${senderId}:${receiverId}`
        await redis.lpush(chatKey, JSON.stringify(message));
        await redis.ltrim(chatKey, 0, 99);
        await redis.expire(chatKey, 3600);

        const receiverSocket = await redis.get(`user:${receiverId}`)
        if (receiverSocket) {
            const isChatAvailable = await Chat.findOne({
                senderId,
                receiverId,
            }).sort({ _id: -1 }).exec();

            if (!isChatAvailable.message || isChatAvailable.message.trim() === "") {
                isChatAvailable.message = message || "";
                isChatAvailable.isRead = true;
                isChatAvailable.media = media || null
                await isChatAvailable.save();

                io.to(receiverSocket).emit("receiveMessage", isChatAvailable);
                io.to(socket.id).emit("messageDelivered", {
                    messageId: isChatAvailable._id,
                    receiverId
                });
            } else {
                const newMessage = await Chat.create({
                    senderId,
                    receiverId,
                    message: message || "",
                    isRead: true,
                    media: media || null
                });
                io.to(receiverSocket).emit("receiveMessage", newMessage);
                io.to(socket.id).emit("messageDelivered", {
                    messageId: newMessage._id,
                    receiverId
                });
            }
        } else {
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
        const unreadMessage = await Chat.find({
            receiverId: receiverId,
            isRead: false
        })
        io.to(socket.id).emit("receiveOfflineMessages", unreadMessage);
        await Chat.updateMany({ receiverId, isRead: false }, { isRead: true });
    })

    socket.on("joinGroup", ({ groupId }) => {
        if (!groupId) return;
        socket.join(groupId);
        console.log(`User ${socket.id} joined group ${groupId}`);
    });

    socket.on("sendMessageToGroup", async ({ senderId, groupId, message, media }) => {

        if (!senderId || !groupId || (!message && !media)) return;

        const chatKey = `chat:${senderId}:${groupId}`
        await redis.lpush(chatKey, JSON.stringify(message));
        await redis.ltrim(chatKey, 0, 99);
        await redis.expire(chatKey, 3600);

        const newGroupMessage = await Chat.create({
            senderId,
            groupId,
            message: message || "",
            isRead: false,
            media: media || null
        });

        io.to(groupId).emit("receiveGroupMessage", newGroupMessage);

        io.to(socket.id).emit("messageDelivered", {
            messageId: newGroupMessage._id,
            groupId
        });
    });

    // Mark Message as Read
    socket.on("markAsRead", async ({ messageId }) => {
        await Chat.findByIdAndUpdate(messageId, { isRead: true });
        await redis.hset(`message:${messageId}`, "isRead", true);
        console.log(`Message ${messageId} marked as read`);
    });
};

export {
    handleChatEvents
}
