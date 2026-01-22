import mongoose from "mongoose";

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

// Base column schema
const baseColumnSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: columnTypes,
        required: true,
    },
    order: { type: Number, default: 0 },
    config: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
});

// Discriminators para config específica
const Column = mongoose.model("Column", baseColumnSchema);

// Ejemplos de discriminators (puedes agregar más)
Column.discriminator("STATUS", new mongoose.Schema({
    config: {
        options: [String],
        colors: { type: Map, of: String },
    },
}));

Column.discriminator("SELECT", new mongoose.Schema({
    config: {
        options: [String],
    },
}));

Column.discriminator("FORMULA", new mongoose.Schema({
    config: {
        formula: { type: String, required: true },
    },
}));

// Item (fila)
const itemSchema = new mongoose.Schema({
    values: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    order: { type: Number, default: 0 },
}, { timestamps: true });

// Chart
const chartSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["bar", "line", "pie", "doughnut", "radar", "polarArea"],
        required: true,
    },
    dataSource: {
        columnId: String, // ID de columna como string (para referencia)
        aggregation: {
            type: String,
            enum: ["count", "sum", "average"],
            default: "count",
        },
    },
    config: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
});

const boardSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "El nombre del board es obligatorio"],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace",
        required: true,
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
    columns: [baseColumnSchema],
    items: [itemSchema],
    charts: [chartSchema],
},
    { versionKey: false },
    { timestamps: true });

boardSchema.index({ workspaceId: 1 });
boardSchema.index({ createdBy: 1 });
boardSchema.index({ isPrivate: 1 });

const Board = mongoose.model("Board", boardSchema);

export default Board;