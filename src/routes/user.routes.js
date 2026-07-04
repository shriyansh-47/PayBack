import { Router } from 'express'
import { registerUser } from '../controllers/user.controller.js'

const router = Router()

router.route('/register').post(registerUser)
// this is same as router.post('/register', registerUser)
// .route() helps chaining of HTTP methods further down the line
// like .route('/register').post(c1).get(c2).delete(c3)
// if we used noremal approach we'd have to write like this
// router.post('/register', c1)
// router.get('/register', c2)
// router.delete('/register', c3)


export default router