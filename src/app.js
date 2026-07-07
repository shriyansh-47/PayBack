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
import GroupRouter from './routes/group.routes.js'
import ExpenseRouter from './routes/expense.routes.js'
import NotificationRouter from './routes/notification.routes.js'

//Routes declaration
app.use('/api/v1/user', UserRouter)
app.use('/api/v1/group', GroupRouter)
app.use('/api/v1/expense', ExpenseRouter)
app.use('/api/v1/notification', NotificationRouter)

export { app } // named-export