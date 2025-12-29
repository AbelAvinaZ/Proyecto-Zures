import request from "supertest";
import app from "../src/index.js";
import User from "../src/models/User.js";
import JobPosition from "../src/models/JobPosition.js";
import { ROLES } from "../src/utils/constants.js";
import jwt from "jsonwebtoken";

describe("JobPosition Endpoints", () => {
    let masterUser;
    let directorUser;
    let operationsUser;
    let masterToken;
    let directorToken;
    let operationsToken;

    beforeEach(async () => {
        await User.deleteMany({});
        await JobPosition.deleteMany({});

        masterUser = await User.create({
            name: "Master", email: "master@jp.com", password: "123456",
            role: ROLES.MASTER, emailVerified: true,
        });

        directorUser = await User.create({
            name: "Director", email: "director@jp.com", password: "123456",
            role: ROLES.AREA_DIRECTOR, emailVerified: true,
        });

        operationsUser = await User.create({
            name: "Ops", email: "ops@jp.com", password: "123456",
            role: ROLES.OPERATIONS, emailVerified: true,
        });

        const generateToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);

        masterToken = generateToken(masterUser);
        directorToken = generateToken(directorUser);
        operationsToken = generateToken(operationsUser);
    });

    describe("POST /api/job-positions - Crear puesto", () => {
        it("MASTER puede crear puesto", async () => {
            const res = await request(app)
                .post("/api/job-positions")
                .set("Cookie", [`jwt=${masterToken}`])
                .send({
                    name: "Guardia",
                    code: "GUARD",
                    baseSalary: 10000,
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
        });

        it("AREA_DIRECTOR puede crear puesto", async () => {
            const res = await request(app)
                .post("/api/job-positions")
                .set("Cookie", [`jwt=${directorToken}`])
                .send({
                    name: "Supervisor",
                    code: "SUP",
                    baseSalary: 15000,
                });

            expect(res.status).toBe(201);
        });

        it("OPERATIONS no puede crear puesto", async () => {
            const res = await request(app)
                .post("/api/job-positions")
                .set("Cookie", [`jwt=${operationsToken}`])
                .send({
                    name: "No permitido",
                    code: "NO",
                    baseSalary: 5000,
                });

            expect(res.status).toBe(403);
        });
    });

    describe("GET /api/job-positions - Lista", () => {
        it("todos autenticados ven la lista", async () => {
            await JobPosition.create({
                name: "Guardia",
                code: "GUARD",
                baseSalary: 10000,
            });

            const res = await request(app)
                .get("/api/job-positions")
                .set("Cookie", [`jwt=${operationsToken}`]);

            expect(res.status).toBe(200);
            expect(res.body.data.jobPositions.length).toBe(1);
        });
    });

    describe("PATCH /api/job-positions/:id - Update y deactivate", () => {
        let testPosition;

        beforeEach(async () => {
            testPosition = await JobPosition.create({
                name: "Test Position",
                code: "TEST",
                baseSalary: 12000,
            });
        });

        it("MASTER puede actualizar puesto", async () => {
            const res = await request(app)
                .patch(`/api/job-positions/${testPosition._id}`)
                .set("Cookie", [`jwt=${masterToken}`])
                .send({ baseSalary: 15000 });

            expect(res.status).toBe(200);
            const updated = await JobPosition.findById(testPosition._id);
            expect(updated.baseSalary).toBe(15000);
        });

        it("AREA_DIRECTOR puede desactivar puesto", async () => {
            const res = await request(app)
                .patch(`/api/job-positions/${testPosition._id}/deactivate`)
                .set("Cookie", [`jwt=${directorToken}`]);

            expect(res.status).toBe(200);
            const deactivated = await JobPosition.findById(testPosition._id);
            expect(deactivated.isActive).toBe(false);
        });
    });

    describe("DELETE /api/job-positions/:id - Delete", () => {
        let testPosition;

        beforeEach(async () => {
            testPosition = await JobPosition.create({
                name: "To Delete",
                code: "DEL",
                baseSalary: 10000,
            });
        });

        it("MASTER puede eliminar puesto permanentemente", async () => {
            const res = await request(app)
                .delete(`/api/job-positions/${testPosition._id}`)
                .set("Cookie", [`jwt=${masterToken}`]);

            expect(res.status).toBe(200);
            const deleted = await JobPosition.findById(testPosition._id);
            expect(deleted).toBeNull();
        });

        it("AREA_DIRECTOR no puede eliminar permanentemente", async () => {
            const res = await request(app)
                .delete(`/api/job-positions/${testPosition._id}`)
                .set("Cookie", [`jwt=${directorToken}`]);

            expect(res.status).toBe(403);
        });
    });
});