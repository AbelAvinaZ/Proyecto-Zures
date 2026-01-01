import request from "supertest";
import app from "../src/index.js";
import User from "../src/models/User.js";
import Workspace from "../src/models/Workspace.js";
import Board from "../src/models/Board.js";
import { ROLES } from "../src/utils/constants.js";
import jwt from "jsonwebtoken";

describe("Board Endpoints", () => {
    let masterUser;
    let directorUser;
    let operationsUser;
    let unregisteredUser;
    let masterToken;
    let directorToken;
    let operationsToken;
    let unregisteredToken;
    let publicWorkspace;
    let privateWorkspace;

    beforeEach(async () => {
        await User.deleteMany({});
        await Workspace.deleteMany({});
        await Board.deleteMany({});

        masterUser = await User.create({
            name: "Master",
            email: "master@board.com",
            password: "123456",
            role: ROLES.MASTER,
            emailVerified: true,
        });

        directorUser = await User.create({
            name: "Director",
            email: "director@board.com",
            password: "123456",
            role: ROLES.AREA_DIRECTOR,
            emailVerified: true,
        });

        operationsUser = await User.create({
            name: "Ops",
            email: "ops@board.com",
            password: "123456",
            role: ROLES.OPERATIONS,
            department: "OPERATIONS",
            emailVerified: true,
        });

        unregisteredUser = await User.create({
            name: "Unreg",
            email: "unreg@board.com",
            password: "123456",
            role: ROLES.UNREGISTERED,
            emailVerified: true,
        });

        publicWorkspace = await Workspace.create({
            name: "Workspace Público",
            createdBy: masterUser._id,
            isPrivate: false,
        });

        privateWorkspace = await Workspace.create({
            name: "Workspace Privado",
            createdBy: operationsUser._id,
            isPrivate: true,
            invitedUsers: [directorUser._id],
        });

        const generateToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);

        masterToken = generateToken(masterUser);
        directorToken = generateToken(directorUser);
        operationsToken = generateToken(operationsUser);
        unregisteredToken = generateToken(unregisteredUser);
    });

    describe("POST /api/boards - Crear board", () => {
        it("MASTER puede crear board en workspace público", async () => {
            const res = await request(app)
                .post("/api/boards")
                .set("Cookie", [`jwt=${masterToken}`])
                .send({
                    name: "Tablero Maestro",
                    description: "Test board",
                    workspaceId: publicWorkspace._id.toString(),
                    isPrivate: false,
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
        });

        it("OPERATIONS puede crear board privado en su workspace", async () => {
            const res = await request(app)
                .post("/api/boards")
                .set("Cookie", [`jwt=${operationsToken}`])
                .send({
                    name: "Mi Tablero Privado",
                    workspaceId: privateWorkspace._id.toString(),
                    isPrivate: true,
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
        });

        it("UNREGISTERED recibe 403 al intentar crear", async () => {
            const res = await request(app)
                .post("/api/boards")
                .set("Cookie", [`jwt=${unregisteredToken}`])
                .send({
                    name: "No permitido",
                    workspaceId: publicWorkspace._id.toString(),
                });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain("no registrado");
        });

        it("OPERATIONS no puede crear en workspace sin acceso", async () => {
            const res = await request(app)
                .post("/api/boards")
                .set("Cookie", [`jwt=${operationsToken}`])
                .send({
                    name: "Invalido",
                    workspaceId: publicWorkspace._id.toString(),
                });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain("permiso");
        });
    });

    describe("GET /api/boards/workspace/:workspaceId - Lista de boards", () => {
        let publicBoard;
        let privateBoard;

        beforeEach(async () => {
            publicBoard = await Board.create({
                name: "Público Board",
                workspaceId: publicWorkspace._id,
                createdBy: masterUser._id,
                isPrivate: false,
            });

            privateBoard = await Board.create({
                name: "Privado Board",
                workspaceId: privateWorkspace._id,
                createdBy: operationsUser._id,
                isPrivate: true,
                invitedUsers: [directorUser._id],
            });
        });

        it("MASTER ve todos los boards", async () => {
            const res = await request(app)
                .get(`/api/boards/workspace/${publicWorkspace._id}`)
                .set("Cookie", [`jwt=${masterToken}`]);

            expect(res.status).toBe(200);
            expect(res.body.data.boards.length).toBeGreaterThan(0);
        });

        it("AREA_DIRECTOR ve boards públicos + invitados privados", async () => {
            const res = await request(app)
                .get(`/api/boards/workspace/${privateWorkspace._id}`)
                .set("Cookie", [`jwt=${directorToken}`]);

            expect(res.status).toBe(200);
            expect(res.body.data.boards.length).toBe(1);
        });

        it("OPERATIONS ve boards públicos + sus privados", async () => {
            const res = await request(app)
                .get(`/api/boards/workspace/${privateWorkspace._id}`)
                .set("Cookie", [`jwt=${operationsToken}`]);

            expect(res.status).toBe(200);
            expect(res.body.data.boards.length).toBe(1);
        });

        it("UNREGISTERED recibe 403", async () => {
            const res = await request(app)
                .get(`/api/boards/workspace/${publicWorkspace._id}`)
                .set("Cookie", [`jwt=${unregisteredToken}`]);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain("no registrado");
        });
    });

    describe("POST /api/boards/:id/invite - Invitar", () => {
        let board;

        beforeEach(async () => {
            board = await Board.create({
                name: "Para invitar",
                workspaceId: publicWorkspace._id,
                createdBy: masterUser._id,
                isPrivate: true,
            });
        });

        it("MASTER puede invitar", async () => {
            const res = await request(app)
                .post(`/api/boards/${board._id}/invite`)
                .set("Cookie", [`jwt=${masterToken}`])
                .send({ userId: operationsUser._id.toString() });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            const updated = await Board.findById(board._id);
            expect(updated.invitedUsers.map(id => id.toString())).toContain(operationsUser._id.toString());
        });

        it("UNREGISTERED recibe 403 al intentar invitar", async () => {
            const res = await request(app)
                .post(`/api/boards/${board._id}/invite`)
                .set("Cookie", [`jwt=${unregisteredToken}`])
                .send({ userId: directorUser._id.toString() });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });
    });

    describe("Columnas e Items", () => {
        let board;

        beforeEach(async () => {
            board = await Board.create({
                name: "Test Board",
                workspaceId: publicWorkspace._id,
                createdBy: masterUser._id,
                isPrivate: false,
            });
        });

        it("creator puede agregar columna", async () => {
            const res = await request(app)
                .post(`/api/boards/${board._id}/columns`)
                .set("Cookie", [`jwt=${masterToken}`])
                .send({
                    name: "Estado",
                    type: "STATUS",
                    order: 1,
                    config: { options: ["Pendiente", "En progreso", "Completado"] },
                });

            expect(res.status).toBe(201);
            const updated = await Board.findById(board._id);
            expect(updated.columns.length).toBe(1);
        });

        it("puede crear item", async () => {
            const res = await request(app)
                .post(`/api/boards/${board._id}/items`)
                .set("Cookie", [`jwt=${masterToken}`])
                .send({
                    values: { "0": "Pendiente" },
                });

            expect(res.status).toBe(201);
        });
    });

    describe("Charts", () => {
        let board;

        beforeEach(async () => {
            board = await Board.create({
                name: "Test Charts",
                workspaceId: publicWorkspace._id,
                createdBy: masterUser._id,
                isPrivate: false,
                columns: [{
                    name: "Status",
                    type: "STATUS",
                    order: 1,
                    config: { options: ["Pendiente", "En progreso", "Completado"] },
                }],
            });
        });

        it("creator puede agregar chart", async () => {
            const res = await request(app)
                .post(`/api/boards/${board._id}/charts`)
                .set("Cookie", [`jwt=${masterToken}`])
                .send({
                    title: "Distribución por Status",
                    type: "pie",
                    dataSource: {
                        columnId: "0",
                        aggregation: "count",
                    },
                });

            expect(res.status).toBe(201);
            const updated = await Board.findById(board._id);
            expect(updated.charts.length).toBe(1);
        });

        it("no creator no puede agregar chart", async () => {
            const res = await request(app)
                .post(`/api/boards/${board._id}/charts`)
                .set("Cookie", [`jwt=${operationsToken}`])
                .send({
                    title: "No permitido",
                    type: "bar",
                    dataSource: { columnId: "0" },
                });

            expect(res.status).toBe(403);
        });
    });
});