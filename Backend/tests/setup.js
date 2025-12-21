import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import logger from "../src/utils/logger.js";

let mongoServer;

beforeAll(async () => {
    // Cerrar conexión existente si hay (por si quedó abierta)
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri);
    logger.info("MongoDB en memoria conectado para tests");
});

afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
    }
    logger.info("MongoDB en memoria detenido");
});