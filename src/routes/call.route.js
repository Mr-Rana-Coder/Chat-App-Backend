import express from "express";
import { verifyAccessToken } from "../middlewares/joseAuth.middleware.js";
import {getCallDetailsByCallId,
    getCallDetails,
    deleteCallDetailsById} from "../controllers/call.controller.js";

const router = express.Router();
router.use(verifyAccessToken);

router.route("/get-call-details/:senderId/:recieverId").get(getCallDetails);
router.route("/:callId").get(getCallDetailsByCallId).delete(deleteCallDetailsById);

export {
    router
}