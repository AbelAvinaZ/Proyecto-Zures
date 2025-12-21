import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import setupAgenda from "./config/agenda.js";
import routes from "./routes/index.js";
import errorHandler from "./middlewares/errorHandler.js";
import logger from "./utils/logger.js";

dotenv.config();

const app = express();

// Middlewares globales
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 min
    max: 100,  // Límite por IP
});
app.use("/api/", limiter);

// Rutas
app.use("/api", routes);

// Manejo de errores (último)
app.use(errorHandler);

// Conectar DB y Agenda
if (process.env.NODE_ENV !== "test") {
    connectDB()
        .then(() => setupAgenda())
        .then(() => {
            const PORT = process.env.PORT || 5000;
            app.listen(PORT, () => {
                logger.info(`Server corriendo en puerto ${PORT}`);
            });
        })
        .catch((err) => {
            logger.error("Error al iniciar la aplicación", err);
            process.exit(1);
        });
}



export default app;