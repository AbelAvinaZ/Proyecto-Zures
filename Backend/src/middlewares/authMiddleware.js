import jwt from "jsonwebtoken";
import User from "../models/User.js";
import logger from "../utils/logger.js";
import { ROLES } from "../utils/constants.js";

// Middleware para verificar JWT y cargar usuario
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

// Middleware para restringir por roles (MASTER siempre tiene acceso)
const restrictTo = (...allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user.role;

        // MASTER tiene acceso total siempre
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
    restrictTo,
};