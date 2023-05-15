import supertest from "supertest";

import { app } from "../../index.js";

describe("PATCH /api/users UPDATE USER DETAILS", () => {
    let token;

    beforeAll(async () => {
        // sign in and get a JWT token to use in the tests
        const response = await supertest(app).post("/api/auth/signin").send({
            email: "pratikbhandari99999@gmail.com",
            password: "prat123!",
        });

        token = response.body.user.token;
    });

    it("should return 401 status code if no token is provided", async () => {
        const response = await supertest(app).patch(`/api/users`).send({
            firstName: "john",
            lastName: "doe",
        });

        expect(response.statusCode).toBe(401);
    });

    it("should return 401 status code if an invalid token is provided", async () => {
        const response = await supertest(app)
            .patch(`/api/users`)
            .set("Authorization", "Bearer invalid-token")
            .send({
                firstName: "john",
                lastName: "doe",
            });

        expect(response.statusCode).toBe(401);
    });

    it("should update user details when provided valid data", async () => {
        const response = await supertest(app)
            .patch(`/api/users`)
            .set("Authorization", `Bearer ${token}`)
            .field("firstName", "john")
            .field("lastName", "doe")
            .attach("avatar", "images/profile.jpeg");

        expect(response.statusCode).toBe(200);
    });

    it("should return 400 status code if firstName is less than 3 characters", async () => {
        const response = await supertest(app)
            .patch(`/api/users`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                firstName: "jo",
                lastName: "doe",
            });

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if firstName is more than 25 characters", async () => {
        const response = await supertest(app)
            .patch(`/api/users`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                firstName:
                    "johnjohnjohnjohnjohnjohnjohnjohnjohnjohnjohnjohnjohnjohnjohn",
                lastName: "doe",
            });

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if lastName is less than 2 characters", async () => {
        const response = await supertest(app)
            .patch(`/api/users`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                firstName: "john",
                lastName: "d",
            });

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if lastName is more than 25 characters", async () => {
        const response = await supertest(app)
            .patch(`/api/users`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                firstName: "john",
                lastName:
                    "doedoedoedoedoedoedoedoedoedoedoedoedoedoedoedoedoedoedoedoe",
            });

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if avatar is not an image", async () => {
        const response = await supertest(app)
            .patch(`/api/users`)
            .set("Authorization", `Bearer ${token}`)
            .field("firstName", "john")
            .field("lastName", "doe")
            .attach("avatar", "images/not-image.txt");

        expect(response.statusCode).toBe(400);
    });

    // it("should return 400 status code if avatar is larger than 3 mb", async () => {
    //     const response = await supertest(app)
    //         .patch(`/api/users`)
    //         .set("Authorization", `Bearer ${token}`)
    //         .field("firstName", "john")
    //         .field("lastName", "doe")
    //         .attach("avatar", "images/large-image.jpg");

    //     expect(response.statusCode).toBe(400);
    // });
});

describe("PATCH /api/users/password RESET PASSWORD", () => {
    let token;

    beforeAll(async () => {
        // sign in and get a JWT token to use in the tests
        const response = await supertest(app).post("/api/auth/signin").send({
            email: "johndoe@gmail.com",
            password: "prat12345!",
        });

        token = response.body.user.token;
    });

    // it("should reset password when provided valid data", async () => {
    //     const response = await supertest(app)
    //         .patch(`/api/users/password`)
    //         .set("Authorization", `Bearer ${token}`)
    //         .send({
    //             currentPassword: "prat123!",
    //             newPassword: "prat12345!",
    //         });

    //     expect(response.statusCode).toBe(200);
    // });

    it("should return 400 status code if the currentPassword is not provided", async () => {
        const response = await supertest(app)
            .patch(`/api/users/password`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                newPassword: "prat12345!",
            });

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if the currentPassword is incorrect", async () => {
        const response = await supertest(app)
            .patch(`/api/users/password`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                currentPassword: "password",
                newPassword: "prat12345!",
            });

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if the newPassword is not provided", async () => {
        const response = await supertest(app)
            .patch(`/api/users/password`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                currentPassword: "password",
            });

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if the newPassword is invalid (less than 7 characters long)", async () => {
        const response = await supertest(app)
            .patch(`/api/users/password`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                currentPassword: "password",
                newPassword: "123",
            });

        expect(response.statusCode).toBe(400);
    });
});
