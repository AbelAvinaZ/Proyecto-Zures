import request from "supertest";
import app from "../src/index.js";
import User from "../src/models/User.js";

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
        // Registrar primero
        await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User",
                email: "duplicate@example.com",
                password: "123456",
            });

        // Intentar duplicado
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
        // Registrar usuario
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

        expect(res.status).toBe(302); // redirect

        const verifiedUser = await User.findOne({ email: "verify@example.com" });
        expect(verifiedUser.emailVerified).toBe(true);
        expect(verifiedUser.emailVerificationToken).toBeUndefined();
    });

    it("debe hacer login exitoso", async () => {
        // Registrar usuario
        await request(app)
            .post("/api/auth/register")
            .send({
                name: "Login User",
                email: "login@example.com",
                password: "123456",
            });

        // Verificar manualmente (para evitar dependencia del mail)
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
});