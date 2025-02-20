import express from "express";
import {
    verifyAccessToken
} from "../middlewares/joseAuth.middleware.js";
import {
    createGroup,
    addMemberToGroup,
    getGroupById,
    removeMemberFromGroup,
    deleteGroup
} from "../controllers/group.controller.js";


const router = express.Router();
router.use(verifyAccessToken);
router.route("/create-group").post(createGroup);
router.route("/add-member/:memberId").patch(addMemberToGroup);
router.route("/:groupId").get(getGroupById).delete(deleteGroup);
router.route("/remove-member/:memberId").patch(removeMemberFromGroup);

export {
    router
}