import { request, response } from 'express'
import { asyncHandler } from '../utils/asyncHandler.js'
import { apiError } from '../utils/apiError.js'
import { User } from '../models/user.models.js'
import { apiResponse } from '../utils/apiResponse.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'

const generateAccessAndRefreshToken = async (userId)=>{
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
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
    // remove password & refresh-token fields from the response
    // check for user-creation if yes then return the response.

    const {fullName, username, email, password} = request.body

    // checking non-emptiness of all data
    if(
        [fullName,username,email,password].some((element)=>{
            return element?.trim() == ""
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
    const doesExist = await User.findOne({
        $or: [{username},{email}] 
    })
    if(doesExist){
        throw new apiError(409, 'This user already exists.')
    }


    // Handling Avatar Upload
    let avatarUrl = "";
    const avatarLocalPath = request.files?.avatar?.[0]?.path;
    
    if (avatarLocalPath) {
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        if (avatar) {
            avatarUrl = avatar.url;
        }
    }

    // Creating entry in DB
    const user = await User.create({
        fullName: fullName.toUpperCase(),
        username: username.toLowerCase(),
        email,
        password,
        ...(avatarUrl && { avatar: avatarUrl })
    })

    // removing password + checking if user was created
    const userCreated = await User.findById(user._id).select(
        "-password"
    )
    if(!userCreated){
        throw new apiError(500, "Something went wrong when registering new user.")
    }

    // Auto-login: generate token and set cookie exactly as login does
    const accessToken = await generateAccessAndRefreshToken(user._id)
    const options = {
        httpOnly: true,
        secure: true
    }

    // returning back a response to the front-end
    return response.status(201)
    .cookie("accessToken", accessToken, options)
    .json(
        new apiResponse(201, { user: userCreated, accessToken }, "User created successfully !!")
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
    const user = await User.findOne({
        $or: [{username},{email}]
    })

    if(!user){
        throw new apiError(404,"User doesnt exist !!")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new apiError(401,"Password Incorrect !!")
    }

    const accessToken = await generateAccessAndRefreshToken(user._id)

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
                user: ogUser, accessToken
            },
            "Login Successful !!"
        )
    )

})

const logoutUser = asyncHandler( async (req,res) => {
    // to logout delete the accessToken (done by clearing the cookies) & 
    // refreshToken (delete the token from db for this user & also clear the cookies) of the current user
    const options = {
        httpOnly : true,
        secure : true
    }

    return res.
    status(200)
    .clearCookie("accessToken",options)
    .json(
        new apiResponse(200,{},"User Logged Out Successfully !!") 
    )
})

const changeCurrentPassword = asyncHandler( async (req,res) => {

    const {oldPassword, newPassword, confirmPassword} = req.body;

    if(newPassword != confirmPassword){
        throw new apiError(401, "New password & confirm password should be same !!")
    }

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new apiError(400,"Invalid Password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(
        new apiResponse(200,{},"Password changed successfully !!")
    )
})

const getCurrentUser = asyncHandler( async (req,res) => {
    return res
    .status(200)
    .json(new apiResponse(200, req.user, "Current User fetched"))
})

const updateAccountDetails = asyncHandler( async (req,res) => {

    const {username, fullName, email} = req.body

    if(!username || !fullName || !email){
        throw new apiError(400 , "All fields are required !!")
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                username, 
                fullName: fullName, 
                email
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res
    .status(200)
    .json(new apiResponse(200,user,"Account details updated successfully !!"))
})

const searchUsers = asyncHandler(async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(200).json(new apiResponse(200, [], "Empty query"));
    }

    const users = await User.find({
        username: { $regex: query, $options: 'i' }
    }).select("-password");

    return res.status(200).json(new apiResponse(200, users, "Users found"));
});

const updateUserImages = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath && !coverImageLocalPath) {
        throw new apiError(400, "Please upload at least one image (avatar or coverImage)");
    }

    let avatar, coverImage;

    if (avatarLocalPath) {
        avatar = await uploadOnCloudinary(avatarLocalPath);
        if (!avatar) {
            throw new apiError(500, "Error uploading avatar");
        }
    }

    if (coverImageLocalPath) {
        coverImage = await uploadOnCloudinary(coverImageLocalPath);
        if (!coverImage) {
            throw new apiError(500, "Error uploading cover image");
        }
    }

    const updateFields = {};
    if (avatar) updateFields.avatar = avatar.url;
    if (coverImage) updateFields.coverImage = coverImage.url;

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: updateFields },
        { new: true }
    ).select("-password");

    return res.status(200).json(new apiResponse(200, user, "Images updated successfully"));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    searchUsers,
    updateUserImages
}