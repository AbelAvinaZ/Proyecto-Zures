import logger from "../utils/logger.js";

export default (err, req, res, next) => {
    logger.error(`Error en ${req.method} ${req.originalUrl}: ${err.message}`, { stack: err.stack });

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: statusCode === 500 ? "Error interno del servidor" : err.message,
    });
};