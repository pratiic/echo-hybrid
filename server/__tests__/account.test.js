import supertest from "supertest";

import { app } from "../index.js";
import { createNewUser, deleteCreatedUser, signInAsAdmin } from "./utils.js";

describe("GET /api/accounts/verification CREATE ACCOUNT VERIFICATION", () => {
    let createdUser, adminToken;

    beforeAll(async () => {
        // sign up and get a JWT token to use in the tests
        createdUser = await createNewUser(app);
    });

    it("should create an account verification if the user has not already been verified", async () => {
        const response = await supertest(app)
            .get(`/api/accounts/verification`)
            .set("Authorization", `Bearer ${createdUser.token}`);

        expect(response.statusCode).toBe(200);

        // sign in as admin to delete the created user
        adminToken = await signInAsAdmin(app);

        await deleteCreatedUser(app, createdUser.id, adminToken);
    });
});

describe("POST /api/accounts/verification VERIFY ACCOUNT", () => {
    let createdUser;

    beforeAll(async () => {
        // sign up and create an account verification record
        createdUser = await createNewUser(app);
    });

    // it("should verify the account of the user if the verification code is correct", async () => {
    //     const response = await supertest(app)
    //         .post(`/api/accounts/verification/?code=sO2ZXFzF`)
    //         .set("Authorization", `Bearer ${createdUser.token}`);

    //     expect(response.statusCode).toBe(200);
    // });

    it("should return 400 status code if the code is not provided", async () => {
        const response = await supertest(app)
            .post(`/api/accounts/verification/`)
            .set("Authorization", `Bearer ${createdUser.token}`);

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if the code is incorrect", async () => {
        const response = await supertest(app)
            .post(`/api/accounts/verification/?code=incorrect`)
            .set("Authorization", `Bearer ${createdUser.token}`);

        expect(response.statusCode).toBe(400);
    });

    afterAll(async () => {
        // sign in as admin and delete the created user
        const adminToken = await signInAsAdmin(app);

        deleteCreatedUser(app, createdUser.id, adminToken);
    });
});

describe("POST /api/accounts/recovery CREATE ACCOUNT RECOVERY", () => {
    let createdUser;

    beforeAll(async () => {
        createdUser = await createNewUser(app);
    });

    it("should create an account recovery if valid data is provided", async () => {
        const response = await supertest(app)
            .post(`/api/accounts/recovery`)
            .send({
                email: createdUser.email,
            });

        expect(response.statusCode).toBe(200);
    });

    it("should return 400 status code if the email is not provided", async () => {
        const response = await supertest(app).post(`/api/accounts/recovery`);

        expect(response.statusCode).toBe(400);
    });

    it("should return 404 status code if the email is invalid", async () => {
        const response = await supertest(app)
            .post(`/api/accounts/recovery`)
            .send({
                email: "invalidemail",
            });

        expect(response.statusCode).toBe(404);
    });

    afterAll(async () => {
        const adminToken = await signInAsAdmin(app);
        await deleteCreatedUser(app, createdUser.id, adminToken);
    });
});

describe("PATCH /api/accounts/recovery RECOVER ACCOUNT", () => {
    let createdUser;

    beforeAll(async () => {
        createdUser = await createNewUser(app);

        // create account recovery
        await supertest(app).post("/api/accounts/recovery").send({
            email: createdUser.email,
        });
    });

    // it("should recover the account of the user if provided valid data", async () => {
    //     const response = await supertest(app)
    //         .patch(`/api/accounts/recovery`)
    //         .send({
    //             email: "johndoe@gmail.com",
    //             code: "9Ujt1k0f",
    //             password: "prat123!",
    //         });

    //     expect(response.statusCode).toBe(200);
    // });

    it("should return 400 status code if the email is not provided", async () => {
        const response = await supertest(app)
            .patch(`/api/accounts/recovery`)
            .send({
                code: "9Ujt1k0f",
                password: "prat123!",
            });

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if the code is not provided", async () => {
        const response = await supertest(app)
            .patch(`/api/accounts/recovery`)
            .send({
                email: createdUser.email,
                password: "newpassword123",
            });

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if the password is not provided", async () => {
        const response = await supertest(app)
            .patch(`/api/accounts/recovery`)
            .send({
                email: createdUser.email,
                code: "9Ujt1k0f",
            });

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if the password is invalid (less than 7 characters)", async () => {
        const response = await supertest(app)
            .patch(`/api/accounts/recovery`)
            .send({
                email: createdUser.email,
                code: "9Ujt1k0f",
                password: "123",
            });

        expect(response.statusCode).toBe(400);
    });

    afterAll(async () => {
        const adminToken = await signInAsAdmin(app);
        await deleteCreatedUser(app, createdUser.id, adminToken);
    });
});
