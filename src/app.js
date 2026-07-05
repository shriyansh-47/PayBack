import express from 'express'
import cors from 'cors' // for cross-origin-resourse-sharing
import cookieParser from 'cookie-parser'

const app = express()

// These middlewares are written at the top of file then routes come in
app.use(cors({
    origin: process.env.CORS_ORIGIN, // means these origins will only be allowed 
    credentials:true // means authentication pieces like COOKIES, Authorization headers (JWT TOKENS) would also be included with the request
    // credentials:"include" would also be need to be done in the code from where request is being sent
}))

// cors() is a middleware
// app.use() is used when we want to implement any middleware or set some configurations

app.use(express.json({
    limit:'16kb' // max size of data that client can send with request
}))
// express.json() is also a middleware that parses the data sent by the client into JSON format
// and stores it into the req.body
// otherwise req.body contains raw bytes of data
// internally express.json() has the same foundation like a standard middleware


app.use(express.urlencoded({
    extended:true,
    limit:'16kb'
}))

app.use(express.static("public")) //If a client requests a file from this folder, send it directly instead of writing a route for it.
// had we not written this and some one accessed like
// http://localhost:8000/favicon
// then we'd have to write a separate app.get() function so as to handle this
// since we wrote this so it first checks the public folder for such file and if it finds, well and good 
// otherwise the request moves to other middlewares (since interanlly next() is being used)
/*
Every request passes through this middleware
Request arrives
      │
      ▼
express.static("public")
      │
      ├── Does the requested file exist in public/?
      │
      ├── YES → Send the file and stop.
      │
      └── NO → next()
                   │
                   ▼
           Next middleware/route
*/

app.use(cookieParser()) 
// enables the server to access and perform CRED op. on user's cookies
// req.cookies() can be used after using ts

// ROUTES
import UserRouter from './routes/user.routes.js'

//Routes declaration
app.use('/api/v1/user', UserRouter)
/*
This means if any reuest comes to the server with url  starting with '/api/v1/users', send it to the UserRouter
Incoming Request
        │
        ▼
Is URL starting with /api/v1/users ?
        │
      Yes
        │
        ▼
Pass request to UserRouter after removing the prefix of '/api/v1/users' from the URL
At the router it checks if the incoming request is '/register' if yes the run the callback
that is essentially a contoller writter in another file.
Hence we get 
{
    "message": "ok"
}
as response and status code 200.

*/


export { app } // this is also a type of named-export