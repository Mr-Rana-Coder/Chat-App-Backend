import mongoose, { Schema } from "mongoose";

const callSchema = new mongoose.Schema({
    callType: {
        type: String,
        enum: ['audio', 'video'],
        required: true
    },
    participants: [{
        user: {
            type: Schema.Types.objectId,
            ref: "User"
        },
        status: {
            type: String,
            enum: ['joined', 'left', 'missed'],
            default: "joined"
        }
    }],
    isGroupCall: {
        type: Boolean,
        default: false
    },
    group: {
        type: Schema.Types.ObjectId,
        ref: "Group"
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    endedAt: {
        type: Date
    },
    callStatus: {
        type: String,
        enum: ["ongoing", "ended", "missed"]
    },
    callDuration: {
        type: Number
    },
    participantsHistory: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        action: { type: String, enum: ['joined', 'left'], required: true },
        timestamp: { type: Date, default: Date.now }
    }],
    videoDetails: {
        resolution: { type: String },
        frameRate: { type: Number },
        callQuality: { type: String, enum: ["low", "medium", "high"] }
    }
}, { timestamps: true })

const Call = mongoose.model("Call", callSchema);

export {
    Call
}