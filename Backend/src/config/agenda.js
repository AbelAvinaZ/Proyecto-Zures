import Agenda from "agenda";
import mongoose from "mongoose";
import logger from "../utils/logger.js";

let agenda;

const setupAgenda = async () => {
    agenda = new Agenda({ mongo: mongoose.connection.db });

    await agenda.start();
    logger.info("Agenda iniciado correctamente");
    return agenda;
};

export default setupAgenda;