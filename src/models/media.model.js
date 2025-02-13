import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
    images:[{
        type:String,
    }],
    audios:[{
        type:String
    }],
    videos:[{
        type:String
    }]
},{timestamps:true});

const Media = mongoose.model("Media",mediaSchema);

export {
    Media
}