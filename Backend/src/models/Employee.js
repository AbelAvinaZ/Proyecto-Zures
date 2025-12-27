import mongoose from "mongoose";
import { v4 as uuid } from "uuid";


const employeeSchema = new mongoose.Schema({
    employeeCode: {
        type: String,
        unique: true,
        default: () => uuid().toUpperCase().slice(0, 12),
        uppercase: true,
    },
    name: {
        type: String,
        required: [true, "El nombre es obligatorio"],
        trim: true,
    },
    lastName: {
        type: String,
        required: [true, "El apellido es obligatorio"],
        trim: true,
    },
    branchOfficeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BranchOffice",
        required: [true, "La sucursal es obligatoria"],
    },
    jobPositionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "JobPosition",
    },
    hireDate: {
        type: Date,
        required: [true, "La fecha de contratación es obligatoria"],
    },
    terminationDate: {
        type: Date,
    },
    phone: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
    },
    avatar: {
        type: String,
        default: "",
    },
    emergencyContact: {
        name: String,
        phone: String,
    },
    maritalStatus: {
        type: String,
        enum: ["SOLTERO", "CASADO", "DIVORCIADO", "VIUDO", "UNION_LIBRE", "OTRO"],
        default: "SOLTERO",
    },
    birthDate: {
        type: Date,
    },
    rfc: {
        type: String,
        uppercase: true,
        trim: true,
        maxlength: [13],
    },
    curp: {
        type: String,
        uppercase: true,
        trim: true,
        maxlength: [18],
    },
    socialSecurityNumber: {
        type: String,
        trim: true,
    },
    hasSocialSecurity: {
        type: Boolean,
        default: false,
    },
    fiscalSalary: Number,
    positionSalary: Number,
    vacationHistory: [{
        year: Number,
        startDate: Date,
        endDate: Date,
        daysTaken: Number,
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    }],
    availableVacations: {
        type: Number,
        default: 0,
    },
    employmentStatus: {
        type: String,
        enum: ["ACTIVO", "INACTIVO"],
        default: "ACTIVO",
    },
    laborProcess: {
        type: String,
        enum: [
            "CONTRATO_PRUEBA",
            "CONTRATO_INDETERMINADO",
            "CONTRATO_EVENTUAL",
            "FINIQUITO",
            "CONCILIACION",
            "DEMANDA",
            "LIQUIDACION",
            "AUSENTE_INCOMUNICADO",
            "N/A",
        ],
        default: "N/A",
    },
    observations: String,
    documents: [{
        url: {
            type: String,
            required: true,
        },
        description: String,
        uploadedAt: {
            type: Date,
            default: Date.now,
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    }],
    assignedEquipment: [{
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "InventoryItem",
        },
        deliveryDate: Date,
        returnDate: Date,
        condition: String,
        deliveredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    }],
}, { timestamps: true });

// Virtual fullName
employeeSchema.virtual("fullName").get(function () {
    return `${this.name} ${this.lastName}`.trim();
});

// Índices
employeeSchema.index({ branchOfficeId: 1 });
employeeSchema.index({ employmentStatus: 1 });
employeeSchema.index({ lastName: 1, name: 1 });
employeeSchema.index({ laborProcess: 1 });

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;