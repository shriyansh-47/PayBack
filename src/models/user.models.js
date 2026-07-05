import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const userSchema = new mongoose.Schema(
    {
        username:{
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },
        email:{
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        fullName:{
            type: String,
            required: true,
            trim: true,
            index: true
        },
        // password is never stored as it is in db, therefore its hashed and then stored
        password:{ 
            type: String, 
            required: true 
        },
        friends:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:'User'
            }
        ]
    },
    {timestamps:true}
)

// This is a pre-hook (a middleware in disguise) i.e. it runs automatically just before a 
// specific operation is performed on MongoDB like here 'save' operation.

// this -> refers to the current User's context.
userSchema.pre("save" , 
    // cannot use arrow-function since we need to use .this 
    async function(next){ // async coz encryption might take time
        // this prevents re-hashing of password everytime any changes to the user are made
        if(!this.isModified("password")) return next()
        this.password = await bcrypt.hash(this.password,10)
        // next() -> modern mongoose doesnt support this, it works without next() too fro async funct.
    }
)

// we can create custom-methods for data models that can be used afterwards
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}
// this method cna be used in login.controller to validate the login password


userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        // payload i.e the data of user
        {
           _id:this._id,
           email:this.email,
           username:this.username 
        },

        // secret_key
        process.env.ACCESS_TOKEN_SECRET,
        
        // expiry details of token
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

// Implement Refresh-Tokens in future too.

export const User = mongoose.model('User',userSchema)