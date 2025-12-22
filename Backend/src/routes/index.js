import express from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import branchRoutes from "./branchRoutes.js";
import branchOfficeRoutes from "./branchOfficeRoutes.js";

const router = express.Router();

router.get("/", (req, res) => {
    res.json({ message: "API raíz funcionando" });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/branches", branchRoutes);
router.use("/branch-offices", branchOfficeRoutes);

export default router;