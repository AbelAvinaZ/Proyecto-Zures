import JobPosition from "../models/JobPosition.js";
import logger from "../utils/logger.js";
import { ROLES } from "../utils/constants.js";
import Employee from "../models/Employee.js";

// Crear puesto (solo MASTER y AREA_DIRECTOR)
const createJobPosition = async (req, res) => {
    const { name, code, baseSalary } = req.body;
    const currentUser = req.user;

    try {
        if (currentUser.role !== ROLES.MASTER && currentUser.role !== ROLES.AREA_DIRECTOR) {
            return res.status(403).json({ success: false, message: "No tienes permiso para crear puestos" });
        }

        const existing = await JobPosition.findOne({ $or: [{ code }, { name }] });
        if (existing) {
            return res.status(400).json({ success: false, message: "El código o nombre del puesto ya existe" });
        }

        const jobPosition = new JobPosition({ name, code, baseSalary });
        await jobPosition.save();

        logger.info(`Puesto creado por ${currentUser.email}: ${name} (${code})`);

        res.status(201).json({
            success: true,
            message: "Puesto creado correctamente",
            data: { jobPosition },
        });
    } catch (error) {
        logger.error("Error al crear puesto", error);
        res.status(500).json({ success: false, message: "Error al crear puesto" });
    }
};

// Lista de puestos
const getAllJobPositions = async (req, res) => {
    try {
        const jobPositions = await JobPosition.find({ isActive: true })
            .select("name code baseSalary")
            .sort({ name: 1 });

        res.json({
            success: true,
            message: "Puestos obtenidos correctamente",
            data: { jobPositions },
        });
    } catch (error) {
        logger.error("Error al obtener puestos", error);
        res.status(500).json({ success: false, message: "Error al obtener puestos" });
    }
};

// Actualizar puesto
const updateJobPosition = async (req, res) => {
    const { id } = req.params;
    const { name, code, baseSalary } = req.body;
    const currentUser = req.user;

    try {
        if (currentUser.role !== ROLES.MASTER && currentUser.role !== ROLES.AREA_DIRECTOR) {
            return res.status(403).json({ success: false, message: "No tienes permiso para editar puestos" });
        }

        const jobPosition = await JobPosition.findById(id);
        if (!jobPosition) {
            return res.status(404).json({ success: false, message: "Puesto no encontrado" });
        }

        // Verificar duplicados si cambian name o code
        const existing = await JobPosition.findOne({
            $or: [{ name }, { code }],
            _id: { $ne: id },
        });
        if (existing) {
            return res.status(400).json({ success: false, message: "El nombre o código ya existe en otro puesto" });
        }

        jobPosition.name = name || jobPosition.name;
        jobPosition.code = code || jobPosition.code;
        jobPosition.baseSalary = baseSalary || jobPosition.baseSalary;

        await jobPosition.save();

        logger.info(`Puesto actualizado por ${currentUser.email}: ${jobPosition.name}`);

        res.json({
            success: true,
            message: "Puesto actualizado correctamente",
            data: { jobPosition },
        });
    } catch (error) {
        logger.error("Error al actualizar puesto", error);
        res.status(500).json({ success: false, message: "Error al actualizar puesto" });
    }
};

// Desactivar puesto (soft delete)
const deactivateJobPosition = async (req, res) => {
    const { id } = req.params;
    const currentUser = req.user;

    try {
        if (currentUser.role !== ROLES.MASTER && currentUser.role !== ROLES.AREA_DIRECTOR) {
            return res.status(403).json({ success: false, message: "No tienes permiso para desactivar puestos" });
        }

        const jobPosition = await JobPosition.findById(id);
        if (!jobPosition) {
            return res.status(404).json({ success: false, message: "Puesto no encontrado" });
        }

        jobPosition.isActive = false;
        await jobPosition.save();

        logger.info(`Puesto desactivado por ${currentUser.email}: ${jobPosition.name}`);

        res.json({
            success: true,
            message: "Puesto desactivado correctamente",
            data: { jobPosition },
        });
    } catch (error) {
        logger.error("Error al desactivar puesto", error);
        res.status(500).json({ success: false, message: "Error al desactivar puesto" });
    }
};

// Eliminar puesto permanentemente (solo MASTER)
const deleteJobPosition = async (req, res) => {
    const { id } = req.params;
    const currentUser = req.user;

    try {
        if (currentUser.role !== ROLES.MASTER) {
            return res.status(403).json({ success: false, message: "Solo el MASTER puede eliminar puestos permanentemente" });
        }

        const jobPosition = await JobPosition.findById(id);
        if (!jobPosition) {
            return res.status(404).json({ success: false, message: "Puesto no encontrado" });
        }

        // chequear si hay empleados asignados
        const employeesWithPosition = await Employee.countDocuments({ jobPositionId: id });
        if (employeesWithPosition > 0) {
            return res.status(400).json({ success: false, message: "No se puede eliminar un puesto asignado a empleados" });
        }

        await JobPosition.findByIdAndDelete(id);

        logger.info(`Puesto eliminado permanentemente por ${currentUser.email}: ${jobPosition.name}`);

        res.json({
            success: true,
            message: "Puesto eliminado permanentemente",
        });
    } catch (error) {
        logger.error("Error al eliminar puesto", error);
        res.status(500).json({ success: false, message: "Error al eliminar puesto" });
    }
};

export default {
    createJobPosition,
    getAllJobPositions,
    updateJobPosition,
    deactivateJobPosition,
    deleteJobPosition,
};