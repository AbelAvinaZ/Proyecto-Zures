import Joi from "joi";

const createBranchOfficeSchema = Joi.object({
    name: Joi.string().min(3).max(100).required().messages({
        "any.required": "El nombre de la sucursal es obligatorio",
        "string.min": "El nombre debe tener al menos 3 caracteres",
        "string.max": "El nombre no puede exceder 100 caracteres",
    }),
    code: Joi.string()
        .pattern(/^[A-Z0-9\-]+$/) // Acepta letras, números y guiones
        .min(3)
        .max(15)
        .uppercase()
        .required()
        .messages({
            "any.required": "El código de sucursal es obligatorio",
            "string.pattern.base": "El código solo puede contener letras, números y guiones",
            "string.min": "El código debe tener al menos 3 caracteres",
            "string.max": "El código no puede tener más de 15 caracteres",
        }),
    branchId: Joi.string().hex().length(24).required().messages({
        "any.required": "La branch padre es obligatoria",
        "string.length": "ID de branch inválido",
    }),
    address: Joi.string().allow("").max(200).optional(),
    phone: Joi.string()
        .pattern(/^[\d\s\-\+\(\)]*$/)
        .max(20)
        .allow("")
        .optional()
        .messages({
            "string.pattern.base": "Formato de teléfono inválido",
        }),
    managerId: Joi.string().hex().length(24).optional().allow(null, ""),
});

export default { createBranchOfficeSchema };