import express from "express";
import { verifyAccessToken } from "../middlewares/jwtAuth.middleware.js";
import {getCallDetailsByCallId,
    getCallDetails,
    deleteCallDetailsById} from "../controllers/call.controller.js";

const router = express.Router();
router.use(verifyAccessToken);

router.route("/get-call-details/:senderId/:receiverId").get(getCallDetails);
router.route("/:callId").get(getCallDetailsByCallId).delete(deleteCallDetailsById);

export {
    router
}