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

// Ver perfil propio
const getMyProfile = async (req, res) => {
    const currentUser = req.user;

    try {
        const user = await User.findById(currentUser._id)
            .select("name email role roleDisplay avatar department branchId isActive emailVerified createdAt");

        if (!user) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }

        res.json({
            success: true,
            message: "Perfil obtenido correctamente",
            data: { user },
        });
    } catch (error) {
        logger.error("Error al obtener perfil propio", error);
        res.status(500).json({ success: false, message: "Error al obtener perfil" });
    }
};

// Actualizar perfil propio (nombre, avatar, etc.)
const updateMyProfile = async (req, res) => {
    const { name, avatar } = req.body;
    const currentUser = req.user;

    try {
        const user = await User.findById(currentUser._id);
        if (!user) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }

        if (name) user.name = name;
        if (avatar) user.avatar = avatar; // URL de Cloudinary

        await user.save();

        logger.info(`Perfil actualizado por ${user.email}`);

        res.json({
            success: true,
            message: "Perfil actualizado correctamente",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    roleDisplay: ROLE_DISPLAY[user.role],
                    avatar: user.avatar,
                },
            },
        });
    } catch (error) {
        logger.error("Error al actualizar perfil", error);
        res.status(500).json({ success: false, message: "Error al actualizar perfil" });
    }
};

// Cambiar contraseña (requiere contraseña actual)
const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const currentUser = req.user;

    try {
        const user = await User.findById(currentUser._id);
        if (!user) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Contraseña actual incorrecta" });
        }

        user.password = newPassword; // El pre-save hook hasheará
        await user.save();

        logger.info(`Contraseña cambiada por ${user.email}`);

        res.json({
            success: true,
            message: "Contraseña actualizada correctamente",
        });
    } catch (error) {
        logger.error("Error al cambiar contraseña", error);
        res.status(500).json({ success: false, message: "Error al cambiar contraseña" });
    }
};

export default {
    getAllUsers,
    updateUserRole,
    getMyProfile,
    updateMyProfile,
    changePassword,
};