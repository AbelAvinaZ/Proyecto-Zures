import mongoose from "mongoose";
import logger from "../utils/logger.js";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);

        logger.info(`MongoDB conectado: ${conn.connection.host}:${conn.connection.port}`);

        // Eventos de monitoreo
        mongoose.connection.on("disconnected", () => {
            logger.warn("MongoDB desconectado");
        });

        mongoose.connection.on("error", (err) => {
            logger.error(`Error en conexión MongoDB: ${err.message}`);
        });
    } catch (error) {
        logger.error(`Error al conectar a MongoDB: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;