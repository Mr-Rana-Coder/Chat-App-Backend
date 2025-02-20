import { redis } from "../redis/redis.server.js";

const handleConnectionEvents = (socket, io, onlineUsers) => {
    socket.on("join", async (userId) => {
        if (userId) {
            await redis.set(`user:${userId}`, socket.id)
            await redis.set(`socket:${socket.id}`, userId);
            console.log(`User ${userId} connected on socket ${socket.id}`);
        }
    });

    socket.on("disconnect", async () => {
        const userId = await redis.get(`socket:${socket.id}`);
        if (userId) {
            await redis.del(`user:${userId}`);
            await redis.del(`socket:${socket.id}`);
            console.log("User disconnected:", socket.id);
        }
    });
};

export {
    handleConnectionEvents
}