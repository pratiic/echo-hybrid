import supertest from "supertest";

import { app } from "../index.js";
import { createNewUser, deleteCreatedUser } from "./utils.js";

describe("GET /api/accounts/verification CREATE ACCOUNT VERIFICATION", () => {
    let unverifiedUser, verifiedUser;

    beforeAll(async () => {
        unverifiedUser = await createNewUser(app, false, false, false);
        verifiedUser = await createNewUser(app);
    });

    it("should create an account verification if the user has not already been verified", async () => {
        const response = await supertest(app)
            .get(`/api/accounts/verification`)
            .set("Authorization", `Bearer ${unverifiedUser.token}`);

        expect(response.statusCode).toBe(200);
    });

    it("should return 400 status code if the user is already verified", async () => {
        const response = await supertest(app)
            .get(`/api/accounts/verification`)
            .set("Authorization", `Bearer ${verifiedUser.token}`);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("the account is already verified");
    });

    afterAll(async () => {
        await deleteCreatedUser(app, unverifiedUser.id);
        await deleteCreatedUser(app, verifiedUser.id);
    });
});

describe("POST /api/accounts/verification VERIFY ACCOUNT", () => {
    let createdUser;

    beforeAll(async () => {
        createdUser = await createNewUser(app, false, false, false);
    });

    // it("should verify the account of the user if the verification code is correct", async () => {
    //     const response = await supertest(app)
    //         .post(`/api/accounts/verification/?code=sO2ZXFzF`)
    //         .set("Authorization", `Bearer ${createdUser.token}`);

    //     expect(response.statusCode).toBe(200);
    // });

    it("should return 400 status code if the account is already verified", async () => {
        const verifiedUser = await createNewUser(app);

        const response = await supertest(app)
            .post(`/api/accounts/verification/?code=sO2ZXFzF`)
            .set("Authorization", `Bearer ${verifiedUser.token}`);

        await deleteCreatedUser(app, verifiedUser.id);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("the user is already verified");
    });

    it("should return 400 status code if the code is not provided", async () => {
        const response = await supertest(app)
            .post(`/api/accounts/verification/`)
            .set("Authorization", `Bearer ${createdUser.token}`);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("provide a verification code");
    });

    it("should return 400 status code if the code is incorrect", async () => {
        const response = await supertest(app)
            .post(`/api/accounts/verification/?code=incorrect`)
            .set("Authorization", `Bearer ${createdUser.token}`);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("the verification code is incorrect");
    });

    afterAll(async () => {
        await deleteCreatedUser(app, createdUser.id);
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
        expect(response.body.error).toBe("email is required");
    });

    it("should return 404 status code if the user does not exist", async () => {
        const response = await supertest(app)
            .post(`/api/accounts/recovery`)
            .send({
                email: "test@gmail.com",
            });

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("user not found");
    });

    afterAll(async () => {
        await deleteCreatedUser(app, createdUser.id);
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
            .send({});

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "provide the email to the account to be recovered"
        );
    });

    it("should return 400 status code if the code is not provided", async () => {
        const response = await supertest(app)
            .patch(`/api/accounts/recovery`)
            .send({
                email: createdUser.email,
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "you need to provide the recovery code"
        );
    });

    it("should return 400 status code if the password is not provided", async () => {
        const response = await supertest(app)
            .patch(`/api/accounts/recovery`)
            .send({
                email: createdUser.email,
                code: "9Ujt1k0f",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("password cannot be empty");
    });

    it("should return 400 status code if the password is less than 7 characters", async () => {
        const response = await supertest(app)
            .patch(`/api/accounts/recovery`)
            .send({
                email: createdUser.email,
                code: "9Ujt1k0f",
                password: "123",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "password must be atleast 7 characters long"
        );
    });

    it("should return 404 status code if the user does not exist", async () => {
        const response = await supertest(app)
            .patch(`/api/accounts/recovery`)
            .send({
                email: "test@gmail.com",
                code: "incorrect-code",
                password: "prat123!",
            });

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("user not found");
    });

    it("should return 400 status code if the code is incorrect", async () => {
        const response = await supertest(app)
            .patch(`/api/accounts/recovery`)
            .send({
                email: createdUser.email,
                code: "incorrect-code",
                password: "prat123!",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("the verification code is incorrect");
    });

    afterAll(async () => {
        await deleteCreatedUser(app, createdUser.id);
    });
});
