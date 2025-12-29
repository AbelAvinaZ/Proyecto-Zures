import express from "express";
import jobPositionController from "../controllers/jobPositionController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { ROLES } from "../utils/constants.js";

const router = express.Router();

router.get("/", authMiddleware.authenticate, jobPositionController.getAllJobPositions);

router.post("/",
    authMiddleware.authenticate,
    authMiddleware.restrictTo(ROLES.MASTER, ROLES.AREA_DIRECTOR),
    jobPositionController.createJobPosition
);

router.patch("/:id",
    authMiddleware.authenticate,
    authMiddleware.restrictTo(ROLES.MASTER, ROLES.AREA_DIRECTOR),
    jobPositionController.updateJobPosition
);

router.patch("/:id/deactivate",
    authMiddleware.authenticate,
    authMiddleware.restrictTo(ROLES.MASTER, ROLES.AREA_DIRECTOR),
    jobPositionController.deactivateJobPosition
);

router.delete("/:id",
    authMiddleware.authenticate,
    authMiddleware.restrictTo(ROLES.MASTER),
    jobPositionController.deleteJobPosition
);

export default router;