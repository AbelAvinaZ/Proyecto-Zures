import express from "express";
import workspaceController from "../controllers/workspaceController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import workspaceValidation from "../validations/workspaceValidation.js";
import { ROLES } from "../utils/constants.js";
import validate from "../middlewares/validateMiddleware.js";

const router = express.Router();

// Todos autenticados (excepto UNREGISTERED, controlado en controller)
router.get("/", authMiddleware.authenticate, workspaceController.getAllWorkspaces);
router.get("/:id", authMiddleware.authenticate, workspaceController.getWorkspaceById);

router.post("/",
    authMiddleware.authenticate,
    validate(workspaceValidation.createWorkspaceSchema),
    workspaceController.createWorkspace
);

router.patch("/:id",
    authMiddleware.authenticate,
    validate(workspaceValidation.updateWorkspaceSchema),
    workspaceController.updateWorkspace
);
router.patch("/:id/deactivate", authMiddleware.authenticate, workspaceController.deactivateWorkspace);

router.post("/:id/invite",
    authMiddleware.authenticate,
    validate(workspaceValidation.inviteUserSchema),
    workspaceController.inviteUserToWorkspace
);
export default router;