import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "El nombre del workspace es obligatorio"],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    isPrivate: {
        type: Boolean,
        default: false,
    },
    invitedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    boards: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Board",
    }],
}, { timestamps: true });

workspaceSchema.index({ createdBy: 1 });
workspaceSchema.index({ isPrivate: 1 });

const Workspace = mongoose.model("Workspace", workspaceSchema);

export default Workspace;