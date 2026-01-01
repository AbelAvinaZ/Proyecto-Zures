import Joi from "joi";

const createWorkspaceSchema = Joi.object({
    name: Joi.string().min(3).max(100).required().messages({
        "any.required": "El nombre del workspace es obligatorio",
        "string.min": "El nombre debe tener al menos 3 caracteres",
        "string.max": "El nombre no puede exceder 100 caracteres",
    }),
    description: Joi.string().allow("").max(500).optional(),
    isPrivate: Joi.boolean().default(false),
});

const updateWorkspaceSchema = Joi.object({
    name: Joi.string().min(3).max(100).optional(),
    description: Joi.string().allow("").max(500).optional(),
    isPrivate: Joi.boolean().optional(),
});

const inviteUserSchema = Joi.object({
    userId: Joi.string().hex().length(24).required().messages({
        "any.required": "El ID del usuario a invitar es obligatorio",
        "string.length": "ID de usuario inválido",
    }),
});

export default {
    createWorkspaceSchema,
    updateWorkspaceSchema,
    inviteUserSchema,
};