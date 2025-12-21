import User from "../models/User.js";
import logger from "../utils/logger.js";
import { ROLES, ROLE_DISPLAY } from "../utils/constants.js";

const getAllUsers = async (req, res) => {
    try {
        const currentUser = req.user;

        let query = {};

        // Solo MASTER y AREA_DIRECTOR pueden ver lista
        if (currentUser.role === ROLES.MASTER) {
            query = {};
        } else if (currentUser.role === ROLES.AREA_DIRECTOR) {
            query = {
                $or: [
                    { department: currentUser.department },
                    { reportsTo: currentUser._id },
                ],
            };
        } else {
            return res.status(403).json({
                success: false,
                message: "No tienes permiso para ver la lista de usuarios.",
            });
        }

        const users = await User.find(query)
            .select("-password -resetPasswordToken -resetPasswordExpires")
            .sort({ createdAt: -1 })
            .lean();

        const usersWithDisplay = users.map((user) => ({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            roleDisplay: ROLE_DISPLAY[user.role] || user.role,
            department: user.department || null,
            isActive: user.isActive,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,
            avatar: user.avatar || "",
        }));

        res.json({
            success: true,
            message: "Usuarios obtenidos correctamente",
            data: { users: usersWithDisplay },
        });
    } catch (error) {
        logger.error("Error al obtener usuarios", error);
        res.status(500).json({ success: false, message: "Error al obtener usuarios" });
    }
};

const updateUserRole = async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;
    const currentUser = req.user;

    try {
        if (!Object.values(ROLES).includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Rol inválido",
            });
        }

        const targetUser = await User.findById(userId);
        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado",
            });
        }

        // MASTER puede todo
        if (currentUser.role !== ROLES.MASTER) {
            if (currentUser.role !== ROLES.AREA_DIRECTOR) {
                return res.status(403).json({
                    success: false,
                    message: "No tienes permiso para cambiar roles",
                });
            }

            const isSubordinate = targetUser.reportsTo?.toString() === currentUser._id.toString();
            const sameDepartment = targetUser.department === currentUser.department;

            if (!isSubordinate && !sameDepartment) {
                return res.status(403).json({
                    success: false,
                    message: "Solo puedes modificar usuarios de tu área o subordinados",
                });
            }

            // Director no puede asignar MASTER ni AREA_DIRECTOR
            if (role === ROLES.MASTER || role === ROLES.AREA_DIRECTOR) {
                return res.status(403).json({
                    success: false,
                    message: "No tienes permiso para asignar este rol",
                });
            }
        }

        targetUser.role = role;
        await targetUser.save();

        logger.info(`Rol cambiado por ${currentUser.email}: ${targetUser.email} → ${role}`);

        res.json({
            success: true,
            message: "Rol actualizado correctamente",
            data: {
                user: {
                    id: targetUser._id,
                    email: targetUser.email,
                    role: targetUser.role,
                    roleDisplay: ROLE_DISPLAY[targetUser.role],
                },
            },
        });
    } catch (error) {
        logger.error("Error al actualizar rol", error);
        res.status(500).json({ success: false, message: "Error al actualizar rol" });
    }
};

export default {
    getAllUsers,
    updateUserRole,
};