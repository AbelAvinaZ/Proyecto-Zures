import Joi from "joi";

const registerSchema = Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
        "string.min": "El nombre debe tener al menos 2 caracteres",
        "string.max": "El nombre no puede tener más de 50 caracteres",
        "any.required": "El nombre es obligatorio",
    }),
    email: Joi.string().email().required().messages({
        "string.email": "Debe ser un correo válido",
        "any.required": "El correo es obligatorio",
    }),
    password: Joi.string().min(6).required().messages({
        "string.min": "La contraseña debe tener al menos 6 caracteres",
        "any.required": "La contraseña es obligatoria",
    }),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        "string.email": "Debe ser un correo válido",
        "any.required": "El correo es obligatorio",
    }),
    password: Joi.string().required().messages({
        "any.required": "La contraseña es obligatoria",
    }),
    rememberMe: Joi.boolean().optional(),
});

const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required().messages({
        "string.email": "Debe ser un correo válido",
        "any.required": "El correo es obligatorio",
    }),
});

const resetPasswordSchema = Joi.object({
    password: Joi.string().min(6).required().messages({
        "string.min": "La contraseña debe tener al menos 6 caracteres",
        "any.required": "La contraseña es obligatoria",
    }),
});

export default {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
};