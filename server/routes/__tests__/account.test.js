import supertest from "supertest";

import { app } from "../../index.js";

describe("GET /api/accounts/verification CREATE ACCOUNT VERIFICATION", () => {
    let token;

    beforeAll(async () => {
        // sign in and get a JWT token to use in the tests
        const response = await supertest(app).post("/api/auth/signin").send({
            email: "johndoe@gmail.com",
            password: "prat123!",
        });

        token = response.body.user.token;
    });

    it("should create an account verification if the user has not already been verified", async () => {
        const response = await supertest(app)
            .get(`/api/accounts/verification`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
    });
});

describe("POST /api/accounts/verification VERIFY ACCOUNT", () => {
    let token;

    beforeAll(async () => {
        // sign in and get a JWT token to use in the tests
        const response = await supertest(app).post("/api/auth/signin").send({
            email: "johndoe@gmail.com",
            password: "prat123!",
        });

        token = response.body.user.token;
    });

    // it("should verify the account of the user if the verification code is correct", async () => {
    //     const response = await supertest(app)
    //         .post(`/api/accounts/verification/?code=sO2ZXFzF`)
    //         .set("Authorization", `Bearer ${token}`);

    //     expect(response.statusCode).toBe(200);
    // });

    it("should return 400 status code if the code is not provided", async () => {
        const response = await supertest(app)
            .post(`/api/accounts/verification/`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if the code is incorrect", async () => {
        const response = await supertest(app)
            .post(`/api/accounts/verification/?code=incorrect`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(400);
    });
});

describe("POST /api/accounts/recovery CREATE ACCOUNT RECOVERY", () => {
    it("should create an account recovery if valid data is provided", async () => {
        const response = await supertest(app)
            .post(`/api/accounts/recovery`)
            .send({
                email: "johndoe@gmail.com",
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
});

describe("PATCH /api/accounts/recovery RECOVER ACCOUNT", () => {
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
                email: "johndoe@gmail.com",
                password: "prat123!",
            });

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if the password is not provided", async () => {
        const response = await supertest(app)
            .patch(`/api/accounts/recovery`)
            .send({
                email: "johndoe@gmail.com",
                code: "9Ujt1k0f",
            });

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if the password is invalid (less than 7 characters)", async () => {
        const response = await supertest(app)
            .patch(`/api/accounts/recovery`)
            .send({
                email: "johndoe@gmail.com",
                code: "9Ujt1k0f",
                password: "123",
            });

        expect(response.statusCode).toBe(400);
    });
});
