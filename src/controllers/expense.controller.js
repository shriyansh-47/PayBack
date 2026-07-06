import { Expense } from '../models/expense.models.js';
import { Group } from '../models/group.models.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';

const updateBalanceAtomic = async (groupId, fromUser, toUser, amount, currency) => {
    const result = await Group.updateOne(
        { _id: groupId },
        { $inc: { "balances.$[elem].amount": amount } },
        { arrayFilters: [{ "elem.fromUser": fromUser, "elem.toUser": toUser, "elem.currency": currency }] }
    );

    if (result.modifiedCount === 0) {
        await Group.updateOne(
            { _id: groupId },
            { $push: { balances: { fromUser, toUser, amount, currency } } }
        );
    }
};

const createExpense = asyncHandler(async (req, res) => {
    const { description, totalAmount, currency, category, groupId, splitStrategy, splits } = req.body;
    const paidBy = req.user._id;

    if (!description || !totalAmount || !currency || !groupId || !splits) {
        throw new apiError(400, "Missing required fields");
    }

    const group = await Group.findById(groupId);
    if (!group) throw new apiError(404, "Group not found");

    // Process splits based on strategy
    let processedSplits = [];
    if (splitStrategy === 'EQUAL') {
        const amountPerPerson = totalAmount / splits.length;
        processedSplits = splits.map(s => ({ user: s.user, amount: amountPerPerson }));
    } else if (splitStrategy === 'EXACT') {
        processedSplits = splits; // expects {user, amount}
    } else if (splitStrategy === 'PERCENTAGE') {
        processedSplits = splits.map(s => ({ user: s.user, amount: (totalAmount * s.percentage) / 100 }));
    }

    // Verify totals
    const sum = processedSplits.reduce((acc, curr) => acc + curr.amount, 0);
    if (Math.abs(sum - totalAmount) > 0.01) {
        throw new apiError(400, "Split amounts do not equal total amount");
    }

    const expense = await Expense.create({
        description,
        totalAmount,
        currency,
        category: category || 'Others',
        paidBy,
        groupId,
        splitStrategy: splitStrategy || 'EQUAL',
        splits: processedSplits
    });

    // Update balances atomically
    for (const split of processedSplits) {
        if (split.user.toString() !== paidBy.toString()) {
            await updateBalanceAtomic(groupId, split.user, paidBy, split.amount, currency);
        }
    }

    return res.status(201).json(new apiResponse(201, expense, "Expense created successfully"));
});

const deleteExpense = asyncHandler(async (req, res) => {
    const { expenseId } = req.params;

    const expense = await Expense.findById(expenseId);
    if (!expense) throw new apiError(404, "Expense not found");
    if (expense.isDeleted) throw new apiError(400, "Expense is already deleted");

    // Reverse balances atomically
    for (const split of expense.splits) {
        if (split.user.toString() !== expense.paidBy.toString()) {
            await updateBalanceAtomic(expense.groupId, split.user, expense.paidBy, -split.amount, expense.currency);
        }
    }

    expense.isDeleted = true;
    await expense.save();

    return res.status(200).json(new apiResponse(200, {}, "Expense deleted successfully"));
});

const settleUp = asyncHandler(async (req, res) => {
    const { groupId, toUser, amount, currency } = req.body;
    const fromUser = req.user._id;

    if (!groupId || !toUser || !amount || !currency) {
        throw new apiError(400, "Missing required fields");
    }

    // A settlement is just an expense where fromUser pays for toUser's share
    const expense = await Expense.create({
        description: "Settlement",
        totalAmount: amount,
        currency,
        category: 'Others',
        paidBy: fromUser,
        groupId,
        splitStrategy: 'EXACT',
        splits: [
            { user: toUser, amount }
        ]
    });

    // toUser owes fromUser amount
    await updateBalanceAtomic(groupId, toUser, fromUser, amount, currency);

    return res.status(200).json(new apiResponse(200, expense, "Settled up successfully"));
});

export {
    createExpense,
    deleteExpense,
    settleUp
};
