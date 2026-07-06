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

// this -> refers to the current User's context.
userSchema.pre("save" , 
    async function(next){ 
        if(!this.isModified("password")) return next()
        this.password = await bcrypt.hash(this.password,10)
    }
)

// we can create custom-methods for data models that can be used afterwards
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}

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

export const User = mongoose.model('User',userSchema)