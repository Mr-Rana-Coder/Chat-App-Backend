import { Server } from "socket.io";
import { handleChatEvents } from "../server/socket/chat.socketHandler.js";
import { handleCallEvents } from "../server/socket/call.socketHandler.js";
import { handleConnectionEvents } from "../server/socket/connection.socketHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const onlineUsers = new Map();

export const setupSocket = (server) => {
    const io = new Server(server, { 
        cors: {
            origin: process.env.CORS_ORIGIN,
            credentials: true
        }
    });


    io.use(async (socket,next) => {
        const token = socket.handshake.accessToken || socket.handshake.headers.authorization?.replace("Bearer ","");
        if(!token){
            throw new ApiError(400,"User is not authenticated for this request.Please Login")
        }
        const decode = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET_KEY);
        if(!decode){
            console.log("Unable to decode token")
            throw new ApiError(500,"Token decodation failed")
        }
        const user = await User.findById(decode._id);
        if(!user){
            throw new ApiError(404,"User not found please register.")
        }
        socket.user = user;
        next();
    });


    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        handleConnectionEvents(socket);
        handleChatEvents(socket,io);
        handleCallEvents(socket, io, onlineUsers);
    });

    return io;
};
