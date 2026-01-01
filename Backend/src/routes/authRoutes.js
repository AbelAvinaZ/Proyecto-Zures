import express from "express";
import authController from "../controllers/authController.js";
import validate from "../middlewares/validateMiddleware.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import authValidation from "../validations/authValidation.js";

const router = express.Router();

router.post("/register", validate(authValidation.registerSchema), authController.register);
router.get("/verify-email", authController.verifyEmail);
router.post("/login", validate(authValidation.loginSchema), authController.login);
router.post("/logout", authController.logout);
router.post("/forgot-password", validate(authValidation.forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password/:token", validate(authValidation.resetPasswordSchema), authController.resetPassword);

export default router;