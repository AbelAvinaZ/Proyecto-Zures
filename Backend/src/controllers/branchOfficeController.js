import BranchOffice from "../models/BranchOffice.js";
import Branch from "../models/Branch.js";
import logger from "../utils/logger.js";
import { ROLES } from "../utils/constants.js";

// Crear sucursal específica (solo MASTER o AREA_DIRECTOR)
const createBranchOffice = async (req, res) => {
    const { name, code, branchId, address, phone, managerId } = req.body;
    const currentUser = req.user;

    try {
        // Verificar que la branch padre exista
        const branch = await Branch.findById(branchId);
        if (!branch) {
            return res.status(404).json({
                success: false,
                message: "Branch no encontrada"
            });
        }

        // Solo MASTER o AREA_DIRECTOR pueden crear
        if (currentUser.role !== ROLES.MASTER && currentUser.role !== ROLES.AREA_DIRECTOR) {
            return res.status(403).json({
                success: false,
                message: "No tienes permiso para crear sucursales"
            });
        }

        // Verificar si ya existe por código O por nombre (en la misma branch)
        const existing = await BranchOffice.findOne({
            $or: [
                { code },
                { name, branchId } // Mismo nombre en la misma branch
            ]
        });

        if (existing) {
            const field = existing.code === code ? "código" : "nombre";
            return res.status(400).json({
                success: false,
                message: `El ${field} ya existe en esta branch`
            });
        }

        const branchOffice = new BranchOffice({
            name,
            code,
            branchId,
            address: address || undefined,
            phone: phone || undefined,
            managerId: managerId || undefined,
        });

        await branchOffice.save();

        logger.info(`Sucursal específica creada por ${currentUser.email}: ${name} (${code}) en branch ${branch.name}`);

        res.status(201).json({
            success: true,
            message: "Sucursal creada correctamente",
            data: { branchOffice },
        });
    } catch (error) {
        logger.error("Error al crear sucursal específica", error);

        // Manejar errores de MongoDB (duplicados, etc.)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "El código o nombre de sucursal ya existe"
            });
        }

        res.status(500).json({
            success: false,
            message: "Error al crear sucursal"
        });
    }
};

// Lista de sucursales específicas (filtrada por branch si es AREA_DIRECTOR)
const getAllBranchOffices = async (req, res) => {
    const currentUser = req.user;

    try {
        let query = { isActive: true };

        // AREA_DIRECTOR solo ve las de su branch
        if (currentUser.role === ROLES.AREA_DIRECTOR && currentUser.branchId) {
            query.branchId = currentUser.branchId;
        }

        const branchOffices = await BranchOffice.find(query)
            .populate("branchId", "name code")
            .select("name code address phone managerId branchId")
            .sort({ name: 1 });

        res.json({
            success: true,
            message: "Sucursales obtenidas correctamente",
            data: { branchOffices },
        });
    } catch (error) {
        logger.error("Error al obtener sucursales específicas", error);
        res.status(500).json({ success: false, message: "Error al obtener sucursales" });
    }
};

export default {
    createBranchOffice,
    getAllBranchOffices,
};