import Joi from "joi";

const createEmployeeSchema = Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
        "any.required": "El nombre es obligatorio",
        "string.min": "El nombre debe tener al menos 2 caracteres",
    }),
    lastName: Joi.string().min(2).max(50).required().messages({
        "any.required": "El apellido es obligatorio",
        "string.min": "El apellido debe tener al menos 2 caracteres",
    }),
    branchOfficeId: Joi.string().hex().length(24).required().messages({
        "any.required": "La sucursal es obligatoria",
        "string.length": "ID de sucursal inválido",
    }),
    jobPositionId: Joi.string().hex().length(24).optional().allow(null),
    hireDate: Joi.date().iso().required().messages({
        "any.required": "La fecha de contratación es obligatoria",
        "date.format": "Formato de fecha inválido (YYYY-MM-DD)",
    }),
    terminationDate: Joi.date().iso().optional().allow(null),
    phone: Joi.string().pattern(/^[\d\s\-\+\(\)]*$/).max(20).allow("").optional(),
    email: Joi.string().email().lowercase().allow("").optional(),
    emergencyContact: Joi.object({
        name: Joi.string().allow("").optional(),
        phone: Joi.string().allow("").optional(),
    }).optional(),
    maritalStatus: Joi.string().valid("SOLTERO", "CASADO", "DIVORCIADO", "VIUDO", "UNION_LIBRE", "OTRO").default("SOLTERO"),
    birthDate: Joi.date().iso().optional().allow(null),
    rfc: Joi.string().uppercase().max(13).allow("").optional(),
    curp: Joi.string().uppercase().max(18).allow("").optional(),
    socialSecurityNumber: Joi.string().allow("").optional(),
    hasSocialSecurity: Joi.boolean().default(false),
    fiscalSalary: Joi.number().min(0).optional(),
    positionSalary: Joi.number().min(0).optional(),
    employmentStatus: Joi.string().valid("ACTIVO", "INACTIVO").default("ACTIVO"),
    laborProcess: Joi.string().valid(
        "CONTRATO_PRUEBA", "CONTRATO_INDETERMINADO", "CONTRATO_EVENTUAL",
        "FINIQUITO", "CONCILIACION", "DEMANDA", "LIQUIDACION",
        "AUSENTE_INCOMUNICADO", "N/A"
    ).default("N/A"),
    observations: Joi.string().allow("").optional(),
});

const updateEmployeeSchema = createEmployeeSchema.fork(
    ["name", "lastName", "branchOfficeId", "hireDate"],
    (field) => field.optional()
).append({
    employmentStatus: Joi.string().valid("ACTIVO", "INACTIVO").optional(),
});

export default {
    createEmployeeSchema,
    updateEmployeeSchema,
};