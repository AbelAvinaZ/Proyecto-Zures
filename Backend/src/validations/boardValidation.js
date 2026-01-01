import Joi from "joi";

const createBoardSchema = Joi.object({
    name: Joi.string().min(3).max(100).required().messages({
        "any.required": "El nombre del board es obligatorio",
        "string.min": "El nombre debe tener al menos 3 caracteres",
    }),
    description: Joi.string().allow("").max(500).optional(),
    workspaceId: Joi.string().hex().length(24).required().messages({
        "any.required": "El workspace es obligatorio",
        "string.length": "ID de workspace inválido",
    }),
    isPrivate: Joi.boolean().default(false),
});

const updateBoardSchema = Joi.object({
    name: Joi.string().min(3).max(100).optional(),
    description: Joi.string().allow("").max(500).optional(),
    isPrivate: Joi.boolean().optional(),
});

const inviteUserToBoardSchema = Joi.object({
    userId: Joi.string().hex().length(24).required().messages({
        "any.required": "El ID del usuario a invitar es obligatorio",
    }),
});

export default {
    createBoardSchema,
    updateBoardSchema,
    inviteUserToBoardSchema,
};