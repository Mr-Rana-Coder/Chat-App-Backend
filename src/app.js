import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler.middleware.js"
import http from "http";
import { setupSocket } from "./middlewares/setupSocket.middleware.js"
import { reqLimiter } from "./middlewares/rateLimiter.middleware.js";
import { redis } from "./server/redis/redis.server.js";


const app = express();
const server = http.createServer(app);
const io = setupSocket(server)

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(reqLimiter);

app.use(async (req, _, next) => {
    req.io = io;
    const onlineUsers = await redis.keys("users:*");
    const onlineUsersWithSockets = {};

    for (const userKey of onlineUsers) {
        const userId = userKey.replace("user:", "");
        const socketId = await redis.get(userKey);
        onlineUsersWithSockets[userId] = socketId;
    }

    req.io.onlineUsers = onlineUsersWithSockets;
    next();
});

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//Importing different routers
import { router as userRouter } from "./routes/user.route.js";
import { router as chatRouter } from "./routes/chat.route.js";
import { router as groupRouter } from "./routes/group.route.js";
import { router as healthCheckRouter } from "./routes/healthCheck.route.js"
import { router as callRouter } from "./routes/call.route.js";

app.use("/api/v1/healthCheck", healthCheckRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/group", groupRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/call", callRouter);

app.use(errorHandler)

export {
    app,
    server
}