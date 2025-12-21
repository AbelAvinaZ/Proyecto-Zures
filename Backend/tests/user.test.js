import request from "supertest";
import app from "../src/index.js";
import User from "../src/models/User.js";
import { ROLES } from "../src/utils/constants.js";
import jwt from "jsonwebtoken";

describe("User Management Endpoints", () => {
    let masterUser;
    let directorUser;
    let operationsUser;
    let hrUser;
    let unregisteredUser;
    let masterToken;
    let directorToken;
    let unregisteredToken;

    beforeEach(async () => {
        await User.deleteMany({});

        masterUser = await User.create({
            name: "Master User",
            email: "master@example.com",
            password: "123456",
            role: ROLES.MASTER,
            emailVerified: true,
        });

        directorUser = await User.create({
            name: "Director User",
            email: "director@example.com",
            password: "123456",
            role: ROLES.AREA_DIRECTOR,
            department: "OPERATIONS",
            emailVerified: true,
        });

        operationsUser = await User.create({
            name: "Operations User",
            email: "ops@example.com",
            password: "123456",
            role: ROLES.UNREGISTERED,
            department: "OPERATIONS",
            emailVerified: true,
        });

        hrUser = await User.create({
            name: "HR User",
            email: "hr@example.com",
            password: "123456",
            role: ROLES.UNREGISTERED,
            department: "HR",
            emailVerified: true,
        });

        unregisteredUser = await User.create({
            name: "Unregistered User",
            email: "unreg@example.com",
            password: "123456",
            role: ROLES.UNREGISTERED,
            emailVerified: true,
        });

        const generateToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "30d" });

        masterToken = generateToken(masterUser);
        directorToken = generateToken(directorUser);
        unregisteredToken = generateToken(unregisteredUser);
    });

    describe("GET /api/users", () => {
        it("MASTER ve todos los usuarios con todos los campos", async () => {
            const res = await request(app)
                .get("/api/users")
                .set("Cookie", [`jwt=${masterToken}`]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.users.length).toBe(5);

            const masterInList = res.body.data.users.find(u => u.email === "master@example.com");
            expect(masterInList).toHaveProperty("department");
            expect(masterInList).toHaveProperty("emailVerified");
            expect(masterInList).toHaveProperty("isActive");
            expect(masterInList).toHaveProperty("createdAt");
        });

        it("AREA_DIRECTOR ve solo usuarios de su área o subordinados", async () => {
            const res = await request(app)
                .get("/api/users")
                .set("Cookie", [`jwt=${directorToken}`]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.users.length).toBe(2); // director + operationsUser
            expect(res.body.data.users.some(u => u.email === "ops@example.com")).toBe(true);
            expect(res.body.data.users.some(u => u.email === "hr@example.com")).toBe(false);
        });

        it("UNREGISTERED recibe 403", async () => {
            const res = await request(app)
                .get("/api/users")
                .set("Cookie", [`jwt=${unregisteredToken}`]);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });

        it("no autenticado recibe 401", async () => {
            const res = await request(app).get("/api/users");
            expect(res.status).toBe(401);
        });
    });

    describe("PATCH /api/users/:id/role", () => {
        it("MASTER puede cambiar cualquier rol", async () => {
            const res = await request(app)
                .patch(`/api/users/${operationsUser._id}/role`)
                .set("Cookie", [`jwt=${masterToken}`])
                .send({ role: ROLES.OPERATIONS });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            const updated = await User.findById(operationsUser._id);
            expect(updated.role).toBe(ROLES.OPERATIONS);
        });

        it("AREA_DIRECTOR puede cambiar rol de subordinado en su área", async () => {
            const res = await request(app)
                .patch(`/api/users/${operationsUser._id}/role`)
                .set("Cookie", [`jwt=${directorToken}`])
                .send({ role: ROLES.OPERATIONS });

            expect(res.status).toBe(200);
        });

        it("AREA_DIRECTOR NO puede cambiar rol fuera de su área", async () => {
            const res = await request(app)
                .patch(`/api/users/${hrUser._id}/role`)
                .set("Cookie", [`jwt=${directorToken}`])
                .send({ role: ROLES.HR });

            expect(res.status).toBe(403);
        });

        it("AREA_DIRECTOR NO puede asignar rol superior", async () => {
            const res = await request(app)
                .patch(`/api/users/${operationsUser._id}/role`)
                .set("Cookie", [`jwt=${directorToken}`])
                .send({ role: ROLES.MASTER });

            expect(res.status).toBe(403);
        });

        it("UNREGISTERED no puede cambiar roles", async () => {
            const res = await request(app)
                .patch(`/api/users/${operationsUser._id}/role`)
                .set("Cookie", [`jwt=${unregisteredToken}`])
                .send({ role: ROLES.OPERATIONS });

            expect(res.status).toBe(403);
        });
    });
});