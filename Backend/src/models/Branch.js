import mongoose from "mongoose";

const branchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "El nombre de la branch es obligatorio"],
        trim: true,
        unique: true,
    },
    code: {
        type: String,
        required: [true, "El código de branch es obligatorio"],
        uppercase: true,
        trim: true,
        unique: true,
        maxlength: [10, "El código no puede tener más de 10 caracteres"],
    },
    city: {
        type: String,
        trim: true,
    },
    state: {
        type: String,
        trim: true,
    },
    country: {
        type: String,
        default: "México",
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });



const Branch = mongoose.model("Branch", branchSchema);

export default Branch;