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
        members: [{ 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User' 
        }],

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

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