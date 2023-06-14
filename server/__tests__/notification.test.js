import supertest from "supertest";

import { app } from "../index.js";
import { createNewUser, deleteCreatedUser, signInAsAdmin } from "./utils.js";

describe("POST /api/notifications SEND NOTIFICATION", () => {
    let userOne, userTwo, validNotification;

    beforeAll(async () => {
        [userOne, userTwo] = await Promise.all([
            createNewUser(app),
            createNewUser(app),
        ]);

        validNotification = {
            text: "this is a new notification",
            destinationId: userTwo.id,
            linkTo: "/test",
        };
    });

    it("should send a notification to a user if provided valid data", async () => {
        const response = await supertest(app)
            .post(`/api/notifications`)
            .set("Authorization", `Bearer ${userOne.token}`)
            .send(validNotification);

        expect(response.statusCode).toBe(201);
    });

    it("should return 400 status code if notification is sent to self", async () => {
        const response = await supertest(app)
            .post(`/api/notifications`)
            .set("Authorization", `Bearer ${userOne.token}`)
            .send({
                ...validNotification,
                destinationId: userOne.id,
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("notification cannot be sent to self");
    });

    it("should return 400 status code if text is not provided", async () => {
        const response = await supertest(app)
            .post(`/api/notifications`)
            .set("Authorization", `Bearer ${userOne.token}`)
            .send({
                ...validNotification,
                text: undefined,
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("text cannot be empty");
    });

    it("should return 400 status code if destinationId is not provided", async () => {
        const response = await supertest(app)
            .post(`/api/notifications`)
            .set("Authorization", `Bearer ${userOne.token}`)
            .send({
                ...validNotification,
                destinationId: undefined,
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("destinationId cannot be empty");
    });

    it("should return 400 status code if linkTo is invalid (not string)", async () => {
        const response = await supertest(app)
            .post(`/api/notifications`)
            .set("Authorization", `Bearer ${userOne.token}`)
            .send({
                ...validNotification,
                linkTo: 123,
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('"linkTo" must be a string');
    });

    afterAll(async () => {
        const adminToken = await signInAsAdmin(app);
        await deleteCreatedUser(app, userOne.id, adminToken);
        await deleteCreatedUser(app, userTwo.id, adminToken);
    });
});

describe("DELETE /api/notificatios/:notificationId DELETE NOTIFICATION", () => {
    let userOne, userTwo, notificationId;

    beforeAll(async () => {
        [userOne, userTwo] = await Promise.all([
            createNewUser(app),
            createNewUser(app),
        ]);

        const notificationResponse = await supertest(app)
            .post(`/api/notifications`)
            .set("Authorization", `Bearer ${userOne.token}`)
            .send({
                text: "this is a notification",
                destinationId: userTwo.id,
                linkTo: "/test",
            });

        notificationId = notificationResponse.body.notification.id;
    });

    it("should return 401 status code if tried to delete someone else's notification", async () => {
        const response = await supertest(app)
            .delete(`/api/notifications/${notificationId}`)
            .set("Authorization", `Bearer ${userOne.token}`);

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe(
            "you are not authorized to delete this notification"
        );
    });

    it("should delete a notification when provided valid data", async () => {
        const response = await supertest(app)
            .delete(`/api/notifications/${notificationId}`)
            .set("Authorization", `Bearer ${userTwo.token}`);

        expect(response.statusCode).toBe(200);
    });

    it("should return 404 status code if provided non-existing notification id", async () => {
        const response = await supertest(app)
            .delete(`/api/notifications/${notificationId}`)
            .set("Authorization", `Bearer ${userTwo.token}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("notification not found");
    });

    afterAll(async () => {
        const adminToken = await signInAsAdmin(app);
        await Promise.all([
            deleteCreatedUser(app, userOne.id, adminToken),
            deleteCreatedUser(app, userTwo.id, adminToken),
        ]);
    });
});
