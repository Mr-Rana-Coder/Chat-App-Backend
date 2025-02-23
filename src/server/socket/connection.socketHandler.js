import { redis } from "../redis/redis.server.js";
import { Group } from "../../models/group.model.js";
import mongoose from "mongoose";

const joinGroups = async (socket, userId) => {
    if (!userId) {
        console.log("User id didn't recieved")
        return;
    }
    const extractedUserId = userId.userId ? userId.userId.toString() : userId.toString();
    const objectUserId = new mongoose.Types.ObjectId(extractedUserId);
    const userGroups = await Group.find({ members: objectUserId }).select("_id")
    if (!userGroups) {
        console.log("User is not in any group")
        return;
    }
    userGroups.forEach(group => {
        socket.join(group._id.toString());
        console.log(`User ${socket.id} joined group ${group._id}`);
    });
}

const handleConnectionEvents = (socket) => {
    socket.on("join", async (userId) => {
        const extractedUserId = userId.userId ? userId.userId.toString() : userId.toString();
        if (extractedUserId) {
            await redis.set(`user:${extractedUserId}`, socket.id)
            await redis.set(`socket:${socket.id}`, extractedUserId);
            
            await joinGroups(socket, userId);
            console.log(`User ${extractedUserId} connected on socket ${socket.id}`);
            
        }
    });

    socket.on("disconnect", async () => {
        const userId = await redis.get(`socket:${socket.id}`);
        console.log(`🔴 Disconnecting user: ${userId}`);
        if (userId) {
            await redis.del(`user:${userId.toString()}`);
            await redis.del(`socket:${socket.id}`);
            console.log("User disconnected:", socket.id);
        }
    });
};

export {
    handleConnectionEvents
}