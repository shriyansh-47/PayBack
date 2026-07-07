import { Expense } from '../models/expense.models.js';
import { Group } from '../models/group.models.js';
import { Notification } from '../models/notification.models.js';
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

    // Authorization: Only the user who paid can delete the expense
    if (expense.paidBy.toString() !== req.user._id.toString()) {
        throw new apiError(403, "Only the creator can delete this expense");
    }

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

/**
 * Settle some or all of a user's share on a specific expense.
 * Instead of creating a new expense, we directly reduce the split amount
 * on the original expense and update group balances.
 */
const settleUp = asyncHandler(async (req, res) => {
    const { expenseId, amount } = req.body;
    const payerId = req.user._id;

    if (!expenseId || !amount || Number(amount) <= 0) {
        throw new apiError(400, "expenseId and a positive amount are required");
    }

    const settledAmount = Number(amount);

    // Load the expense with populated payer info for notifications
    const expense = await Expense.findById(expenseId).populate('paidBy', 'username fullName');
    if (!expense) throw new apiError(404, "Expense not found");
    if (expense.isDeleted) throw new apiError(400, "Expense is deleted");

    // Find the caller's split in this expense
    const splitIndex = expense.splits.findIndex(s => s.user.toString() === payerId.toString());
    if (splitIndex === -1) {
        throw new apiError(400, "You have no split in this expense");
    }

    // The person who paid the bill is the receiver of the settlement
    const receiverId = expense.paidBy._id;

    if (payerId.toString() === receiverId.toString()) {
        throw new apiError(400, "You cannot settle with yourself");
    }

    const currentOwed = expense.splits[splitIndex].amount;
    if (settledAmount > currentOwed + 0.01) {
        throw new apiError(400, `You only owe ₹${currentOwed.toFixed(2)}, cannot settle more`);
    }

    const newOwed = Math.max(0, currentOwed - settledAmount);

    // Atomically update the split amount AND push the activity log entry
    await Expense.updateOne(
        { _id: expenseId, "splits.user": payerId },
        {
            $set: { "splits.$.amount": newOwed },
            $push: {
                settlements: {
                    paidBy: payerId,
                    paidTo: receiverId,
                    amount: settledAmount,
                    createdAt: new Date()
                }
            }
        }
    );

    // Update group balance atomically (reduce what payer owes receiver)
    await updateBalanceAtomic(expense.groupId, payerId, receiverId, -settledAmount, expense.currency);

    // Send notifications to both parties
    const payerName = req.user.username || req.user.fullName || 'Someone';
    const receiverName = expense.paidBy.username || expense.paidBy.fullName || 'Someone';
    const currency = expense.currency || 'INR';

    await Notification.create([
        {
            userId: receiverId,
            message: `${payerName} paid you ${currency} ${settledAmount.toFixed(2)} towards "${expense.description}".`
        },
        {
            userId: payerId,
            message: `You paid ${receiverName} ${currency} ${settledAmount.toFixed(2)} towards "${expense.description}". ${newOwed > 0 ? `Remaining: ${currency} ${newOwed.toFixed(2)}.` : 'Fully settled!'}`
        }
    ]);

    return res.status(200).json(new apiResponse(200, {
        settledAmount,
        remainingOwed: newOwed,
        fullySettled: newOwed === 0
    }, "Settled successfully"));
});

const getUserExpenses = asyncHandler(async (req, res) => {
    const expenses = await Expense.find({
        isDeleted: false,
        hiddenFrom: { $ne: req.user._id },   // exclude expenses user has cleared
        $or: [
            { paidBy: req.user._id },
            { 'splits.user': req.user._id }
        ]
    })
    .populate('paidBy', 'username fullName')
    .populate('splits.user', 'username fullName')
    .populate('settlements.paidBy', 'username fullName')
    .populate('settlements.paidTo', 'username fullName')
    .sort({ createdAt: -1 });

    return res.status(200).json(new apiResponse(200, expenses, "User expenses fetched successfully"));
});

// Non-payer clear: add user to hiddenFrom (does NOT delete the record)
const hideExpense = asyncHandler(async (req, res) => {
    const { expenseId } = req.params;
    const userId = req.user._id;

    const expense = await Expense.findById(expenseId);
    if (!expense) throw new apiError(404, 'Expense not found');
    if (expense.isDeleted) throw new apiError(400, 'Expense already deleted');

    // Make sure the user is actually in the splits (they have a stake)
    const hasSplit = expense.splits.some(s => s.user.toString() === userId.toString());
    const isPayer = expense.paidBy.toString() === userId.toString();
    if (!hasSplit && !isPayer) throw new apiError(403, 'You are not part of this expense');

    // Idempotent push
    await Expense.updateOne(
        { _id: expenseId },
        { $addToSet: { hiddenFrom: userId } }
    );

    return res.status(200).json(new apiResponse(200, {}, 'Expense hidden from your view'));
});

export {
    createExpense,
    deleteExpense,
    settleUp,
    getUserExpenses,
    hideExpense
};
