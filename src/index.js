// require('dotenv').config({path: './env'})  This wont work since its CommonJS format and we require ESModules format
// write this line asap the application starts coz we want our environment-vars to be be available asap everywhere

// ESModule method:-
import dotenv from 'dotenv'
dotenv.config({
    path:'./.env' // path of .env file
})

import mongoose from 'mongoose'
import { DB_NAME } from './constants.js'
import express from 'express'

// const app=express() -> This caused an error when i ran user/register post for the 1st time coz this creates
// a new instance of express() but we want to use the one in app.js thus import it fro there

import {app} from './app.js'

// Connecting to the DB :-
// It is best to warp this connection in try-catch (or) use promises since there can be some errors while connecting
// Always use async-await in this connection coz it might take time

// M1 :-
// ;( async () => {
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error", (error)=>{
//             console.log("Error :",error)
//             throw error
//         })
//         app.listen(process.env.PORT , ()=>{
//             console.log(`App is listening on port ${process.env.PORT}`)
//         })
//     }
//     catch(error){
//         console.error("ERROR :",error)
//         throw error
//     }
// })()

// M2 :- (separate file for db connection is made)
import connectDB from './db/index.js'
connectDB() // since this was an async function thus it returns a promise
.then(()=>{
    app.listen(process.env.PORT || 4000 ,()=>{
        console.log(`Server listening at port ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log("MongoDB connection failed :",error)
})


// Note -> Connecting database doesnt create the database, MongoDb creates databases
// lazily i.e. only when some data is inserted into them. So currently payback_db cant
// be seen on MongoDB Atlas platform.