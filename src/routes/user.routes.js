import { Router } from 'express'
import { loginUser, logoutUser, registerUser } from '../controllers/user.controller.js'
import { verifyJwt } from '../middlewares/auth.middleware.js'

const router = Router()

router.route('/register').post(registerUser)
// this is same as router.post('/register', registerUser)
// .route() helps chaining of HTTP methods further down the line
// like .route('/register').post(c1).get(c2).delete(c3)
// if we used normal approach we'd have to write like this
// router.post('/register', c1)
// router.get('/register', c2)
// router.delete('/register', c3)


router.route('/login').post(loginUser)

// secured routes
router.route('/logout').post(verifyJwt,logoutUser)
// verifyJwt is a middleware,
// so a reuqest when comes to the url /logout, it first goes to the middleware verifyJwt
// there if we verified the user we'd add a new field to the the req object i.e. user
// this user field contains all info about the user i.e its _id, username, fullName, etc
// this info can be used to successfully logout the current user.
// the request after verifyJwt goes to logoutUser controller where all logging-out happens

export default router