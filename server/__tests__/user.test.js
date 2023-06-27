import supertest from "supertest";

import { app } from "../index.js";
import {
    createNewUser,
    deleteCreatedUser,
    signInAsDeliveryPersonnel,
} from "./utils.js";

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

    it("should update user details when provided valid data - USER", async () => {
        const response = await supertest(app)
            .patch(`/api/users`)
            .set("Authorization", `Bearer ${createdUser.token}`)
            .field("firstName", "new first name")
            .field("lastName", "new last name")
            .attach("avatar", "images/profile.jpeg");

        expect(response.statusCode).toBe(200);
    });

    it("should update user details when provided valid data - DELIVERY PERSONNEL", async () => {
        const response = await supertest(app)
            .patch(`/api/users`)
            .set("Authorization", `Bearer ${createdUser.token}`)
            .field("firstName", "new first name")
            .field("lastName", "new last name")
            .field("phone", "9810222399")
            .attach("avatar", "images/profile.jpeg");

        expect(response.statusCode).toBe(200);
    });

    it("should return 400 status code if firstName is less than 3 characters", async () => {
        const response = await supertest(app)
            .patch(`/api/users`)
            .set("Authorization", `Bearer ${createdUser.token}`)
            .send({
                firstName: "ab",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "first name must be atleast 3 characters long"
        );
    });

    it("should return 400 status code if firstName is more than 15 characters", async () => {
        const response = await supertest(app)
            .patch(`/api/users`)
            .set("Authorization", `Bearer ${createdUser.token}`)
            .send({
                firstName: "new name new name",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "first name cannot be more than 15 characters long"
        );
    });

    it("should return 400 status code if lastName is less than 2 characters", async () => {
        const response = await supertest(app)
            .patch(`/api/users`)
            .set("Authorization", `Bearer ${createdUser.token}`)
            .send({
                firstName: "first name",
                lastName: "a",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "last name must be atleast 2 characters long"
        );
    });

    it("should return 400 status code if lastName is more than 15 characters", async () => {
        const response = await supertest(app)
            .patch(`/api/users`)
            .set("Authorization", `Bearer ${createdUser.token}`)
            .send({
                firstName: "first name",
                lastName: "new last name new last name",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "last name cannot be more than 15 characters long"
        );
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

    it("should return 400 status code if the requesting user is delivery personnel and phone is less than 10 characters", async () => {
        const deliveryToken = await signInAsDeliveryPersonnel(app);

        const response = await supertest(app)
            .patch(`/api/users`)
            .set("Authorization", `Bearer ${deliveryToken}`)
            .field("firstName", "new first name")
            .field("lastName", "new last name")
            .field("phone", "981022239")
            .attach("avatar", "images/profile.jpeg");

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("phone must be 10 characters long");
    });

    it("should return 400 status code if the requesting user is delivery personnel and phone is more than 10 characters", async () => {
        const deliveryToken = await signInAsDeliveryPersonnel(app);

        const response = await supertest(app)
            .patch(`/api/users`)
            .set("Authorization", `Bearer ${deliveryToken}`)
            .field("firstName", "new first name")
            .field("lastName", "new last name")
            .field("phone", "98102223991")
            .attach("avatar", "images/profile.jpeg");

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("phone must be 10 characters long");
    });

    afterAll(async () => {
        await deleteCreatedUser(app, createdUser.id);
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
        expect(response.body.error).toBe("current password is required");
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
        expect(response.body.error).toBe("password is incorrect");
    });

    it("should return 400 status code if the newPassword is not provided", async () => {
        const response = await supertest(app)
            .patch(`/api/users/password`)
            .set("Authorization", `Bearer ${createdUser.token}`)
            .send({
                currentPassword: "prat123!",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("new password cannot be empty");
    });

    it("should return 400 status code if the newPassword is less than 7 characters long", async () => {
        const response = await supertest(app)
            .patch(`/api/users/password`)
            .set("Authorization", `Bearer ${createdUser.token}`)
            .send({
                currentPassword: "password",
                newPassword: "123",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "new password must be atleast 7 characters long"
        );
    });

    afterAll(async () => {
        await deleteCreatedUser(app, createdUser.id);
    });
});

describe("DELETE /api/users/avatar DELETE USER AVATAR", () => {
    let createdUser;

    beforeAll(async () => {
        createdUser = await createNewUser(app);
    });

    it("should return 400 status code if the requesting user has no avatar", async () => {
        const response = await supertest(app)
            .delete(`/api/users/avatar`)
            .set("Authorization", `Bearer ${createdUser.token}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("you have no avatar");
    });

    it("should return 400 status code if the requesting user has an avatar", async () => {
        await supertest(app)
            .patch(`/api/users`)
            .attach("avatar", "images/profile.jpeg")
            .set("Authorization", `Bearer ${createdUser.token}`);

        const response = await supertest(app)
            .delete(`/api/users/avatar`)
            .set("Authorization", `Bearer ${createdUser.token}`);

        expect(response.statusCode).toBe(200);
    });

    afterAll(async () => {
        await deleteCreatedUser(app, createdUser.id);
    });
});
