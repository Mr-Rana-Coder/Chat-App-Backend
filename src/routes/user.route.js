import express from "express";
import {
    verifyAccessToken,
    verifyRefreshToken
} from "../middlewares/joseAuth.middleware.js";
import {upload} from "../middlewares/multer.middleware.js";
import {
    registerUser,
    loginUser,
    getCurrentUser,
    logoutUser,
    updatePassword,
    refreshAccessToken,
    updateAccountDetails,
    updateAccountAvatar,
    deleteUser
} from "../controllers/user.controller.js";

const router = express.Router();

router.route("/registerUser").post(upload.single("avatar"), registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(verifyRefreshToken, refreshAccessToken);
router.route("/current-user").get(verifyAccessToken, getCurrentUser);
router.route("/logout").post(verifyAccessToken, logoutUser);

router.route("/update-password").patch(verifyAccessToken, updatePassword);

router.route("/update-account-details").patch(verifyAccessToken, updateAccountDetails);

router.route("/update-account-avatar").patch(verifyAccessToken, upload.single("avatar"), updateAccountAvatar);

router.route("/delete-user").delete(verifyAccessToken,deleteUser);

export {
    router
}