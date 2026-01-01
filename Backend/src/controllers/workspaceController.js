import Workspace from "../models/Workspace.js";
import User from "../models/User.js";
import sendEmail from "../utils/mailer.js";
import logger from "../utils/logger.js";
import { ROLES } from "../utils/constants.js";

// Crear workspace
const createWorkspace = async (req, res) => {
    const { name, description, isPrivate = false } = req.body;
    const currentUser = req.user;

    try {
        const workspace = new Workspace({
            name,
            description,
            createdBy: currentUser._id,
            isPrivate,
            invitedUsers: isPrivate ? [] : undefined, // Solo invitados si privado
        });

        await workspace.save();

        logger.info(`Workspace creado por ${currentUser.email}: ${name}`);

        res.status(201).json({
            success: true,
            message: "Workspace creado correctamente",
            data: { workspace },
        });
    } catch (error) {
        logger.error("Error al crear workspace", error);
        res.status(500).json({ success: false, message: "Error al crear workspace" });
    }
};

// Lista de workspaces (con filtros de permiso)
const getAllWorkspaces = async (req, res) => {
    const currentUser = req.user;

    try {
        let query = {};

        // Department solo ve públicos + invitados
        if ([ROLES.OPERATIONS, ROLES.HR, ROLES.ADMINISTRATION].includes(currentUser.role)) {
            query.$or = [
                { isPrivate: false },
                { invitedUsers: currentUser._id },
                { createdBy: currentUser._id },
            ];
        }
        // MASTER y AREA_DIRECTOR ven todo
        // No filtro adicional

        const workspaces = await Workspace.find(query)
            .populate("createdBy", "name email")
            .populate("invitedUsers", "name email")
            .select("-__v")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            message: "Workspaces obtenidos correctamente",
            data: { workspaces },
        });
    } catch (error) {
        logger.error("Error al obtener workspaces", error);
        res.status(500).json({ success: false, message: "Error al obtener workspaces" });
    }
};

// Obtener uno específico
const getWorkspaceById = async (req, res) => {
    const { id } = req.params;
    const currentUser = req.user;

    try {
        const workspace = await Workspace.findById(id)
            .populate("createdBy", "name email")
            .populate("invitedUsers", "name email")
            .populate("boards");

        if (!workspace) {
            return res.status(404).json({ success: false, message: "Workspace no encontrado" });
        }

        const hasAccess =
            currentUser.role === ROLES.MASTER ||
            currentUser.role === ROLES.AREA_DIRECTOR ||
            workspace.createdBy._id.toString() === currentUser._id.toString() ||
            workspace.invitedUsers.some(u => u._id.toString() === currentUser._id.toString()) ||
            !workspace.isPrivate;

        if (!hasAccess) {
            return res.status(403).json({ success: false, message: "No tienes permiso para ver este workspace" });
        }

        res.json({
            success: true,
            message: "Workspace obtenido correctamente",
            data: { workspace },
        });
    } catch (error) {
        logger.error("Error al obtener workspace", error);
        res.status(500).json({ success: false, message: "Error al obtener workspace" });
    }
};

// Actualizar workspace
const updateWorkspace = async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const currentUser = req.user;

    try {
        const workspace = await Workspace.findById(id);
        if (!workspace) {
            return res.status(404).json({ success: false, message: "Workspace no encontrado" });
        }

        if (currentUser.role !== ROLES.MASTER && workspace.createdBy.toString() !== currentUser._id.toString()) {
            return res.status(403).json({ success: false, message: "Solo el creador o MASTER puede editar" });
        }

        Object.assign(workspace, data);
        await workspace.save();

        logger.info(`Workspace actualizado por ${currentUser.email}: ${workspace.name}`);

        res.json({
            success: true,
            message: "Workspace actualizado correctamente",
            data: { workspace },
        });
    } catch (error) {
        logger.error("Error al actualizar workspace", error);
        res.status(500).json({ success: false, message: "Error al actualizar workspace" });
    }
};

// Desactivar workspace (soft delete)
const deactivateWorkspace = async (req, res) => {
    const { id } = req.params;
    const currentUser = req.user;

    try {
        const workspace = await Workspace.findById(id);
        if (!workspace) {
            return res.status(404).json({ success: false, message: "Workspace no encontrado" });
        }

        if (currentUser.role !== ROLES.MASTER && workspace.createdBy.toString() !== currentUser._id.toString()) {
            return res.status(403).json({ success: false, message: "Solo el creador o MASTER puede desactivar" });
        }

        workspace.isActive = false;
        await workspace.save();

        logger.info(`Workspace desactivado por ${currentUser.email}: ${workspace.name}`);

        res.json({
            success: true,
            message: "Workspace desactivado correctamente",
            data: { workspace },
        });
    } catch (error) {
        logger.error("Error al desactivar workspace", error);
        res.status(500).json({ success: false, message: "Error al desactivar workspace" });
    }
};

// Invitar usuario
const inviteUserToWorkspace = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    const currentUser = req.user;

    try {
        const workspace = await Workspace.findById(id);
        if (!workspace) {
            return res.status(404).json({ success: false, message: "Workspace no encontrado" });
        }

        if (currentUser.role !== ROLES.MASTER && workspace.createdBy.toString() !== currentUser._id.toString()) {
            return res.status(403).json({ success: false, message: "Solo el creador o MASTER puede invitar" });
        }

        const invitedUser = await User.findById(userId);
        if (!invitedUser) {
            return res.status(404).json({ success: false, message: "Usuario a invitar no encontrado" });
        }

        if (workspace.invitedUsers.includes(userId)) {
            return res.status(400).json({ success: false, message: "El usuario ya está invitado" });
        }

        workspace.invitedUsers.push(userId);
        await workspace.save();

        // Enviar email
        const inviteUrl = `${process.env.FRONTEND_URL}/workspaces/${id}`;

        // await sendEmail({
        //     to: invitedUser.email,
        //     subject: `Has sido invitado al workspace "${workspace.name}"`,
        //     html: `
        //         <h2>Invitación a workspace</h2>
        //         <p>${currentUser.name} te ha invitado al workspace <strong>${workspace.name}</strong>.</p>
        //         <a href="${inviteUrl}">Acceder al workspace</a>
        //         <p>Si no esperabas esta invitación, ignórala.</p>
        //     `,
        // });

        logger.info(`Usuario ${invitedUser.email} invitado al workspace ${workspace.name} por ${currentUser.email}`);

        res.json({
            success: true,
            message: "Invitación enviada correctamente",
            data: { workspace },
        });
    } catch (error) {
        logger.error("Error al invitar usuario", error);
        res.status(500).json({ success: false, message: "Error al enviar invitación" });
    }
};

export default {
    createWorkspace,
    getAllWorkspaces,
    getWorkspaceById,
    updateWorkspace,
    deactivateWorkspace,
    inviteUserToWorkspace,
};