import Redis from "ioredis";

const redis = new Redis();

redis.on("connect",()=>console.log("Redis server connected successfully"));
redis.on("error",()=>console.log("There is an problem while connection to the redis server",error.message));

export {
    redis
}