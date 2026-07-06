import { Router } from 'express'
import { changeCurrentPassword, getCurrentUser, loginUser, logoutUser, registerUser, searchUsers, updateAccountDetails, updateUserImages } from '../controllers/user.controller.js'
import { verifyJwt } from '../middlewares/auth.middleware.js'
import { upload } from '../middlewares/multer.middleware.js'

const router = Router()

router.route('/register').post(registerUser)

router.route('/login').post(loginUser)

// secured routes
router.route('/logout').post(verifyJwt,logoutUser)
router.route('/me').get(verifyJwt, getCurrentUser)
router.route('/settings').patch(verifyJwt, updateAccountDetails)
router.route('/change-password').post(verifyJwt, changeCurrentPassword)
router.route('/search').get(verifyJwt, searchUsers)
router.route('/images').patch(verifyJwt, upload.fields([{name: "avatar", maxCount: 1}, {name: "coverImage", maxCount: 1}]), updateUserImages)

export default router