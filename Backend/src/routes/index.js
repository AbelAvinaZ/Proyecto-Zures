import express from "express";

const router = express.Router();

// Ruta de prueba
router.get("/", (req, res) => {
    res.json({ message: "API raíz funcionando" });
});

export default router;