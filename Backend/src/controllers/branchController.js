import Branch from "../models/Branch.js";
import logger from "../utils/logger.js";

// Crear branch (solo MASTER)
const createBranch = async (req, res) => {
    const { name, code, city, state, country } = req.body;

    try {
        const existing = await Branch.findOne({ $or: [{ code }, { name }] });
        if (existing) {
            return res.status(400).json({ success: false, message: "El código o nombre ya existe" });
        }

        const branch = new Branch({ name, code, city, state, country });
        await branch.save();

        logger.info(`Branch creada por ${req.user.email}: ${name} (${code})`);

        res.status(201).json({
            success: true,
            message: "Branch creada correctamente",
            data: { branch },
        });
    } catch (error) {
        logger.error("Error al crear branch", error);
        res.status(500).json({ success: false, message: "Error al crear branch" });
    }
};

// Lista de branches (todos autenticados)
const getAllBranches = async (req, res) => {
    try {
        const branches = await Branch.find({ isActive: true })
            .select("name code city state country")
            .sort({ name: 1 });

        res.json({
            success: true,
            message: "Branches obtenidas correctamente",
            data: { branches },
        });
    } catch (error) {
        logger.error("Error al obtener branches", error);
        res.status(500).json({ success: false, message: "Error al obtener branches" });
    }
};

export default {
    createBranch,
    getAllBranches,
};