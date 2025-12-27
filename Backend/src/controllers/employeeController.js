import Employee from "../models/Employee.js";
import BranchOffice from "../models/BranchOffice.js";
import logger from "../utils/logger.js";
import { ROLES } from "../utils/constants.js";

// Crear empleado
const createEmployee = async (req, res) => {
    const data = req.body;
    const currentUser = req.user;

    try {
        // Permisos
        if (![ROLES.MASTER, ROLES.AREA_DIRECTOR, ROLES.OPERATIONS, ROLES.HR, ROLES.ADMINISTRATION].includes(currentUser.role)) {
            return res.status(403).json({ success: false, message: "No tienes permiso para crear empleados" });
        }

        // Validar branchOffice exista
        const branchOffice = await BranchOffice.findById(data.branchOfficeId);
        if (!branchOffice) {
            return res.status(404).json({ success: false, message: "Sucursal no encontrada" });
        }

        // Department solo crea en su branch
        if ([ROLES.OPERATIONS, ROLES.HR, ROLES.ADMINISTRATION].includes(currentUser.role)) {
            if (!currentUser.branchId) {
                return res.status(403).json({ success: false, message: "No tienes una branch asignada" });
            }
            if (branchOffice.branchId.toString() !== currentUser.branchId.toString()) {
                return res.status(403).json({ success: false, message: "Solo puedes crear empleados en tu branch" });
            }
        }

        const employee = new Employee(data);
        await employee.save();

        logger.info(`Empleado creado por ${currentUser.email}: ${employee.fullName} (${employee.employeeCode})`);

        res.status(201).json({
            success: true,
            message: "Empleado creado correctamente",
            data: { employee },
        });
    } catch (error) {
        logger.error("Error al crear empleado", error);
        res.status(500).json({ success: false, message: "Error al crear empleado" });
    }
};

// Lista de empleados
const getAllEmployees = async (req, res) => {
    const currentUser = req.user;

    try {
        let query = {};

        // Department solo ve empleados de su branch
        if ([ROLES.OPERATIONS, ROLES.HR, ROLES.ADMINISTRATION].includes(currentUser.role)) {
            if (!currentUser.branchId) {
                return res.status(403).json({ success: false, message: "No tienes una branch asignada" });
            }
            const officesInBranch = await BranchOffice.find({ branchId: currentUser.branchId }).select("_id");
            const officeIds = officesInBranch.map(o => o._id);
            if (officeIds.length === 0) {
                return res.json({ success: true, message: "Empleados obtenidos correctamente", data: { employees: [] } });
            }
            query.branchOfficeId = { $in: officeIds };
        }

        const employees = await Employee.find(query)
            .populate("branchOfficeId", "name code")
            .populate("jobPositionId", "name")
            .select(currentUser.role === ROLES.MASTER || currentUser.role === ROLES.AREA_DIRECTOR
                ? "-__v"
                : "name lastName employeeCode branchOfficeId employmentStatus avatar fullName"
            )
            .sort({ lastName: 1, name: 1 })
            .lean();

        const employeesWithFullName = employees.map(emp => ({
            ...emp,
            fullName: emp.fullName || `${emp.name || ""} ${emp.lastName || ""}`.trim(),
        }));

        res.json({
            success: true,
            message: "Empleados obtenidos correctamente",
            data: { employees: employeesWithFullName },
        });
    } catch (error) {
        logger.error("Error al obtener empleados", error);
        res.status(500).json({ success: false, message: "Error al obtener empleados" });
    }
};

// Obtener uno específico
const getEmployeeById = async (req, res) => {
    const { id } = req.params;
    const currentUser = req.user;

    try {
        const employee = await Employee.findById(id)
            .populate("branchOfficeId", "name code")
            .populate("jobPositionId", "name");

        if (!employee) {
            return res.status(404).json({ success: false, message: "Empleado no encontrado" });
        }

        // Department solo ve de su branch
        if ([ROLES.OPERATIONS, ROLES.HR, ROLES.ADMINISTRATION].includes(currentUser.role)) {
            if (!currentUser.branchId) {
                return res.status(403).json({ success: false, message: "No tienes una branch asignada" });
            }
            const office = await BranchOffice.findById(employee.branchOfficeId);
            if (!office || office.branchId.toString() !== currentUser.branchId.toString()) {
                return res.status(403).json({ success: false, message: "No tienes permiso para ver este empleado" });
            }
        }

        res.json({
            success: true,
            message: "Empleado obtenido correctamente",
            data: { employee },
        });
    } catch (error) {
        logger.error("Error al obtener empleado", error);
        res.status(500).json({ success: false, message: "Error al obtener empleado" });
    }
};

// Actualizar empleado
const updateEmployee = async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const currentUser = req.user;

    try {
        const employee = await Employee.findById(id);
        if (!employee) {
            return res.status(404).json({ success: false, message: "Empleado no encontrado" });
        }

        // Permisos
        if (![ROLES.MASTER, ROLES.AREA_DIRECTOR, ROLES.OPERATIONS, ROLES.HR, ROLES.ADMINISTRATION].includes(currentUser.role)) {
            return res.status(403).json({ success: false, message: "No tienes permiso para editar empleados" });
        }

        // Department solo edita en su branch
        if ([ROLES.OPERATIONS, ROLES.HR, ROLES.ADMINISTRATION].includes(currentUser.role)) {
            if (!currentUser.branchId) {
                return res.status(403).json({ success: false, message: "No tienes una branch asignada" });
            }
            const office = await BranchOffice.findById(employee.branchOfficeId);
            if (!office) {
                return res.status(500).json({ success: false, message: "Error interno: sucursal del empleado no encontrada" });
            }
            if (office.branchId.toString() !== currentUser.branchId.toString()) {
                return res.status(403).json({ success: false, message: "Solo puedes editar empleados de tu branch" });
            }
        }

        Object.assign(employee, data);
        await employee.save();

        logger.info(`Empleado actualizado por ${currentUser.email}: ${employee.fullName}`);

        res.json({
            success: true,
            message: "Empleado actualizado correctamente",
            data: { employee },
        });
    } catch (error) {
        logger.error("Error al actualizar empleado", error);
        res.status(500).json({ success: false, message: "Error al actualizar empleado" });
    }
};

// Desactivar empleado
const deactivateEmployee = async (req, res) => {
    const { id } = req.params;
    const currentUser = req.user;

    try {
        const employee = await Employee.findById(id);
        if (!employee) {
            return res.status(404).json({ success: false, message: "Empleado no encontrado" });
        }

        // Permisos
        if (![ROLES.MASTER, ROLES.AREA_DIRECTOR, ROLES.OPERATIONS, ROLES.HR, ROLES.ADMINISTRATION].includes(currentUser.role)) {
            return res.status(403).json({ success: false, message: "No tienes permiso para desactivar empleados" });
        }

        // Department solo desactiva en su branch
        if ([ROLES.OPERATIONS, ROLES.HR, ROLES.ADMINISTRATION].includes(currentUser.role)) {
            if (!currentUser.branchId) {
                return res.status(403).json({ success: false, message: "No tienes una branch asignada" });
            }
            const office = await BranchOffice.findById(employee.branchOfficeId);
            if (!office) {
                return res.status(500).json({ success: false, message: "Error interno: sucursal del empleado no encontrada" });
            }
            if (office.branchId.toString() !== currentUser.branchId.toString()) {
                return res.status(403).json({ success: false, message: "Solo puedes desactivar empleados de tu branch" });
            }
        }

        employee.employmentStatus = "INACTIVO";
        employee.terminationDate = new Date();
        await employee.save();

        logger.info(`Empleado desactivado por ${currentUser.email}: ${employee.fullName}`);

        res.json({
            success: true,
            message: "Empleado desactivado correctamente",
            data: { employee },
        });
    } catch (error) {
        logger.error("Error al desactivar empleado", error);
        res.status(500).json({ success: false, message: "Error al desactivar empleado" });
    }
};

export default {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deactivateEmployee,
};