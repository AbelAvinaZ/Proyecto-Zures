import express from "express";
import branchOfficeController from "../controllers/branchOfficeController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validateMiddleware.js";
import { ROLES } from "../utils/constants.js";
import branchOfficeValidation from "../validations/branchOfficeValidation.js";

const router = express.Router();

router.get("/", authMiddleware.authenticate, branchOfficeController.getAllBranchOffices);

router.post("/",
    authMiddleware.authenticate,
    authMiddleware.restrictTo(ROLES.MASTER, ROLES.AREA_DIRECTOR),
    validate(branchOfficeValidation.createBranchOfficeSchema),
    branchOfficeController.createBranchOffice
);

export default router;