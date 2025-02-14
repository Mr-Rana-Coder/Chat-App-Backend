import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
    images: [{
        type: String,
    }],
    imagesPublicId: [{
        type: String
    }],
    audios: [{
        type: String
    }],
    audiosPublicId: [{
        type: String
    }],
    videos: [{
        type: String
    }],
    videosPublicId: [{
        type: String
    }]
}, { timestamps: true });

const Media = mongoose.model("Media", mediaSchema);

export {
    Media
}