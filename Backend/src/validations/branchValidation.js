import Joi from "joi";

const createBranchSchema = Joi.object({
    name: Joi.string().min(3).max(100).required().messages({
        "any.required": "El nombre es obligatorio",
        "string.min": "El nombre debe tener al menos 3 caracteres",
    }),
    code: Joi.string().max(10).uppercase().required().messages({
        "any.required": "El código es obligatorio",
    }),
    address: Joi.string().allow("").optional(),
    city: Joi.string().allow("").optional(),
    phone: Joi.string().allow("").optional(),
});

export default { createBranchSchema };