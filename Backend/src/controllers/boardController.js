import Board from "../models/Board.js";
import Workspace from "../models/Workspace.js";
import User from "../models/User.js";
import sendEmail from "../utils/mailer.js";
import logger from "../utils/logger.js";
import { ROLES } from "../utils/constants.js";

const columnTypes = [
    "TEXT",
    "NUMBER",
    "DATE",
    "CHECKBOX",
    "STATUS",
    "PRIORITY",
    "USER",
    "FILES",
    "TAGS",
    "SELECT",
    "FORMULA",
    "TIMELINE",
    "LOCATION",
];

// Crear board
const createBoard = async (req, res) => {
    const { name, description, workspaceId, isPrivate = false } = req.body;
    const currentUser = req.user;

    try {
        if (currentUser.role === ROLES.UNREGISTERED) {
            return res.status(403).json({ success: false, message: "Tu rol no permite crear boards" });
        }

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ success: false, message: "Workspace no encontrado" });
        }

        // Permiso para crear en este workspace
        let hasAccess = false;

        if (currentUser.role === ROLES.MASTER || currentUser.role === ROLES.AREA_DIRECTOR) {
            hasAccess = true; // ranks superiores ven todo
        } else if ([ROLES.OPERATIONS, ROLES.HR, ROLES.ADMINISTRATION].includes(currentUser.role)) {
            // Department solo crea si:
            // 1. Está invitado (privado o público)
            // 2. O el workspace es suyo (createdBy)
            // No permite crear en workspaces públicos globales de MASTER
            hasAccess =
                workspace.invitedUsers.some(u => u.toString() === currentUser._id.toString()) ||
                workspace.createdBy.toString() === currentUser._id.toString();
        }

        if (!hasAccess) {
            return res.status(403).json({ success: false, message: "No tienes permiso para crear boards en este workspace" });
        }

        const board = new Board({
            name,
            description,
            workspaceId,
            createdBy: currentUser._id,
            isPrivate,
        });

        await board.save();

        workspace.boards.push(board._id);
        await workspace.save();

        logger.info(`Board creado por ${currentUser.email}: ${name} en workspace ${workspace.name}`);

        res.status(201).json({
            success: true,
            message: "Board creado correctamente",
            data: { board },
        });
    } catch (error) {
        logger.error("Error al crear board", error);
        res.status(500).json({ success: false, message: "Error al crear board" });
    }
};

// Lista de boards en un workspace (con permisos)
const getBoardsByWorkspace = async (req, res) => {
    const { workspaceId } = req.params;
    const currentUser = req.user;

    try {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ success: false, message: "Workspace no encontrado" });
        }

        const hasAccess =
            currentUser.role === ROLES.MASTER ||
            currentUser.role === ROLES.AREA_DIRECTOR ||
            workspace.createdBy.toString() === currentUser._id.toString() ||
            workspace.invitedUsers.some(u => u.toString() === currentUser._id.toString()) ||
            !workspace.isPrivate;

        if (!hasAccess) {
            return res.status(403).json({ success: false, message: "No tienes permiso para ver boards en este workspace" });
        }

        let query = { workspaceId };

        if (currentUser.role !== ROLES.MASTER && currentUser.role !== ROLES.AREA_DIRECTOR) {
            query.$or = [
                { isPrivate: false },
                { invitedUsers: currentUser._id },
                { createdBy: currentUser._id },
            ];
        }

        const boards = await Board.find(query)
            .populate("createdBy", "name email")
            .populate("invitedUsers", "name email")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            message: "Boards obtenidos correctamente",
            data: { boards },
        });
    } catch (error) {
        logger.error("Error al obtener boards", error);
        res.status(500).json({ success: false, message: "Error al obtener boards" });
    }
};

// Obtener un board específico
const getBoardById = async (req, res) => {
    const { id } = req.params;
    const currentUser = req.user;

    try {
        const board = await Board.findById(id)
            .populate("createdBy", "name email avatar")
            .populate("invitedUsers", "name email avatar")
            .populate("workspaceId", "name")
            .populate({
                path: "items.createdBy",
                select: "name email avatar",
            })
            .populate({
                path: "items.updatedBy",
                select: "name email avatar",
            });

        if (!board) {
            return res.status(404).json({ success: false, message: "Board no encontrado" });
        }

        const workspace = board.workspaceId;

        const hasAccess =
            currentUser.role === ROLES.MASTER ||
            currentUser.role === ROLES.AREA_DIRECTOR ||
            workspace.createdBy.toString() === currentUser._id.toString() ||
            workspace.invitedUsers.some(u => u.toString() === currentUser._id.toString()) ||
            !workspace.isPrivate ||
            board.createdBy.toString() === currentUser._id.toString() ||
            board.invitedUsers.some(u => u.toString() === currentUser._id.toString()) ||
            !board.isPrivate;

        if (!hasAccess) {
            return res.status(403).json({ success: false, message: "No tienes permiso para ver este board" });
        }

        res.json({
            success: true,
            message: "Board obtenido correctamente",
            data: { board },
        });
    } catch (error) {
        logger.error("Error al obtener board", error);
        res.status(500).json({ success: false, message: "Error al obtener board" });
    }
};

// Actualizar board
const updateBoard = async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const currentUser = req.user;

    try {
        const board = await Board.findById(id);
        if (!board) {
            return res.status(404).json({ success: false, message: "Board no encontrado" });
        }

        if (currentUser.role !== ROLES.MASTER && board.createdBy.toString() !== currentUser._id.toString()) {
            return res.status(403).json({ success: false, message: "Solo el creador o MASTER puede editar este board" });
        }

        Object.assign(board, data);
        await board.save();

        logger.info(`Board actualizado por ${currentUser.email}: ${board.name}`);

        res.json({
            success: true,
            message: "Board actualizado correctamente",
            data: { board },
        });
    } catch (error) {
        logger.error("Error al actualizar board", error);
        res.status(500).json({ success: false, message: "Error al actualizar board" });
    }
};

// Desactivar board (soft delete)
const deactivateBoard = async (req, res) => {
    const { id } = req.params;
    const currentUser = req.user;

    try {
        const board = await Board.findById(id);
        if (!board) {
            return res.status(404).json({ success: false, message: "Board no encontrado" });
        }

        if (currentUser.role !== ROLES.MASTER && board.createdBy.toString() !== currentUser._id.toString()) {
            return res.status(403).json({ success: false, message: "Solo el creador o MASTER puede desactivar" });
        }

        board.isActive = false;
        await board.save();

        logger.info(`Board desactivado por ${currentUser.email}: ${board.name}`);

        res.json({
            success: true,
            message: "Board desactivado correctamente",
            data: { board },
        });
    } catch (error) {
        logger.error("Error al desactivar board", error);
        res.status(500).json({ success: false, message: "Error al desactivar board" });
    }
};

// Invitar usuario a board
const inviteUserToBoard = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    const currentUser = req.user;

    try {
        const board = await Board.findById(id);
        if (!board) {
            return res.status(404).json({ success: false, message: "Board no encontrado" });
        }

        if (currentUser.role !== ROLES.MASTER && board.createdBy.toString() !== currentUser._id.toString()) {
            return res.status(403).json({ success: false, message: "Solo el creador o MASTER puede invitar" });
        }

        const invitedUser = await User.findById(userId);
        if (!invitedUser) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }

        if (board.invitedUsers.includes(userId)) {
            return res.status(400).json({ success: false, message: "El usuario ya está invitado" });
        }

        board.invitedUsers.push(userId);
        await board.save();

        // Email
        const inviteUrl = `${process.env.FRONTEND_URL}/boards/${id}`;

        await sendEmail({
            to: invitedUser.email,
            subject: `Invitación al board "${board.name}"`,
            html: `
                <h2>Invitación a board</h2>
                <p>${currentUser.name} te ha invitado al board <strong>${board.name}</strong>.</p>
                <a href="${inviteUrl}">Acceder al board</a>
                <p>Si no esperabas esta invitación, ignórala.</p>
            `,
        });

        logger.info(`Usuario ${invitedUser.email} invitado al board ${board.name} por ${currentUser.email}`);

        res.json({
            success: true,
            message: "Invitación enviada correctamente",
            data: { board },
        });
    } catch (error) {
        logger.error("Error al invitar usuario", error);
        res.status(500).json({ success: false, message: "Error al enviar invitación" });
    }
};

// Agregar columna
const addColumn = async (req, res) => {
    const { id } = req.params;
    const { name, type, config = {}, order } = req.body;
    const currentUser = req.user;

    try {
        const board = await Board.findById(id);
        if (!board) {
            return res.status(404).json({ success: false, message: "Board no encontrado" });
        }

        if (currentUser.role !== ROLES.MASTER && board.createdBy.toString() !== currentUser._id.toString()) {
            return res.status(403).json({ success: false, message: "Solo el creador o MASTER puede agregar columnas" });
        }

        if (!columnTypes.includes(type)) {
            return res.status(400).json({ success: false, message: "Tipo de columna inválido" });
        }

        const newColumn = {
            name,
            type,
            order: order || board.columns.length + 1,
            config,
        };

        board.columns.push(newColumn);
        await board.save();

        logger.info(`Columna agregada por ${currentUser.email}: ${name} (${type}) en board ${board.name}`);

        res.status(201).json({
            success: true,
            message: "Columna agregada correctamente",
            data: { board },
        });
    } catch (error) {
        logger.error("Error al agregar columna", error);
        res.status(500).json({ success: false, message: "Error al agregar columna" });
    }
};

// Eliminar columna
const removeColumn = async (req, res) => {
    const { id, columnIndex } = req.params;
    const currentUser = req.user;

    try {
        const board = await Board.findById(id);
        if (!board) {
            return res.status(404).json({ success: false, message: "Board no encontrado" });
        }

        if (currentUser.role !== ROLES.MASTER && board.createdBy.toString() !== currentUser._id.toString()) {
            return res.status(403).json({ success: false, message: "Solo el creador o MASTER puede eliminar columnas" });
        }

        if (columnIndex < 0 || columnIndex >= board.columns.length) {
            return res.status(404).json({ success: false, message: "Columna no encontrada" });
        }

        // chequear si hay items con datos en esa columna
        const hadData = board.items.some(item => item.values.has(columnIndex.toString()));
        if (hadData) {
            logger.info(`Columna con datos eliminada por ${currentUser.email} en board ${board.name}`);
        }
        board.columns.splice(columnIndex, 1);

        // Reordenar las columnas restantes
        board.columns.forEach((col, index) => {
            col.order = index + 1;
        });

        // limpiar explícitamente los valores de esa columna en todos los items
        board.items.forEach(item => {
            item.values.delete(columnIndex.toString());
        });

        await board.save();

        logger.info(`Columna eliminada por ${currentUser.email} en board ${board.name}`);

        res.json({
            success: true,
            message: "Columna eliminada correctamente",
            data: { board },
        });
    } catch (error) {
        logger.error("Error al eliminar columna", error);
        res.status(500).json({ success: false, message: "Error al eliminar columna" });
    }
};

// Crear item (fila)
const createItem = async (req, res) => {
    const { id } = req.params;
    const { values = {} } = req.body;
    const currentUser = req.user;

    try {
        const board = await Board.findById(id);
        if (!board) {
            return res.status(404).json({ success: false, message: "Board no encontrado" });
        }

        const hasAccess =
            currentUser.role === ROLES.MASTER ||
            currentUser.role === ROLES.AREA_DIRECTOR ||
            board.createdBy.toString() === currentUser._id.toString() ||
            board.invitedUsers.some(u => u.toString() === currentUser._id.toString()) ||
            !board.isPrivate;

        if (!hasAccess) {
            return res.status(403).json({ success: false, message: "No tienes permiso para crear items en este board" });
        }

        const newItem = {
            values,
            createdBy: currentUser._id,
            updatedBy: currentUser._id,
            order: board.items.length + 1,
        };

        board.items.push(newItem);
        await board.save();

        logger.info(`Item creado por ${currentUser.email} en board ${board.name}`);

        res.status(201).json({
            success: true,
            message: "Item creado correctamente",
            data: { item: board.items[board.items.length - 1] },
        });
    } catch (error) {
        logger.error("Error al crear item", error);
        res.status(500).json({ success: false, message: "Error al crear item" });
    }
};

// Actualizar valor de una celda específica
const updateItemCell = async (req, res) => {
    const { id, itemIndex, columnIndex } = req.params;
    const { value } = req.body;
    const currentUser = req.user;

    try {
        const board = await Board.findById(id);
        if (!board) {
            return res.status(404).json({ success: false, message: "Board no encontrado" });
        }

        const hasAccess =
            currentUser.role === ROLES.MASTER ||
            currentUser.role === ROLES.AREA_DIRECTOR ||
            board.createdBy.toString() === currentUser._id.toString() ||
            board.invitedUsers.some(u => u.toString() === currentUser._id.toString()) ||
            !board.isPrivate;

        if (!hasAccess) {
            return res.status(403).json({ success: false, message: "No tienes permiso para editar este board" });
        }

        if (itemIndex < 0 || itemIndex >= board.items.length) {
            return res.status(404).json({ success: false, message: "Item no encontrado" });
        }

        if (columnIndex < 0 || columnIndex >= board.columns.length) {
            return res.status(404).json({ success: false, message: "Columna no encontrada" });
        }

        const item = board.items[itemIndex];
        item.values.set(columnIndex.toString(), value);
        item.updatedBy = currentUser._id;
        await board.save();

        logger.info(`Celda actualizada por ${currentUser.email} en board ${board.name}`);

        res.json({
            success: true,
            message: "Celda actualizada correctamente",
            data: { item: board.items[itemIndex] },
        });
    } catch (error) {
        logger.error("Error al actualizar celda", error);
        res.status(500).json({ success: false, message: "Error al actualizar celda" });
    }
};

// Agregar chart
const addChart = async (req, res) => {
    const { id } = req.params;
    const { title, type, dataSource, config = {} } = req.body;
    const currentUser = req.user;

    try {
        const board = await Board.findById(id);
        if (!board) {
            return res.status(404).json({ success: false, message: "Board no encontrado" });
        }

        if (currentUser.role !== ROLES.MASTER && board.createdBy.toString() !== currentUser._id.toString()) {
            return res.status(403).json({ success: false, message: "Solo el creador o MASTER puede agregar charts" });
        }

        const validTypes = ["bar", "line", "pie", "doughnut", "radar", "polarArea"];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ success: false, message: "Tipo de gráfica inválido" });
        }

        if (!dataSource.columnId) {
            return res.status(400).json({ success: false, message: "Debes especificar una columna para los datos" });
        }

        const newChart = {
            title,
            type,
            dataSource,
            config,
        };

        board.charts.push(newChart);
        await board.save();

        logger.info(`Chart agregado por ${currentUser.email} en board ${board.name}`);

        res.status(201).json({
            success: true,
            message: "Gráfica agregada correctamente",
            data: { board },
        });
    } catch (error) {
        logger.error("Error al agregar chart", error);
        res.status(500).json({ success: false, message: "Error al agregar chart" });
    }
};

// Eliminar chart
const removeChart = async (req, res) => {
    const { id, chartIndex } = req.params;
    const currentUser = req.user;

    try {
        const board = await Board.findById(id);
        if (!board) {
            return res.status(404).json({ success: false, message: "Board no encontrado" });
        }

        if (currentUser.role !== ROLES.MASTER && board.createdBy.toString() !== currentUser._id.toString()) {
            return res.status(403).json({ success: false, message: "Solo el creador o MASTER puede eliminar charts" });
        }

        if (chartIndex < 0 || chartIndex >= board.charts.length) {
            return res.status(404).json({ success: false, message: "Gráfica no encontrada" });
        }

        board.charts.splice(chartIndex, 1);
        await board.save();

        logger.info(`Chart eliminado por ${currentUser.email} en board ${board.name}`);

        res.json({
            success: true,
            message: "Gráfica eliminada correctamente",
            data: { board },
        });
    } catch (error) {
        logger.error("Error al eliminar chart", error);
        res.status(500).json({ success: false, message: "Error al eliminar chart" });
    }
};

// Obtener tipos de columnas
const getColumnTypes = async (req, res) => {
    try {
        res.json({
            success: true,
            data: { columnTypes },
        });
    } catch (error) {
        logger.error("Error al obtener tipos de columnas", error);
        res.status(500).json({ success: false, message: "Error interno" });
    }
};

// Eliminar item (fila)
const removeItem = async (req, res) => {
    const { id, itemIndex } = req.params;
    const currentUser = req.user;

    try {
        const board = await Board.findById(id);
        if (!board) {
            return res.status(404).json({ success: false, message: "Board no encontrado" });
        }

        const hasAccess =
            currentUser.role === ROLES.MASTER ||
            board.createdBy.toString() === currentUser._id.toString() ||
            board.invitedUsers.some(u => u.toString() === currentUser._id.toString());

        if (!hasAccess) {
            return res.status(403).json({ success: false, message: "No tienes permiso para eliminar items" });
        }

        if (itemIndex < 0 || itemIndex >= board.items.length) {
            return res.status(404).json({ success: false, message: "Item no encontrado" });
        }

        board.items.splice(itemIndex, 1);
        await board.save();

        logger.info(`Item eliminado por ${currentUser.email} en board ${board.name}`);

        res.json({
            success: true,
            message: "Item eliminado correctamente",
            data: { board },
        });
    } catch (error) {
        logger.error("Error al eliminar item", error);
        res.status(500).json({ success: false, message: "Error al eliminar item" });
    }
};

// Reordenar columnas
const reorderColumns = async (req, res) => {
    const { id } = req.params;
    const { orderedColumnIds } = req.body;
    const currentUser = req.user;

    try {
        const board = await Board.findById(id);
        if (!board) return res.status(404).json({ success: false, message: "Board no encontrado" });

        if (currentUser.role !== ROLES.MASTER && board.createdBy.toString() !== currentUser._id.toString()) {
            return res.status(403).json({ success: false, message: "No tienes permiso" });
        }

        // Mapear los nuevos órdenes
        const columnMap = new Map(board.columns.map(col => [col._id.toString(), col]));
        const updatedColumns = orderedColumnIds.map((colId, index) => {
            const col = columnMap.get(colId);
            if (!col) throw new Error("Columna no encontrada");
            col.order = index + 1;
            return col;
        });

        board.columns = updatedColumns;
        await board.save();

        res.json({ success: true, message: "Columnas reordenadas", data: { board } });
    } catch (error) {
        logger.error("Error reordenando columnas", error);
        res.status(500).json({ success: false, message: "Error al reordenar" });
    }
};

// Reordenar items (filas)
const reorderItems = async (req, res) => {
    const { id } = req.params;
    const { orderedItemIds } = req.body;
    const currentUser = req.user;

    try {
        const board = await Board.findById(id);
        if (!board) return res.status(404).json({ success: false, message: "Board no encontrado" });

        // Permiso
        const hasAccess =
            currentUser.role === ROLES.MASTER ||
            board.createdBy.toString() === currentUser._id.toString() ||
            board.invitedUsers.some(u => u.toString() === currentUser._id.toString());
        if (!hasAccess) return res.status(403).json({ success: false, message: "No tienes permiso" });

        const itemMap = new Map(board.items.map(item => [item._id.toString(), item]));
        const updatedItems = orderedItemIds.map((itemId, index) => {
            const item = itemMap.get(itemId);
            if (!item) throw new Error("Item no encontrado");
            item.order = index + 1;
            return item;
        });

        board.items = updatedItems;
        await board.save();

        res.json({ success: true, message: "Filas reordenadas", data: { board } });
    } catch (error) {
        logger.error("Error reordenando items", error);
        res.status(500).json({ success: false, message: "Error al reordenar" });
    }
};

export default {
    createBoard,
    getBoardsByWorkspace,
    getBoardById,
    updateBoard,
    deactivateBoard,
    inviteUserToBoard,
    addColumn,
    removeColumn,
    createItem,
    updateItemCell,
    addChart,
    removeChart,
    getColumnTypes,
    removeItem,
    reorderColumns,
    reorderItems,
};