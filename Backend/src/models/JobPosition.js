import mongoose from "mongoose";

const jobPositionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "El nombre del puesto es obligatorio"],
        trim: true,
        unique: true,
    },
    code: {
        type: String,
        required: [true, "El código del puesto es obligatorio"],
        uppercase: true,
        trim: true,
        unique: true,
        maxlength: [20, "El código no puede tener más de 20 caracteres"],
    },
    baseSalary: {
        type: Number,
        required: [true, "El salario base es obligatorio"],
        min: [0, "El salario no puede ser negativo"],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });


const JobPosition = mongoose.model("JobPosition", jobPositionSchema);

export default JobPosition;