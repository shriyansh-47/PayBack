// ESModule method:-
import dotenv from 'dotenv'
dotenv.config({
    path:'./.env' // path of .env file
})

import mongoose from 'mongoose'
import { DB_NAME } from './constants.js'
import express from 'express'
import {app} from './app.js'

// M2 :- (separate file for db connection is made)
import connectDB from './db/index.js'
connectDB()
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