import request from "supertest";
import app from "../src/index.js";
import User from "../src/models/User.js";
import Branch from "../src/models/Branch.js";
import BranchOffice from "../src/models/BranchOffice.js";
import Employee from "../src/models/Employee.js";
import { ROLES } from "../src/utils/constants.js";
import jwt from "jsonwebtoken";

describe("Employee Endpoints", () => {
    let masterUser;
    let directorUser;
    let operationsUser;
    let hrUser;
    let masterToken;
    let directorToken;
    let operationsToken;
    let hrToken;
    let testBranch;
    let otherBranch;
    let testBranchOffice;
    let otherBranchOffice;

    beforeEach(async () => {
        await User.deleteMany({});
        await Branch.deleteMany({});
        await BranchOffice.deleteMany({});
        await Employee.deleteMany({});

        // Crear usuarios
        masterUser = await User.create({
            name: "Master",
            email: "master@emp.com",
            password: "123456",
            role: ROLES.MASTER,
            emailVerified: true,
        });

        directorUser = await User.create({
            name: "Director",
            email: "director@emp.com",
            password: "123456",
            role: ROLES.AREA_DIRECTOR,
            emailVerified: true,
        });

        operationsUser = await User.create({
            name: "Ops",
            email: "ops@emp.com",
            password: "123456",
            role: ROLES.OPERATIONS,
            emailVerified: true,
        });

        hrUser = await User.create({
            name: "HR",
            email: "hr@emp.com",
            password: "123456",
            role: ROLES.HR,
            emailVerified: true,
        });

        // Crear Branches
        testBranch = await Branch.create({ name: "Puebla", code: "PUE" });
        otherBranch = await Branch.create({ name: "CDMX", code: "CDMX" });

        // Crear BranchOffices
        testBranchOffice = await BranchOffice.create({
            name: "ADO Puebla",
            code: "ADO-PUE",
            branchId: testBranch._id,
        });

        otherBranchOffice = await BranchOffice.create({
            name: "ADO CDMX",
            code: "ADO-CDMX",
            branchId: otherBranch._id,
        });

        // Asignar branchId a usuarios department
        operationsUser.branchId = testBranch._id;
        await operationsUser.save();

        hrUser.branchId = testBranch._id;
        await hrUser.save();

        // Tokens
        const generateToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);

        masterToken = generateToken(masterUser);
        directorToken = generateToken(directorUser);
        operationsToken = generateToken(operationsUser);
        hrToken = generateToken(hrUser);
    });

    describe("POST /api/employees - Crear empleado", () => {
        it("MASTER puede crear empleado", async () => {
            const res = await request(app)
                .post("/api/employees")
                .set("Cookie", [`jwt=${masterToken}`])
                .send({
                    name: "Juan",
                    lastName: "Pérez",
                    branchOfficeId: testBranchOffice._id.toString(),
                    hireDate: "2024-01-01",
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
        });

        it("OPERATIONS puede crear en su branch", async () => {
            const res = await request(app)
                .post("/api/employees")
                .set("Cookie", [`jwt=${operationsToken}`])
                .send({
                    name: "Ana",
                    lastName: "Gómez",
                    branchOfficeId: testBranchOffice._id.toString(),
                    hireDate: "2024-02-01",
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
        });

        it("OPERATIONS NO puede crear en otra branch", async () => {
            const res = await request(app)
                .post("/api/employees")
                .set("Cookie", [`jwt=${operationsToken}`])
                .send({
                    name: "Invalido",
                    lastName: "Branch",
                    branchOfficeId: otherBranchOffice._id.toString(),
                    hireDate: "2024-04-01",
                });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });
    });

    describe("GET /api/employees - Lista", () => {
        it("Todos ven lista básica", async () => {
            await Employee.create({
                name: "Carlos",
                lastName: "López",
                branchOfficeId: testBranchOffice._id,
                hireDate: "2024-01-01",
            });

            const res = await request(app)
                .get("/api/employees")
                .set("Cookie", [`jwt=${operationsToken}`]);

            expect(res.status).toBe(200);
            expect(res.body.data.employees.length).toBe(1);
        });
    });

    describe("PATCH /api/employees/:id - Update y deactivate", () => {
        let testEmployeeInMyBranch;
        let testEmployeeInOtherBranch;

        beforeEach(async () => {
            testEmployeeInMyBranch = await Employee.create({
                name: "Test",
                lastName: "MyBranch",
                branchOfficeId: testBranchOffice._id,
                hireDate: "2024-01-01",
            });

            testEmployeeInOtherBranch = await Employee.create({
                name: "Test",
                lastName: "OtherBranch",
                branchOfficeId: otherBranchOffice._id,
                hireDate: "2024-01-01",
            });
        });

        it("OPERATIONS puede actualizar empleado en su branch", async () => {
            const res = await request(app)
                .patch(`/api/employees/${testEmployeeInMyBranch._id}`)
                .set("Cookie", [`jwt=${operationsToken}`])
                .send({ phone: "1234567890" });

            expect(res.status).toBe(200);
        });

        it("OPERATIONS NO puede actualizar empleado en otra branch", async () => {
            const res = await request(app)
                .patch(`/api/employees/${testEmployeeInOtherBranch._id}`)
                .set("Cookie", [`jwt=${operationsToken}`])
                .send({
                    phone: "5551234567", 
                });

            expect(res.status).toBe(403); 
            expect(res.body.success).toBe(false);
        });

        it("MASTER puede desactivar cualquier empleado", async () => {
            const res = await request(app)
                .patch(`/api/employees/${testEmployeeInMyBranch._id}/deactivate`)
                .set("Cookie", [`jwt=${masterToken}`]);

            expect(res.status).toBe(200);
            const emp = await Employee.findById(testEmployeeInMyBranch._id);
            expect(emp.employmentStatus).toBe("INACTIVO");
        });
    });
});