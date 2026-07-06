import { Group } from '../models/group.models.js';
import { Expense } from '../models/expense.models.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { simplifyDebts } from '../utils/graph.util.js';

const createGroup = asyncHandler(async (req, res) => {
    const { name, description, members } = req.body;

    if (!name) {
        throw new apiError(400, "Group name is required");
    }

    const memberIds = members || [];
    if (!memberIds.includes(req.user._id.toString())) {
        memberIds.push(req.user._id.toString());
    }

    const group = await Group.create({
        name,
        description,
        members: memberIds,
        balances: []
    });

    return res.status(201).json(new apiResponse(201, group, "Group created successfully"));
});

const getGroupDashboard = asyncHandler(async (req, res) => {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
        .populate('members', 'fullName username avatar')
        .populate('balances.fromUser', 'fullName username avatar')
        .populate('balances.toUser', 'fullName username avatar');

    if (!group) {
        throw new apiError(404, "Group not found");
    }

    return res.status(200).json(new apiResponse(200, group, "Group dashboard fetched"));
});

const getGroupActivity = asyncHandler(async (req, res) => {
    const { groupId } = req.params;

    const expenses = await Expense.find({ groupId, isDeleted: false })
        .populate('paidBy', 'fullName username avatar')
        .populate('splits.user', 'fullName username avatar')
        .sort({ createdAt: -1 });

    return res.status(200).json(new apiResponse(200, expenses, "Group activity fetched"));
});

const simplifyGroupDebts = asyncHandler(async (req, res) => {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
        throw new apiError(404, "Group not found");
    }

    // Group balances by currency
    const balancesByCurrency = {};
    group.balances.forEach(b => {
        if (!balancesByCurrency[b.currency]) {
            balancesByCurrency[b.currency] = [];
        }
        balancesByCurrency[b.currency].push(b);
    });

    const newBalances = [];

    // Simplify for each currency
    for (const [currency, balances] of Object.entries(balancesByCurrency)) {
        const simplified = simplifyDebts(balances);
        simplified.forEach(s => {
            newBalances.push({
                fromUser: s.fromUser,
                toUser: s.toUser,
                amount: s.amount,
                currency
            });
        });
    }

    group.balances = newBalances;
    await group.save();

    return res.status(200).json(new apiResponse(200, group, "Group debts simplified"));
});

const getUserGroups = asyncHandler(async (req, res) => {
    const groups = await Group.find({ members: req.user._id })
        .populate('members', 'fullName username avatar');
    return res.status(200).json(new apiResponse(200, groups, "User groups fetched"));
});

const deleteGroup = asyncHandler(async (req, res) => {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
        throw new apiError(404, "Group not found");
    }

    // Optional: Check if user is part of the group or is an admin before deleting
    if (!group.members.includes(req.user._id.toString())) {
        throw new apiError(403, "You do not have permission to delete this group");
    }

    await Group.findByIdAndDelete(groupId);
    // Optional: Delete associated expenses
    await Expense.deleteMany({ groupId });

    return res.status(200).json(new apiResponse(200, {}, "Group deleted successfully"));
});

export {
    createGroup,
    getGroupDashboard,
    getGroupActivity,
    simplifyGroupDebts,
    getUserGroups,
    deleteGroup
};
