// This middleware is designed to verify JWT, will be used whenever we want to authenticate the user anywhere in the workflow

import { apiError } from "../utils/apiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from 'jsonwebtoken'
import { User } from '../models/user.models.js'

const verifyJwt = asyncHandler( async (req,_,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        // in headers auth field is like Authorization : Bearer <jwttoken>
        // note req. object can also access cookie's' 
        // for res. object its cookie
    
        if(!token){
            throw new apiError(401, "Unauthorized request")
        }
    
        // jwt.verify() verifes the validity of the token and returns the PAYLOAD
        // if verification succeeds
        /*
            JWT
            │
            ├── Decode Header
            ├── Decode Payload
            ├── Recompute Signature using your secret
            ├── Compare signatures
            ├── Check expiry
            └── If everything is valid,
                    return Payload
        */
        const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken._id).select("-password")
    
        if(!user){
            throw new apiError(401,"Invalid Access Token")
        }

        req.user = user
        next()

    } catch (error) {
        throw new apiError(401,error?.message || "Invlaid Access Token")
    }
})

export {verifyJwt}