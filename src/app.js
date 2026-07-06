import express from 'express'
import cors from 'cors' // for cross-origin-resourse-sharing
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN, 
    credentials:true
}))

app.use(express.json({
    limit:'16kb' 
}))

app.use(express.urlencoded({
    extended:true,
    limit:'16kb'
}))

app.use(express.static("public"))

app.use(cookieParser()) 
// enables the server to access and perform CRED op. on user's cookies

// ROUTES
import UserRouter from './routes/user.routes.js'

//Routes declaration
app.use('/api/v1/user', UserRouter)

export { app } // named-export