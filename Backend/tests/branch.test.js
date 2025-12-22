import request from "supertest";
import app from "../src/index.js";
import User from "../src/models/User.js";
import Branch from "../src/models/Branch.js";
import { ROLES } from "../src/utils/constants.js";
import jwt from "jsonwebtoken";

describe("Branch Endpoints", () => {
    let masterToken;

    beforeEach(async () => {
        await User.deleteMany({});
        await Branch.deleteMany({});

        const master = await User.create({
            name: "Master", email: "master@example.com", password: "123456",
            role: ROLES.MASTER, emailVerified: true,
        });
        masterToken = jwt.sign({ id: master._id, role: master.role }, process.env.JWT_SECRET);
    });

    it("MASTER puede crear sucursal", async () => {
        const res = await request(app)
            .post("/api/branches")
            .set("Cookie", [`jwt=${masterToken}`])
            .send({
                name: "Sucursal Centro",
                code: "CENTRO",
                address: "Av. Principal 123",
                city: "Ciudad",
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.branch.name).toBe("Sucursal Centro");

        const branch = await Branch.findOne({ code: "CENTRO" });
        expect(branch).toBeTruthy();
    });

    it("todos autenticados pueden ver lista de sucursales", async () => {
        await Branch.create({ name: "Sucursal Norte", code: "NORTE" });

        const res = await request(app)
            .get("/api/branches")
            .set("Cookie", [`jwt=${masterToken}`]);

        expect(res.status).toBe(200);
        expect(res.body.data.branches.length).toBe(1);
    });
});