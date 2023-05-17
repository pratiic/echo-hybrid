import supertest from "supertest";

import { app } from "../../index.js";

describe("GET /api/addresses SET ADDRESS", () => {
    let token;
    let userId;

    beforeAll(async () => {
        // sign in and get a JWT token to use in the tests
        const response = await supertest(app).post("/api/auth/signin").send({
            email: "johndoe@gmail.com",
            password: "prat123!",
        });

        token = response.body.user.token;
        userId = response.body.user.id;
    });

    it("should send a notification to a user if provided valid data", async () => {
        const response = await supertest(app)
            .post(`/api/notifications`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                text: "this is a new notification",
                destinationId: 16,
                linkTo: "/test",
            });

        expect(response.statusCode).toBe(201);
    });

    it("should return 400 status code if notification is sent to self", async () => {
        const response = await supertest(app)
            .post(`/api/notifications`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                text: "this is a new notification",
                destinationId: userId,
                linkTo: "/test",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("notification cannot be sent to self");
    });

    it("should return 400 status code if text is not provided", async () => {
        const response = await supertest(app)
            .post(`/api/notifications`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                destinationId: 16,
                linkTo: "/test",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("text cannot be empty");
    });

    it("should return 400 status code if destinationId is not provided", async () => {
        const response = await supertest(app)
            .post(`/api/notifications`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                text: "this is a new notification",
                linkTo: "/test",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("destinationId cannot be empty");
    });

    it("should return 400 status code if linkTo is invalid (not string)", async () => {
        const response = await supertest(app)
            .post(`/api/notifications`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                text: "this is a new notification",
                destinationId: 16,
                linkTo: 123,
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('"linkTo" must be a string');
    });
});

describe("DELETE /api/notificatios/:notificationId DELETE NOTIFICATION", () => {
    let token;

    beforeAll(async () => {
        // sign in and get a JWT token to use in the tests
        const response = await supertest(app).post("/api/auth/signin").send({
            email: "johndoe@gmail.com",
            password: "prat123!",
        });

        token = response.body.user.token;
    });

    // it("should delete a notification when provided valid id", async () => {
    //     const response = await supertest(app)
    //         .delete(`/api/notifications/21`)
    //         .set("Authorization", `Bearer ${token}`);

    //     expect(response.statusCode).toBe(200);
    // });

    it("should return 404 status code if notificationId is invalid", async () => {
        const response = await supertest(app)
            .delete(`/api/notifications/invalid`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("notification not found");
    });

    // it("should return 401 status code if tried to delete someone else's notification", async () => {
    //     const response = await supertest(app)
    //         .delete(`/api/notifications/23`)
    //         .set("Authorization", `Bearer ${token}`);

    //     expect(response.statusCode).toBe(401);
    //     expect(response.body.error).toBe(
    //         "you are not authorized to delete this notification"
    //     );
    // });
});
