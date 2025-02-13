import mongoose from "mongoose";
import {databaseName} from "../constant.js";

const connectToDatabase = async () =>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.DB_URI}/${databaseName}`);
        console.log(`Database connected to ${connectionInstance.connection.host} this instance.`)
    } catch (error) {
        console.error("There is an error while connecting to Database Please Check !",error);
        process.exit(1);
    }
}

export {
    connectToDatabase
}