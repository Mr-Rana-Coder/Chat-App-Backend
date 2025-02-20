import rateLimit from "express-rate-limit";
const reqLimiter = rateLimit({
    windowMs:60*1000,
    max:5,
    message : "Too many requests",
    standardHeaders:true,
    legacyHeaders:false,
    handler:(req,res)=>{
        res.status(429).json({
            success:false,
            message:"Rate limit exceeds",
            remainingReq:0
        })
    }
})

export {
    reqLimiter
}