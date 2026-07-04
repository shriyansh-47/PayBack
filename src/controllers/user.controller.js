import { request, response } from 'express'
import { asyncHandler } from '../utils/asyncHandler.js'
import { apiError } from '../utils/apiError.js'
import { User } from '../models/user.models.js'
import { apiResponse } from '../utils/apiResponse.js'

// For testing :-
// const registerUser = asyncHandler( async (request,response) => {
//     // this method can be used to send status-code along with response
//     response.status(200).json({
//         message:"ok"
//     })
// })

const registerUser = asyncHandler( async (request,response) => {
    // get users details from front-end
    // validation of data from client
    // pre-existence of the user
    // avatar if u want, then upload to cloudinary
    // create user object & create entry in DB
    // NOTE -> Whenever we create entry in mongoDB, we get the info inserted as it is back from the db as a response
    // remove password & refresh-token fields from the response
    // check for user-creation if yes then return the response.

    const {fullName, username, email, password} = request.body

    // checking non-emptiness of all data
    if(
        [fullName,username,email,password].some((element)=>{
            return element?.trim() == ""
            // this means if element is not null/undefined then only use .trim() on it
        })
    ){
        throw new apiError(400,'All fields are required !!')
    }

    // validity of email
    if(!email.includes('@')){
        throw new apiError(400, 'Emails must contain "@" symbol')
    }
    

    // checking pre-existence of user
    const doesExist = await User.findOne({
        $or: [{username},{email}]
    })
    if(doesExist){
        throw new apiError(409, 'This user already exists.')
    }


    // Creating entry in DB
    const user = await User.create({
        fullName: fullName.toUpperCase(),
        username: username.toLowerCase(),
        email,
        password
    })

    // removing password + checking if user was created
    const userCreated = await User.findById(user._id).select(
        "-password" // fields with -ve signs & separated by space are not selected 
        // rest by default all are selected
    )

    // checking if user was created
    if(!userCreated){
        throw new apiError(500, "Something went wrong when registering new user.")
    }

    // returning back a response to the front-end
    return response.status(201).json(
        new apiResponse(200,"User created successfully !!")
    )

})
export {registerUser}