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
        createdBy: req.user._id,
        balances: []
    });

    return res.status(201).json(new apiResponse(201, group, "Group created successfully"));
});

const getGroupDashboard = asyncHandler(async (req, res) => {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
        .populate('members', 'fullName username avatar')
        .populate('balances.fromUser', 'fullName username avatar')
        .populate('balances.toUser', 'fullName username avatar')
        .populate('createdBy', 'fullName username');

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
        .populate('settlements.paidBy', 'fullName username avatar')
        .populate('settlements.paidTo', 'fullName username avatar')
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
        .populate('members', 'fullName username avatar')
        .populate('createdBy', 'fullName username');
    return res.status(200).json(new apiResponse(200, groups, "User groups fetched"));
});

const deleteGroup = asyncHandler(async (req, res) => {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
        throw new apiError(404, "Group not found");
    }

    // Only the creator can delete the group
    if (group.createdBy.toString() !== req.user._id.toString()) {
        throw new apiError(403, "Only the group creator can delete this group");
    }

    await Group.findByIdAndDelete(groupId);
    await Expense.deleteMany({ groupId });

    return res.status(200).json(new apiResponse(200, {}, "Group deleted successfully"));
});

const addMembersToGroup = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const { members } = req.body;

    if (!members || !Array.isArray(members) || members.length === 0) {
        throw new apiError(400, "Please provide an array of member IDs to add");
    }

    const group = await Group.findById(groupId);
    if (!group) {
        throw new apiError(404, "Group not found");
    }

    // Only the creator can add members? No, usually any member can add members.
    // Wait, let's allow any existing member to add new members
    if (!group.members.includes(req.user._id)) {
        throw new apiError(403, "You must be a member of this group to add others");
    }

    // Add unique members
    const newMembers = members.filter(id => !group.members.includes(id));
    if (newMembers.length > 0) {
        group.members.push(...newMembers);
        await group.save();
    }

    return res.status(200).json(new apiResponse(200, group, "Members added successfully"));
});

export {
    createGroup,
    getGroupDashboard,
    getGroupActivity,
    simplifyGroupDebts,
    getUserGroups,
    deleteGroup,
    addMembersToGroup
};
