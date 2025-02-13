import mongoose, { Schema } from "mongoose";

const messageSchema = new mongoose.Schema({
    groupId:{
        type:Schema.Types.ObjectId,
        ref:"Group"
    },
    senderId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    receiverId:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    message:{
        type:String,
        required:true
    },
    isRead:{
        type:Boolean,
        default:false
    },
    media:{
        type:Schema.Types.ObjectId,
        ref:"Media"
    }
},{timestamps:true});

const Message = mongoose.model("Message",messageSchema);

export {
    Message
}