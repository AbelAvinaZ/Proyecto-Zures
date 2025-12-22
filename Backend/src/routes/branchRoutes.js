import express from "express";
import branchController from "../controllers/branchController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { ROLES } from "../utils/constants.js";
import validate from "../middlewares/validateMiddleware.js";
import branchValidation from "../validations/branchValidation.js";

const router = express.Router();

// Todos autenticados pueden ver la lista
router.get("/", authMiddleware.authenticate, branchController.getAllBranches);

// Solo MASTER puede crear
router.post("/",
    authMiddleware.authenticate,
    authMiddleware.restrictTo(ROLES.MASTER),
    validate(branchValidation.createBranchSchema),
    branchController.createBranch
);

export default router;