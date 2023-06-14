import supertest from "supertest";

import { app } from "../index.js";
import { createNewUser, deleteCreatedUser, signInAsAdmin } from "./utils.js";

describe("PATCH /api/users UPDATE USER DETAILS", () => {
    let createdUser;
    const updateInfo = {
        firstName: "new first name",
        lastName: "new last name",
    };

    beforeAll(async () => {
        createdUser = await createNewUser(app);
    });

    it("should return 401 status code if no token is provided", async () => {
        const response = await supertest(app)
            .patch(`/api/users`)
            .send(updateInfo);

        expect(response.statusCode).toBe(401);
    });

    it("should return 401 status code if an invalid token is provided", async () => {
        const response = await supertest(app)
            .patch(`/api/users`)
            .set("Authorization", "Bearer invalid-token")
            .send(updateInfo);

        expect(response.statusCode).toBe(401);
    });

    it("should update user details when provided valid data", async () => {
        const response = await supertest(app)
            .patch(`/api/users`)
            .set("Authorization", `Bearer ${createdUser.token}`)
            .field("firstName", "new first name")
            .field("lastName", "new last name")
            .attach("avatar", "images/profile.jpeg");

        expect(response.statusCode).toBe(200);
    });

    it("should return 400 status code if firstName is less than 3 characters", async () => {
        const response = await supertest(app)
            .patch(`/api/users`)
            .set("Authorization", `Bearer ${createdUser.token}`)
            .send({
                firstName: "ab",
                lastName: "new last name",
            });

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if firstName is more than 25 characters", async () => {
        const response = await supertest(app)
            .patch(`/api/users`)
            .set("Authorization", `Bearer ${createdUser.token}`)
            .send({
                firstName: "new name new name new name new name",
                lastName: "new last name",
            });

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if lastName is less than 2 characters", async () => {
        const response = await supertest(app)
            .patch(`/api/users`)
            .set("Authorization", `Bearer ${createdUser.token}`)
            .send({
                firstName: "new first name",
                lastName: "a",
            });

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if lastName is more than 25 characters", async () => {
        const response = await supertest(app)
            .patch(`/api/users`)
            .set("Authorization", `Bearer ${createdUser.token}`)
            .send({
                firstName: "new first name",
                lastName:
                    "new last name new last name new last name new last name",
            });

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if avatar is not an image", async () => {
        const response = await supertest(app)
            .patch(`/api/users`)
            .set("Authorization", `Bearer ${createdUser.token}`)
            .field("firstName", "new first name")
            .field("lastName", "new last name")
            .attach("avatar", "images/not-image.txt");

        expect(response.statusCode).toBe(400);
    });

    afterAll(async () => {
        const adminToken = await signInAsAdmin(app);
        await deleteCreatedUser(app, createdUser.id, adminToken);
    });
});

describe("PATCH /api/users/password RESET PASSWORD", () => {
    let createdUser;

    beforeAll(async () => {
        createdUser = await createNewUser(app);
    });

    it("should reset password when provided valid data", async () => {
        const response = await supertest(app)
            .patch(`/api/users/password`)
            .set("Authorization", `Bearer ${createdUser.token}`)
            .send({
                currentPassword: "prat123!",
                newPassword: "prat12345!",
            });

        expect(response.statusCode).toBe(200);
    });

    it("should return 400 status code if the currentPassword is not provided", async () => {
        const response = await supertest(app)
            .patch(`/api/users/password`)
            .set("Authorization", `Bearer ${createdUser.token}`)
            .send({
                newPassword: "prat12345!",
            });

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if the currentPassword is incorrect", async () => {
        const response = await supertest(app)
            .patch(`/api/users/password`)
            .set("Authorization", `Bearer ${createdUser.token}`)
            .send({
                currentPassword: "password",
                newPassword: "prat12345!",
            });

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if the newPassword is not provided", async () => {
        const response = await supertest(app)
            .patch(`/api/users/password`)
            .set("Authorization", `Bearer ${createdUser.token}`)
            .send({
                currentPassword: "password",
            });

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if the newPassword is invalid (less than 7 characters long)", async () => {
        const response = await supertest(app)
            .patch(`/api/users/password`)
            .set("Authorization", `Bearer ${createdUser.token}`)
            .send({
                currentPassword: "password",
                newPassword: "123",
            });

        expect(response.statusCode).toBe(400);
    });

    afterAll(async () => {
        const adminToken = await signInAsAdmin(app);
        await deleteCreatedUser(app, createdUser.id, adminToken);
    });
});
