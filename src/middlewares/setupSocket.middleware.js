import { Server } from "socket.io";
import { handleChatEvents } from "../server/socket/chat.socketHandler.js";
import { handleCallEvents } from "../server/socket/call.socketHandler.js";
import { handleConnectionEvents } from "../server/socket/connection.socketHandler.js";

const onlineUsers = new Map();

export const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN,
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        handleConnectionEvents(socket, io, onlineUsers);
        handleChatEvents(socket, io, onlineUsers);
        handleCallEvents(socket, io, onlineUsers);
    });

    return io;
};
