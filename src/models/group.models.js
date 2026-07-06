import mongoose, { mongo } from "mongoose";

const groupSchema = new mongoose.Schema(
    {
        name: { 
            type: String, 
            required: true 
        },
        description: {
            type: String,
            default: ''
        },
        // an array where each element is an ObjectId which references a particular user from User model
        members: [{ 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User' 
        }],

        // this is diff from above, as its an array of embedded-objects
        balances: [{
            fromUser: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'User', 
                required: true 
            },
            toUser: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'User', 
                required: true 
            },
            amount: {
                type: Number, 
                required: true, 
                default: 0 
            },
            currency: {
                type: String,
                required: true
            }
        }]
    },
    {timestamps: true}
)

export const Group = mongoose.model('Group' , groupSchema)