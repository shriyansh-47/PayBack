import mongoose from 'mongoose'
import { DB_NAME } from '../constants.js'

const connectDB = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`) // mongoose returns a connection object that holds info about the active DB connection

        console.log(`\nMongoDB Connected !! DB HOST: ${connectionInstance.connection.host}`) // .host returns the URI of the DB which we connected to.
    } catch (error) {
        console.log("MongoDB Connection error :",error)
        process.exit(1) // read about this
    }
}

export default connectDB


