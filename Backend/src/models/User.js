import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { ROLES, DEPARTMENTS } from "../utils/constants.js";
import logger from "../utils/logger.js";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "El nombre es obligatorio"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "El correo es obligatorio"],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, "La contraseña es obligatoria"],
        minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
    },
    role: {
        type: String,
        enum: Object.values(ROLES),
        default: ROLES.UNREGISTERED,
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
    },
    department: {
        type: String,
        enum: Object.values(DEPARTMENTS),
    },
    reportsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    invitedBoards: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Board",
    }],
    avatar: {
        type: String,
        default: "",
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isActive: {
        type: Boolean,
        default: true,
    },
    emailVerified: {
        type: Boolean,
        default: false,
    },
    emailVerificationToken: String,
}, { timestamps: true });

// Hashear contraseña antes de guardar
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        logger.error("Error al hashear contraseña", error);
        throw error;
    }
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Índices para búsquedas frecuentes
userSchema.index({ role: 1 });
userSchema.index({ reportsTo: 1 });
userSchema.index({ invitedBoards: 1 });

const User = mongoose.model("User", userSchema);

export default User;