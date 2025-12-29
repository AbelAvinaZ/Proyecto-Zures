import express from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import branchRoutes from "./branchRoutes.js";
import branchOfficeRoutes from "./branchOfficeRoutes.js";
import employeeRoutes from "./employeeRoutes.js";
import jobPositionRoutes from "./jobPositionRoutes.js";

const router = express.Router();

router.get("/", (req, res) => {
    res.json({ message: "API raíz funcionando" });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/branches", branchRoutes);
router.use("/branch-offices", branchOfficeRoutes);
router.use("/employees", employeeRoutes);
router.use("/job-positions", jobPositionRoutes);

export default router;