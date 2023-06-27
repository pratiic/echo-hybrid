import supertest from "supertest";

import { app } from "../index.js";
import { createNewUser, deleteCreatedUser } from "./utils.js";
import { getVerificationCode } from "../lib/verification.lib.js";

describe("POST /api/auth/signin", () => {
    it("should sign a user in with valid data", async () => {
        const createdUser = await createNewUser(app);

        const response = await supertest(app).post("/api/auth/signin").send({
            email: createdUser.email,
            password: "prat123!",
        });

        await deleteCreatedUser(app, createdUser.id);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("user");
    });

    it("should return 400 with an empty object", async () => {
        const response = await supertest(app).post("/api/auth/signin").send({});
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("email cannot be empty");
    });

    it("should return 400 with email but no password", async () => {
        const response = await supertest(app)
            .post("/api/auth/signin")
            .send({ email: "john.doe@gmail.com" });
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("email or password is invalid");
    });

    it("should return 400 with password but no email", async () => {
        const response = await supertest(app)
            .post("/api/auth/signin")
            .send({ password: "password123" });
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("email cannot be empty");
    });

    it("should return 400 with password having less than 7 characters", async () => {
        const response = await supertest(app)
            .post("/api/auth/signin")
            .send({ email: "john.doe@gmail.com", password: "123" });
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "password must be atleast 7 characters long"
        );
    });

    it("should return 400 with invalid email", async () => {
        const response = await supertest(app)
            .post("/api/auth/signin")
            .send({ email: "invalidemail", password: "password123" });
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("email must be valid");
    });

    it("should return 400 with a user that does not exist", async () => {
        const response = await supertest(app)
            .post("/api/auth/signin")
            .send({ email: "test@gmail.com", password: "test123!" });
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("email or password is invalid");
    });
});

describe("POST /api/auth/signup", () => {
    it("should create a new user with valid data", async () => {
        const response = await supertest(app)
            .post("/api/auth/signup")
            .send({
                firstName: "Joe",
                lastName: "doe",
                email: `joe.doe${getVerificationCode()}@example.com`,
                password: "password",
            });

        await deleteCreatedUser(app, response.body.user.id);

        expect(response.statusCode).toBe(201);
    });

    it("should return 400 status code if firstName is not provided", async () => {
        const response = await supertest(app).post("/api/auth/signup").send({});
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("first name cannot be empty");
    });

    it("should return 400 status code if firstName is less than 3 characters", async () => {
        const response = await supertest(app).post("/api/auth/signup").send({
            firstName: "Jo",
        });
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "first name must be atleast 3 characters long"
        );
    });

    it("should return 400 status code if firstName is more than 15 characters", async () => {
        const response = await supertest(app).post("/api/auth/signup").send({
            firstName: "johnjohnjohnjohnjohn",
        });
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "first name cannot be more than 15 characters long"
        );
    });

    it("should return 400 status code if lastName is not provided", async () => {
        const response = await supertest(app).post("/api/auth/signup").send({
            firstName: "john",
        });
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("last name cannot be empty");
    });

    it("should return 400 status code if lastName is less than 2 characters", async () => {
        const response = await supertest(app).post("/api/auth/signup").send({
            firstName: "john",
            lastName: "d",
        });
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "last name must be atleast 2 characters long"
        );
    });

    it("should return 400 status code if lastName is more than 15 characters", async () => {
        const response = await supertest(app).post("/api/auth/signup").send({
            firstName: "john",
            lastName: "doedoedoedoedoedoedoe",
        });
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "last name cannot be more than 15 characters long"
        );
    });

    it("should return 400 status code if email is not provided", async () => {
        const response = await supertest(app).post("/api/auth/signup").send({
            firstName: "john",
            lastName: "doe",
        });
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("email cannot be empty");
    });

    it("should return 400 status code if email is invalid", async () => {
        const response = await supertest(app).post("/api/auth/signup").send({
            firstName: "john",
            lastName: "doe",
            email: "notanemail",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("email must be valid");
    });

    it("should return 400 status code if password is not provided", async () => {
        const response = await supertest(app).post("/api/auth/signup").send({
            firstName: "john",
            lastName: "doe",
            email: "john.doe@example.com",
        });
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("password cannot be empty");
    });

    it("should return 400 status code if password is less than 7 characters", async () => {
        const response = await supertest(app).post("/api/auth/signup").send({
            firstName: "john",
            lastName: "doe",
            email: "test@example.com",
            password: "pass1",
        });
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "password must be atleast 7 characters long"
        );
    });

    it("should return 400 status code if the email belongs to an existing user", async () => {
        const response = await supertest(app).post("/api/auth/signup").send({
            firstName: "pratik",
            lastName: "bhandari",
            email: process.env.ADMIN_EMAIL,
            password: "prat123!",
        });
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("user with this email already exists");
    });
});
