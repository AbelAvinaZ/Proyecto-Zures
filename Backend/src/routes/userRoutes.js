import express from "express";
import userController from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { ROLES } from "../utils/constants.js";

const router = express.Router();

// Todos autenticados ven lista básica
router.get("/", authMiddleware.authenticate, userController.getAllUsers);

// Solo MASTER y AREA_DIRECTOR pueden cambiar roles
router.patch("/:userId/role",
    authMiddleware.authenticate,
    authMiddleware.restrictTo(ROLES.MASTER, ROLES.AREA_DIRECTOR),
    userController.updateUserRole
);

export default router;