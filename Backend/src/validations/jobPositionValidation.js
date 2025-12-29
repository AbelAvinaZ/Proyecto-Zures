import Joi from "joi";

const createJobPositionSchema = Joi.object({
    name: Joi.string().min(3).max(100).required().messages({
        "any.required": "El nombre del puesto es obligatorio",
    }),
    code: Joi.string().alphanum().min(3).max(20).uppercase().required().messages({
        "any.required": "El código del puesto es obligatorio",
    }),
    baseSalary: Joi.number().min(0).required().messages({
        "any.required": "El salario base es obligatorio",
        "number.min": "El salario no puede ser negativo",
    }),
});

export default { createJobPositionSchema };