import supertest from "supertest";

import { app } from "../../index.js";

describe("POST /api/chats/:userId START CHAT", () => {
    let token, userId;

    beforeAll(async () => {
        // sign in and get a JWT token to use in the tests
        const response = await supertest(app).post("/api/auth/signin").send({
            email: "johndoe@gmail.com",
            password: "prat123!",
        });

        token = response.body.user.token;
        userId = response.body.user.id;
    });

    it("should start a chat with a user when provided valid data", async () => {
        const userResponse = await supertest(app)
            .get("/api/users")
            .set("Authorization", `Bearer ${token}`)
            .send({
                email: "janedoe@gmail.com",
            });
        const chatUserId = userResponse.body.user.id;

        const chatResponse = await supertest(app)
            .post(`/api/chats/${chatUserId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(
            chatResponse.statusCode === 200 || chatResponse.statusCode === 201
        ).toBe(true);
    });

    it("should return status code 400 if tried to chat with oneself", async () => {
        const chatResponse = await supertest(app)
            .post(`/api/chats/${userId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(chatResponse.statusCode).toBe(400);
        expect(chatResponse.body.error).toBe(
            "you cannot start a chat with yourself"
        );
    });

    it("should return status code 404 if tried to chat with a non-existing user", async () => {
        const chatResponse = await supertest(app)
            .post(`/api/chats/non-existing`)
            .set("Authorization", `Bearer ${token}`);

        expect(chatResponse.statusCode).toBe(404);
        expect(chatResponse.body.error).toBe("user not found");
    });
});
