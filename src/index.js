import { connectToDatabase } from "./db/index.js";
import { server } from "./app.js";
import dotenv from "dotenv";


dotenv.config({
    path: "./env"
})

connectToDatabase()
    .then(() => {
        server.listen(process.env.PORT || 8080, () => {
            console.log(`The server is running on ${process.env.PORT} ... `);
        })
    })
    .catch((error) => {
        console.error(`There was a problem while running the server on ${process.env.PORT} because of ${error.message}.`)
    })