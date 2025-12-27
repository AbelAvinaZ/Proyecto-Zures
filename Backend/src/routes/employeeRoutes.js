import express from "express";
import employeeController from "../controllers/employeeController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { ROLES } from "../utils/constants.js";
import employeeValidation from "../validations/employeeValidation.js";
import validate from "../middlewares/validateMiddleware.js";

const router = express.Router();

// Todos autenticados pueden ver lista básica
router.get("/", authMiddleware.authenticate, employeeController.getAllEmployees);

// Solo autorizados pueden crear/editar/desactivar
const authorizedRoles = [ROLES.MASTER, ROLES.AREA_DIRECTOR, ROLES.OPERATIONS, ROLES.HR, ROLES.ADMINISTRATION];

router.post("/", authMiddleware.authenticate, authMiddleware.restrictTo(...authorizedRoles), validate(employeeValidation.createEmployeeSchema), employeeController.createEmployee);
router.get("/:id", authMiddleware.authenticate, employeeController.getEmployeeById);
router.patch("/:id", authMiddleware.authenticate, authMiddleware.restrictTo(...authorizedRoles), validate(employeeValidation.updateEmployeeSchema), employeeController.updateEmployee);
router.patch("/:id/deactivate", authMiddleware.authenticate, authMiddleware.restrictTo(...authorizedRoles), employeeController.deactivateEmployee);

export default router;