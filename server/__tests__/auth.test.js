import supertest from "supertest";

import { app } from "../index.js";
import { signInAsAdmin } from "./utils.js";

describe("POST /api/auth/signin", () => {
    it("should sign a user in with valid data", async () => {
        const response = await supertest(app).post("/api/auth/signin").send({
            email: "pratikbhandari99999@gmail.com",
            password: "prat123!",
        });
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("user");
    });

    it("should return 400 with an empty object", async () => {
        const response = await supertest(app).post("/api/auth/signin").send({});
        expect(response.statusCode).toBe(400);
    });

    it("should return 400 with email but no password", async () => {
        const response = await supertest(app)
            .post("/api/auth/signin")
            .send({ email: "john.doe@gmail.com" });
        expect(response.statusCode).toBe(400);
    });

    it("should return 400 with password but no email", async () => {
        const response = await supertest(app)
            .post("/api/auth/signin")
            .send({ password: "password123" });
        expect(response.statusCode).toBe(400);
    });

    it("should return 400 with password having less than 7 characters", async () => {
        const response = await supertest(app)
            .post("/api/auth/signin")
            .send({ email: "john.doe@gmail.com", password: "123" });
        expect(response.statusCode).toBe(400);
    });

    it("should return 400 with invalid email", async () => {
        const response = await supertest(app)
            .post("/api/auth/signup")
            .send({ email: "invalidemail", password: "password123" });
        expect(response.statusCode).toBe(400);
    });

    it("should return 400 with a user that does not exist", async () => {
        const response = await supertest(app)
            .post("/api/auth/signin")
            .send({ email: "test@gmail.com", password: "test123!" });
        expect(response.statusCode).toBe(400);
    });
});

describe("POST /api/auth/signup", () => {
    it("should create a new user with valid data", async () => {
        const response = await supertest(app).post("/api/auth/signup").send({
            firstName: "Joe",
            lastName: "doe",
            email: "joe.doe@example.com",
            password: "password",
        });
        expect(response.statusCode).toBe(201);

        // sign in as admin and delete the created user
        const adminToken = await signInAsAdmin(app);

        await supertest(app)
            .delete(`/api/users/${response.body.user.id}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                firstName: "Joe",
                lastName: "doe",
                email: "joe.doe@example.com",
                password: "password",
            });
    });

    it("should return a 400 status code with an empty object", async () => {
        const response = await supertest(app).post("/api/auth/signup").send({});
        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if firstName is not provided", async () => {
        const response = await supertest(app).post("/api/auth/signup").send({
            lastName: "doe",
            email: "john.doe@example.com",
            password: "password123",
        });
        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if firstName is less than 3 characters", async () => {
        const response = await supertest(app).post("/api/auth/signup").send({
            firstName: "Jo",
            lastName: "doe",
            email: "john.doe@example.com",
            password: "password123",
        });
        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if firstName is more than 25 characters", async () => {
        const response = await supertest(app).post("/api/auth/signup").send({
            firstName:
                "johnjohnjohnjohnjohnjohnjohnjohnjohnjohnjohnjohnjohnjohnjohn",
            lastName: "doe",
            email: "john.doe@example.com",
            password: "password123",
        });
        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if lastName is not provided", async () => {
        const response = await supertest(app).post("/api/auth/signup").send({
            firstName: "john",
            email: "john.doe@example.com",
            password: "password123",
        });
        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if lastName is less than 2 characters", async () => {
        const response = await supertest(app).post("/api/auth/signup").send({
            firstName: "john",
            lastName: "D",
            email: "john.doe@example.com",
            password: "password123",
        });
        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if lastName is more than 25 characters", async () => {
        const response = await supertest(app).post("/api/auth/signup").send({
            firstName: "john",
            lastName:
                "doedoedoedoedoedoedoedoedoedoedoedoedoedoedoedoedoedoedoedoe",
            email: "john.doe@example.com",
            password: "password123",
        });
        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if email is not provided", async () => {
        const response = await supertest(app).post("/api/auth/signup").send({
            firstName: "john",
            lastName: "doe",
            password: "password123",
        });
        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if password is not provided", async () => {
        const response = await supertest(app).post("/api/auth/signup").send({
            firstName: "john",
            lastName: "doe",
            email: "john.doe@example.com",
        });
        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if email is invalid", async () => {
        const response = await supertest(app).post("/api/auth/signup").send({
            firstName: "john",
            lastName: "doe",
            email: "notanemail",
            password: "password123",
        });

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if password is too short", async () => {
        const response = await supertest(app).post("/api/auth/signup").send({
            firstName: "john",
            lastName: "doe",
            email: "test@example.com",
            password: "123",
        });

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if the email belongs to an existing user", async () => {
        const response = await supertest(app).post("/api/auth/signup").send({
            firstName: "pratik",
            lastName: "bhandari",
            email: "pratikbhandari99999@gmail.com",
            password: "prat123!",
        });

        expect(response.statusCode).toBe(400);
    });
});
