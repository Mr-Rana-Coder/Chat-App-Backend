import { Call } from "../../models/call.model.js";
import { redis } from "../redis/redis.server.js";

const handleCallEvents = (socket, io) => {
    socket.on("callUser", async ({ from, to, signalData, callType }) => {
        const recieverSocketId = await redis.get(`user:${to}`);
        if (recieverSocketId) {
            io.to(recieverSocketId).emit("incomingCall", { from, signalData });

            const existingCall = await Call.findOne({
                senderId: from,
                receiverId: to,
            })

            if (!existingCall || ["missed", "ringing", "rejected"].includes(existingCall.callStatus)) {
                await Call.create({
                    senderId: from,
                    receiverId: to,
                    callType: callType,
                    callStatus: "ringing"
                })
            }
        }
    });

    // Answer Call
    socket.on("answerCall", async ({ from, to, signalData }) => {
        const senderSocketId = await redis.get(`user:${from}`)
        const recieverSocketId = await redis.get(`user:${to}`);
        if (recieverSocketId) {
            io.to(senderSocketId).emit("callAccepted", signalData);
            const callDetails = await Call.findOne({
                senderId: from,
                receiverId: to
            })
            if (callDetails && callDetails.callStatus === "ringing") {
                callDetails.startedAt = new Date();
                callDetails.callStatus = "ongoing";
                await callDetails.save();
            }
        }
    });

    // ICE Candidate Exchange
    socket.on("iceCandidate", async({ to, candidate }) => {
        const recieverSocketId = await redis.get(`user:${to}`);
        if (recieverSocketId) {
            io.to(recieverSocketId).emit("iceCandidate", candidate);
        }
    });

    // End Call
    socket.on("endCall", async ({ from, to }) => {
        const recieverSocketId = await redis.get(`user:${to}`);
        const senderSocketId = await redis.get(`user:${from}`)
        if (recieverSocketId) {
            io.to(recieverSocketId).emit("callEnded");
            io.to(senderSocketId).emit("callEnded")
            const callDetails = await Call.findOne({
                senderId: from,
                receiverId: to
            })
            if (callDetails && callDetails.callStatus === "ongoing") {
                callDetails.endedAt = new Date();
                callDetails.callStatus = "ended";
                callDetails.callDuration = Math.abs((callDetails.endedAt - callDetails.startedAt) / 1000);
                await callDetails.save();
            }
        }
    });
};

export {
    handleCallEvents
}