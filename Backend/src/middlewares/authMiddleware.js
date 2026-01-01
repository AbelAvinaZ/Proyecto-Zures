import jwt from "jsonwebtoken";
import User from "../models/User.js";
import logger from "../utils/logger.js";
import { ROLES } from "../utils/constants.js";

// Middleware principal de autenticación
const authenticate = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No autenticado. Por favor inicia sesión.",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Usuario no encontrado.",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Cuenta desactivada.",
            });
        }

        // Bloqueo estricto para UNREGISTERED: no permite NINGUNA ruta protegida excepto perfil propio
        if (user.role === ROLES.UNREGISTERED) {
            const allowedUnregPaths = [
                "/me",                // Ver perfil propio
                "/me/update",         // Actualizar perfil (si lo usas)
                "/me/password",       // Cambiar contraseña
                "/me/avatar",         // Cambiar avatar
                // Agrega otras si las tienes, ej. "/me/avatar/upload"
            ];

            const isAllowed = allowedUnregPaths.some(path => req.path.startsWith(path));

            if (!isAllowed) {
                return res.status(403).json({
                    success: false,
                    message: "Tu cuenta está en estado no registrado. Solo puedes acceder a tu perfil personal.",
                });
            }
        }

        req.user = user;
        next();
    } catch (error) {
        logger.error("Error en autenticación JWT", error);
        return res.status(401).json({
            success: false,
            message: "Token inválido o expirado.",
        });
    }
};

// Middleware para reforzar que en rutas de perfil solo acceda a su propio recurso
const allowUnregisteredForProfile = (req, res, next) => {
    if (req.user.role === ROLES.UNREGISTERED) {
        // Solo permite si el ID coincide con el usuario logueado (o no hay ID)
        if (req.params.id && req.params.id !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Solo puedes acceder a tu propio perfil.",
            });
        }
    }
    next();
};

// restrictTo (excluye UNREGISTERED automáticamente)
const restrictTo = (...allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user.role;

        if (userRole === ROLES.UNREGISTERED) {
            return res.status(403).json({
                success: false,
                message: "Tu rol no permite esta acción.",
            });
        }

        if (userRole === ROLES.MASTER) {
            return next();
        }

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: "No tienes permiso para realizar esta acción.",
            });
        }

        next();
    };
};

export default {
    authenticate,
    allowUnregisteredForProfile,
    restrictTo,
};