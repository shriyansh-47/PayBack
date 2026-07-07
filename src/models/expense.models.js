import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
    {
        description: {
            type: String,
            required: true,
            trim: true
        },
        totalAmount: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            required: true
        },
        category: {
            type: String,
            enum: ['Food', 'Transportation', 'Housing', 'Utilities', 'Entertainment', 'Others'],
            default: 'Others'
        },
        date: {
            type: Date,
            default: Date.now
        },
        paidBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group',
            required: true
        },
        splitStrategy: {
            type: String,
            enum: ['EQUAL', 'EXACT', 'PERCENTAGE'],
            default: 'EQUAL'
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        splits: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            amount: {
                type: Number,
                required: true
            },
            percentage: {
                type: Number
            }
        }],

        // Activity log: every partial/full payment against this expense
        settlements: [{
            paidBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            paidTo: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            amount: {
                type: Number,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],

        // Per-user soft-hide: users who have cleared this expense from their view
        hiddenFrom: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    {timestamps: true}
)

export const Expense = mongoose.model('Expense', expenseSchema)