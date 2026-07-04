import mongoose, { mongo } from "mongoose";

const expenseSchema = new mongoose.Schema(
    {

    },
    {timestamps: true}
)

export const Expense = mongoose.model('Expense', expenseSchema)