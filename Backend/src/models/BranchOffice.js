import mongoose from "mongoose";

const branchOfficeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "El nombre de la sucursal es obligatorio"],
        trim: true,
        unique: true,
    },
    code: {
        type: String,
        required: [true, "El código de sucursal es obligatorio"],
        uppercase: true,
        trim: true,
        unique: true,
        maxlength: [15, "El código no puede tener más de 15 caracteres"],
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
        required: [true, "La sucursal debe pertenecer a una branch"],
    },
    address: {
        type: String,
        trim: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // opcional: quién es el responsable (AREA_DIRECTOR o OPERATIONS)
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });


const BranchOffice = mongoose.model("BranchOffice", branchOfficeSchema);

export default BranchOffice;