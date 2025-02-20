import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Group } from "../models/group.model.js";
import mongoose from "mongoose";

const createGroup = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "User not verified")
    }
    const { groupName } = req.body;
    if (!groupName) {
        throw new ApiError(400, "Group name is required")
    }
    const group = await Group.create({
        groupName: groupName,
        admin: userId,
        members: [userId]
    })
    if (!group) {
        throw new ApiError(500, "Group not created.")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, group, "Group created successfully"))
})

const addMemberToGroup = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "User not verified")
    }
    const { memberId } = req.params;
    if (!memberId) {
        throw new ApiError(400, "Member id is required")
    }
    if (!mongoose.isValidObjectId(memberId)) {
        throw new ApiError(400, "Member id is invalid")
    }

    const group = await Group.findOne({
        admin: userId
    })
    if (!group) {
        throw new ApiError(404, "Group doesn't exist")
    }

    group.members.push(memberId);
    await group.save();

    return res
        .status(200)
        .json(new ApiResponse(200, group, "Member added to the group successfully"))
})

const getGroupById = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    if (!groupId) {
        throw new ApiError(400, "Group id is required")
    }
    if (!mongoose.isValidObjectId(groupId)) {
        throw new ApiError(400, "Group id is invalid")
    }

    const group = await Group.findById(groupId);
    if (!group) {
        throw new ApiError(404, "Group with the given id doesn't exists")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, group, "Group fetched successfully"))
})

const removeMemberFromGroup = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "User not verified")
    }
    const { memberId } = req.params;
    if (!memberId) {
        throw new ApiError(400, "Member id is required")
    }
    if (!mongoose.isValidObjectId(memberId)) {
        throw new ApiError(400, "Member id is invalid")
    }

    const group = await Group.findOne({
        admin: userId
    })
    if (!group) {
        throw new ApiError(404, "Group doesn't exist")
    }

    group.members.pull(memberId);
    await group.save();

    return res
        .status(200)
        .json(new ApiResponse(200, group, "Member removed from group successfully"))
})

const deleteGroup = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "User not verified")
    }

    const group = await Group.findOne({
        admin: userId
    })

    if (!group) {
        throw new ApiError(404, "Group doesn't exist")
    }

    await group.deleteOne();

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Group deleted successfully"))
})

export {
    createGroup,
    addMemberToGroup,
    getGroupById,
    removeMemberFromGroup,
    deleteGroup
}