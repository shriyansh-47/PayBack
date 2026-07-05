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

const generateAccessAndRefreshToken = async (userId)=>{
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        // const refreshToken = user.generateRefreshToken()
        
        // user.refreshToken = refreshToken
        // await user.save({validateBeforeSave:false})
        // validateBeforeSave tells Mongoose 
        // whether it should run schema validations before saving the document.

        return accessToken
    }
    catch(error){
        throw new apiError(500, "Something went wrong while generating Tokens")
    }
}

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
            return element?.trim() == "" // k/a optional chaining
            // this means if element is not null/undefined then only use .trim() on it
        })
    ){
        throw new apiError(400,'All fields are required !!')
    }

    // validity of email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)){
        throw new apiError(400, "Please provide a valid email address."); 
    }

    // checking pre-existence of user
    // findOne gives the 1st matching document it gets in DB
    const doesExist = await User.findOne({
        $or: [{username},{email}] 
        // $or is a MongoDB query operator.
        // Each object represents one matching condition.
        // If a document matches either condition, findOne() returns it; otherwise it returns null.
    })
    if(doesExist){
        throw new apiError(409, 'This user already exists.')
    }


    // Creating entry in DB
    const user = await User.create({
        fullName: fullName.toUpperCase(),
        username: username.toLowerCase(),
        email, // this is using the property of JS object known as shorthand
        // since the document's field name and the variable names are same so no need to
        // write like email:email, it automatically detects this.
        password
    })

    // removing password + checking if user was created
    const userCreated = await User.findById(user._id).select(
        "-password" // fields with -ve signs & separated by space are not selected 
        // rest by default all are selected
    )
    // we never send passwords & token info to the front-end

    // checking if user was created
    if(!userCreated){
        throw new apiError(500, "Something went wrong when registering new user.")
    }

    // returning back a response to the front-end
    return response.status(201).json(
        new apiResponse(201, userCreated, "User created successfully !!")
    )

})



const loginUser = asyncHandler( async (request,response)=>{
    // get data entered using request.
    // username or email base entry
    // find the user in db
    // if user found check pass
    // generate access & refresh tokens
    // send cookies

    const {email, username, password} = request.body

    if(!username && !email){
        throw new apiError(400, "Provide atleast one of username or password")
    }

    // Checking existence of USER :-
    // Always use await when quering the DB (DB on another continent)
    const user = await User.findOne({
        $or: [{username},{email}]
    })

    if(!user){
        throw new apiError(404,"User doesnt exist !!")
    }

    // here User wont be used since its a mongoose instance
    // we'll have to check using our current user-object (i.e. "user")
    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new apiError(401,"Password Incorrect !!")
    }

    const accessToken = await generateAccessAndRefreshToken(user._id)

    // Note -> the mongoose document of user isnt updated with the
    // refreshToken field till now coz we did that with another object in the function & not the current one
    // do we gotta update it

    // making another DB call may be time consuming, see better methods too
    const ogUser = await User.findById(user._id).select(
        "-password"
    )

    // cookies options:-
    const options = {
        httpOnly: true,
        secure: true
    }

    return response.status(201)
    .cookie("accessToken", accessToken, options)
    .json(
        new apiResponse(
            201,
            {
                user: ogUser, accessToken // shorthad usage
            },
            "Login Successful !!"
        )
    )

})



const logoutUser = asyncHandler( async (req,res) => {
    // to logout delete the accessToken (done by clearing the cookies) & 
    // refreshToken (delete the token from db for this user & also clear the cookies) of the current user
    
    // complete refresh tokens too.
    // await User.findByIdAndUpdate(
    //     // now req object has a field called user
    //     req.user._id,
    //     {
    //         // this is a mongoDB operator that lets create & update already existing/new
    //         // fields 
    //         $set: {refreshToken: undefined}
    //     },
    //     {
    //         new:true // this tells mongoDB what object to return the new updated one or the old one
    //     }
    // )

    const options = {
        httpOnly : true,
        secure : true
    }

    return res.
    status(200)
    .clearCookie("accessToken",options)
    // .clearCookie(refreshToken,options)
    .json(
        new apiResponse(200,{},"User Logged Out Successfully !!") 
    )
})


export {registerUser, loginUser, logoutUser}