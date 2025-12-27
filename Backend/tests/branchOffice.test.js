import request from "supertest";
import app from "../src/index.js";
import User from "../src/models/User.js";
import Branch from "../src/models/Branch.js";
import BranchOffice from "../src/models/BranchOffice.js";
import { ROLES } from "../src/utils/constants.js";
import jwt from "jsonwebtoken";

describe("BranchOffice Endpoints", () => {
    let masterUser;
    let directorUser;
    let operationsUser;
    let masterToken;
    let directorToken;
    let operationsToken;
    let testBranch;

    beforeEach(async () => {
        await User.deleteMany({});
        await Branch.deleteMany({});
        await BranchOffice.deleteMany({});

        masterUser = await User.create({
            name: "Master User",
            email: "master@branchoffice.com",
            password: "123456",
            role: ROLES.MASTER,
            emailVerified: true,
        });

        directorUser = await User.create({
            name: "Director User",
            email: "director@branchoffice.com",
            password: "123456",
            role: ROLES.AREA_DIRECTOR,
            emailVerified: true,
        });

        operationsUser = await User.create({
            name: "Operations User",
            email: "ops@branchoffice.com",
            password: "123456",
            role: ROLES.OPERATIONS,
            emailVerified: true,
        });

        testBranch = await Branch.create({
            name: "Puebla",
            code: "PUE",
        });

        const generateToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "30d" });

        masterToken = generateToken(masterUser);
        directorToken = generateToken(directorUser);
        operationsToken = generateToken(operationsUser);
    });

    describe("POST /api/branch-offices - Crear sucursal específica", () => {
        it("MASTER puede crear BranchOffice", async () => {
            const res = await request(app)
                .post("/api/branch-offices")
                .set("Cookie", [`jwt=${masterToken}`])
                .send({
                    name: "ADO Puebla",
                    code: "ADO-PUE",
                    branchId: testBranch._id.toString(),
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
        });

        it("AREA_DIRECTOR puede crear BranchOffice", async () => {
            const res = await request(app)
                .post("/api/branch-offices")
                .set("Cookie", [`jwt=${directorToken}`])
                .send({
                    name: "Plaza X Puebla",
                    code: "PLAZAX-PUE",
                    branchId: testBranch._id.toString(),
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
        });

        it("OPERATIONS no puede crear BranchOffice", async () => {
            const res = await request(app)
                .post("/api/branch-offices")
                .set("Cookie", [`jwt=${operationsToken}`])
                .send({
                    name: "No permitida",
                    code: "NO-PUE",
                    branchId: testBranch._id.toString(),
                });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });

        it("falta branchId retorna 400 (Joi)", async () => {
            const res = await request(app)
                .post("/api/branch-offices")
                .set("Cookie", [`jwt=${masterToken}`])
                .send({
                    name: "Sin branch",
                    code: "SIN-BRANCH",
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(Array.isArray(res.body.errors) ? res.body.errors[0] : res.body.message).toContain("obligatoria");
        });

        it("código duplicado retorna error", async () => {
            await request(app)
                .post("/api/branch-offices")
                .set("Cookie", [`jwt=${masterToken}`])
                .send({
                    name: "Original",
                    code: "DUPLICADO",
                    branchId: testBranch._id.toString(),
                });

            const res = await request(app)
                .post("/api/branch-offices")
                .set("Cookie", [`jwt=${masterToken}`])
                .send({
                    name: "Duplicado",
                    code: "DUPLICADO",
                    branchId: testBranch._id.toString(),
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain("ya existe");
        });
    });

    describe("GET /api/branch-offices - Lista de sucursales específicas", () => {
        it("todos autenticados pueden ver la lista", async () => {
            await BranchOffice.create({
                name: "ADO Puebla",
                code: "ADO-PUE",
                branchId: testBranch._id,
            });

            const res = await request(app)
                .get("/api/branch-offices")
                .set("Cookie", [`jwt=${operationsToken}`]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.branchOffices.length).toBe(1);
        });

        it("no autenticado recibe 401", async () => {
            const res = await request(app).get("/api/branch-offices");
            expect(res.status).toBe(401);
        });
    });
});