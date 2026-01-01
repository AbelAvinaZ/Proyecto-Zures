import request from "supertest";
import app from "../src/index.js";
import User from "../src/models/User.js";
import Workspace from "../src/models/Workspace.js";
import { ROLES } from "../src/utils/constants.js";
import jwt from "jsonwebtoken";

describe("Workspace Endpoints", () => {
    let masterUser;
    let directorUser;
    let operationsUser;
    let unregisteredUser;
    let masterToken;
    let directorToken;
    let operationsToken;
    let unregisteredToken;

    beforeEach(async () => {
        await User.deleteMany({});
        await Workspace.deleteMany({});

        masterUser = await User.create({
            name: "Master", email: "master@ws.com", password: "123456",
            role: ROLES.MASTER, emailVerified: true,
        });

        directorUser = await User.create({
            name: "Director", email: "director@ws.com", password: "123456",
            role: ROLES.AREA_DIRECTOR, emailVerified: true,
        });

        operationsUser = await User.create({
            name: "Ops", email: "ops@ws.com", password: "123456",
            role: ROLES.OPERATIONS, department: "OPERATIONS", emailVerified: true,
        });

        unregisteredUser = await User.create({
            name: "Unreg", email: "unreg@ws.com", password: "123456",
            role: ROLES.UNREGISTERED, emailVerified: true,
        });

        const generateToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);

        masterToken = generateToken(masterUser);
        directorToken = generateToken(directorUser);
        operationsToken = generateToken(operationsUser);
        unregisteredToken = generateToken(unregisteredUser);
    });

    describe("POST /api/workspaces - Crear workspace", () => {
        it("MASTER puede crear workspace público", async () => {
            const res = await request(app)
                .post("/api/workspaces")
                .set("Cookie", [`jwt=${masterToken}`])
                .send({
                    name: "Workspace Público",
                    description: "Test público",
                    isPrivate: false,
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
        });

        it("OPERATIONS puede crear workspace privado", async () => {
            const res = await request(app)
                .post("/api/workspaces")
                .set("Cookie", [`jwt=${operationsToken}`])
                .send({
                    name: "Mi Workspace Privado",
                    isPrivate: true,
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
        });

        it("UNREGISTERED recibe 403 al intentar crear", async () => {
            const res = await request(app)
                .post("/api/workspaces")
                .set("Cookie", [`jwt=${unregisteredToken}`])
                .send({
                    name: "No permitido",
                });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain("no registrado");
        });
    });

    describe("GET /api/workspaces - Lista", () => {
        let publicWorkspace;
        let privateWorkspace;

        beforeEach(async () => {
            publicWorkspace = await Workspace.create({
                name: "Público",
                createdBy: masterUser._id,
                isPrivate: false,
            });

            privateWorkspace = await Workspace.create({
                name: "Privado Ops",
                createdBy: operationsUser._id,
                isPrivate: true,
                invitedUsers: [directorUser._id],
            });
        });

        it("MASTER ve todos", async () => {
            const res = await request(app)
                .get("/api/workspaces")
                .set("Cookie", [`jwt=${masterToken}`]);

            expect(res.status).toBe(200);
            expect(res.body.data.workspaces.length).toBe(2);
        });

        it("AREA_DIRECTOR ve todos públicos + invitados privados", async () => {
            const res = await request(app)
                .get("/api/workspaces")
                .set("Cookie", [`jwt=${directorToken}`]);

            expect(res.status).toBe(200);
            expect(res.body.data.workspaces.length).toBe(2);
        });

        it("OPERATIONS ve públicos + sus privados", async () => {
            const res = await request(app)
                .get("/api/workspaces")
                .set("Cookie", [`jwt=${operationsToken}`]);

            expect(res.status).toBe(200);
            expect(res.body.data.workspaces.length).toBe(2);
        });

        it("UNREGISTERED recibe 403", async () => {
            const res = await request(app)
                .get("/api/workspaces")
                .set("Cookie", [`jwt=${unregisteredToken}`]);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain("no registrado");
        });
    });

    describe("POST /api/workspaces/:id/invite - Invitar", () => {
        let workspace;

        beforeEach(async () => {
            workspace = await Workspace.create({
                name: "Para invitar",
                createdBy: masterUser._id,
                isPrivate: true,
            });
        });

        it("MASTER puede invitar", async () => {
            const res = await request(app)
                .post(`/api/workspaces/${workspace._id}/invite`)
                .set("Cookie", [`jwt=${masterToken}`])
                .send({ userId: operationsUser._id.toString() });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            const updated = await Workspace.findById(workspace._id);
            expect(updated.invitedUsers.map(id => id.toString())).toContain(operationsUser._id.toString());
        });

        it("UNREGISTERED recibe 403 al intentar invitar", async () => {
            const res = await request(app)
                .post(`/api/workspaces/${workspace._id}/invite`)
                .set("Cookie", [`jwt=${unregisteredToken}`])
                .send({ userId: directorUser._id.toString() });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });
    });
});