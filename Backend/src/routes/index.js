import express from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";

const router = express.Router();

router.get("/", (req, res) => {
    res.json({ message: "API raíz funcionando" });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);

export default router;