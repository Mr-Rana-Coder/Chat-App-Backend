import mongoose, { Schema } from "mongoose";

const callSchema = new mongoose.Schema({
    senderId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    receiverId:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    callType: {
        type: String,
        enum: ['audio', 'video'],
        required: true
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
        enum: ["ongoing", "ended", "missed","ringing"]
    },
    callDuration: {
        type: Number
    },
}, { timestamps: true })

const Call = mongoose.model("Call", callSchema);

export {
    Call
}