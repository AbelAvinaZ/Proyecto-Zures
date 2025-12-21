import request from "supertest";
import app from "../src/index.js";
import User from "../src/models/User.js";
import { ROLES } from "../src/utils/constants.js";

describe("Auth Endpoints", () => {
    beforeEach(async () => {
        await User.deleteMany({});
    });

    it("debe registrar un usuario nuevo", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User",
                email: "test@example.com",
                password: "123456",
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toContain("verifica tu correo");

        const user = await User.findOne({ email: "test@example.com" });
        expect(user).toBeTruthy();
        expect(user.emailVerified).toBe(false);
        expect(user.emailVerificationToken).toBeDefined();
    });

    it("no debe permitir registro duplicado", async () => {
        await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User",
                email: "duplicate@example.com",
                password: "123456",
            });

        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test Duplicate",
                email: "duplicate@example.com",
                password: "123456",
            });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain("ya está registrado");
    });

    it("debe verificar email con token válido", async () => {
        await request(app)
            .post("/api/auth/register")
            .send({
                name: "Verify User",
                email: "verify@example.com",
                password: "123456",
            });

        const user = await User.findOne({ email: "verify@example.com" });
        const token = user.emailVerificationToken;

        const res = await request(app).get(`/api/auth/verify-email?token=${token}`);

        expect(res.status).toBe(302);

        const verifiedUser = await User.findOne({ email: "verify@example.com" });
        expect(verifiedUser.emailVerified).toBe(true);
        expect(verifiedUser.emailVerificationToken).toBeUndefined();
    });

    it("debe hacer login exitoso", async () => {
        await request(app)
            .post("/api/auth/register")
            .send({
                name: "Login User",
                email: "login@example.com",
                password: "123456",
            });

        const user = await User.findOne({ email: "login@example.com" });
        user.emailVerified = true;
        await user.save();

        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: "login@example.com",
                password: "123456",
                rememberMe: true,
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.user.email).toBe("login@example.com");
        expect(res.headers["set-cookie"]).toBeDefined();
    });

    it("el primer usuario verificado se convierte automáticamente en MASTER", async () => {
        await User.deleteMany({});

        await request(app)
            .post("/api/auth/register")
            .send({
                name: "Primer Usuario",
                email: "first@example.com",
                password: "123456",
            });

        const user = await User.findOne({ email: "first@example.com" });
        const token = user.emailVerificationToken;

        await request(app).get(`/api/auth/verify-email?token=${token}`);

        const verifiedUser = await User.findOne({ email: "first@example.com" });
        expect(verifiedUser.role).toBe(ROLES.MASTER);
    });

    it("usuarios posteriores quedan como UNREGISTERED", async () => {
        await User.deleteMany({});

        // Primer usuario (será MASTER)
        await request(app)
            .post("/api/auth/register")
            .send({
                name: "Master",
                email: "master2@example.com",
                password: "123456",
            });

        let user = await User.findOne({ email: "master2@example.com" });
        await request(app).get(`/api/auth/verify-email?token=${user.emailVerificationToken}`);

        // Segundo usuario
        await request(app)
            .post("/api/auth/register")
            .send({
                name: "Segundo",
                email: "second@example.com",
                password: "123456",
            });

        user = await User.findOne({ email: "second@example.com" });
        await request(app).get(`/api/auth/verify-email?token=${user.emailVerificationToken}`);

        const secondUser = await User.findOne({ email: "second@example.com" });
        expect(secondUser.role).toBe(ROLES.UNREGISTERED);
    });
});