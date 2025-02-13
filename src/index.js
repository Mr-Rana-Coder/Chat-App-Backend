import {connectToDatabase} from "./db/index.js";
import { app } from "./app.js";
import dotenv from "dotenv";


dotenv.config({
    path:"./env"
})

connectToDatabase()
.then(()=>{
    app.listen(process.env.PORT||8080,()=>{
        console.log(`The server is running on ${process.env.PORT} ... `);
    })
})
.catch((error)=>{
    console.error(`There was a problem while running the server on ${process.env.PORT} because of ${error.message}.`)
})