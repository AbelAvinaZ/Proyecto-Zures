import User from "../models/User.js";
import sendEmail from "../utils/mailer.js";
import logger from "../utils/logger.js";
import { v4 as uuid } from "uuid";
import jwt from "jsonwebtoken";
import { ROLES, ROLE_DISPLAY } from "../utils/constants.js";

const generateJWT = (userId, role) => {
    return jwt.sign(
        { id: userId, role },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
    );
};

// Registro público
const register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "El correo ya está registrado" });
        }

        const verificationToken = uuid();

        const user = new User({
            name,
            email,
            password,
            emailVerificationToken: verificationToken,
            role: ROLES.UNREGISTERED,
        });

        await user.save();

        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

        // await sendEmail({
        //     to: email,
        //     subject: "Verifica tu cuenta - App Seguridad",
        //     html: `
        //         <h2>Bienvenido, ${name}</h2>
        //         <p>Para completar tu registro, haz clic en el siguiente enlace:</p>
        //         <a href="${verificationUrl}">Verificar mi cuenta</a>
        //         <p>Este enlace expira en 24 horas.</p>
        //     `,
        // });

        logger.info(`Usuario registrado (pendiente verificación): ${email}`);

        res.status(201).json({
            success: true,
            message: "Usuario creado. Por favor verifica tu correo electrónico.",
        });
    } catch (error) {
        logger.error("Error en registro", error);
        res.status(500).json({ success: false, message: "Error al registrar usuario" });
    }
};

// Verificación de email
const verifyEmail = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({
            emailVerificationToken: token,
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Token inválido o expirado" });
        }

        user.emailVerified = true;
        user.emailVerificationToken = undefined;
        await user.save();

        logger.info(`Email verificado: ${user.email}`);

        // Redirigir al frontend con mensaje de éxito
        res.redirect(`${process.env.FRONTEND_URL}/login?verified=true`);
    } catch (error) {
        logger.error("Error en verificación de email", error);
        res.status(500).json({ success: false, message: "Error al verificar email" });
    }
};

// Login
const login = async (req, res) => {
    const { email, password, rememberMe = false } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || !user.emailVerified) {
            return res.status(400).json({ success: false, message: "Credenciales inválidas o email no verificado" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Credenciales inválidas" });
        }

        if (!user.isActive) {
            return res.status(403).json({ success: false, message: "Cuenta desactivada" });
        }

        const token = generateJWT(user._id, user.role);

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : null, // 30 días o sesión
        };

        res.cookie("jwt", token, cookieOptions);

        logger.info(`Login exitoso: ${email} - Rol: ${user.role}`);

        res.json({
            success: true,
            message: "Login exitoso",
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
        logger.error("Error en login", error);
        res.status(500).json({ success: false, message: "Error al iniciar sesión" });
    }
};

// Logout
const logout = (req, res) => {
    res.clearCookie("jwt", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.json({ success: true, message: "Sesión cerrada" });
};

// Solicitar reset de contraseña
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            // No revelamos si el email existe por seguridad
            return res.status(200).json({
                success: true,
                message: "Si el correo existe, se ha enviado un enlace de recuperación.",
            });
        }

        const resetToken = uuid();
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hora

        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        // await sendEmail({
        //     to: email,
        //     subject: "Recuperación de contraseña - App Seguridad",
        //     html: `
        //         <h2>¿Olvidaste tu contraseña?</h2>
        //         <p>Haz clic en el siguiente enlace para restablecerla:</p>
        //         <a href="${resetUrl}">Restablecer contraseña</a>
        //         <p>Este enlace expira en 1 hora.</p>
        //         <p>Si no solicitaste esto, ignora este correo.</p>
        //     `,
        // });

        logger.info(`Solicitud de reset de contraseña enviada a: ${email}`);

        res.json({
            success: true,
            message: "Si el correo existe, se ha enviado un enlace de recuperación.",
        });
    } catch (error) {
        logger.error("Error en forgot password", error);
        res.status(500).json({ success: false, message: "Error al procesar la solicitud" });
    }
};

// Restablecer contraseña con token
const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Token inválido o expirado.",
            });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        logger.info(`Contraseña restablecida para: ${user.email}`);

        res.json({
            success: true,
            message: "Contraseña actualizada correctamente.",
        });
    } catch (error) {
        logger.error("Error en reset password", error);
        res.status(500).json({ success: false, message: "Error al restablecer contraseña" });
    }
};

export default {
    register,
    verifyEmail,
    login,
    logout,
    forgotPassword,
    resetPassword,
};