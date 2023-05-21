import supertest from "supertest";

import { app } from "../../index.js";

describe("POST /api/messages/:chatId SEND MESSAGE", () => {
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

    it("should send a message to a chat if provided valid data", async () => {
        const chatId = await setupChat(token);

        const response = await supertest(app)
            .post(`/api/messages/${chatId}`)
            .set("Authorization", `Bearer ${token}`)
            .field("text", "this is a message")
            .attach("image", "images/chat-image.jpeg");

        expect(response.statusCode).toBe(201);
    });

    it("should return 400 status code if neither text nor image is provided", async () => {
        const chatId = await setupChat(token);

        const response = await supertest(app)
            .post(`/api/messages/${chatId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("text cannot be empty");
    });

    it("should return 404 status code if invalid chat id is provided", async () => {
        const msgResponse = await supertest(app)
            .post(`/api/messages/invalid-id`)
            .set("Authorization", `Bearer ${token}`);

        expect(msgResponse.statusCode).toBe(404);
        expect(msgResponse.body.error).toBe("chat not found");
    });
});

describe("GET /api/messages/:chatId GET CHAT MESSAGES", () => {
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

    it("should return an array of messages if provided valid data", async () => {
        const chatId = await setupChat(token);

        const response = await supertest(app)
            .get(`/api/messages/${chatId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body.messages)).toBe(true);
    });

    it("should return 404 status code is provided invalid chat id", async () => {
        const response = await supertest(app)
            .get(`/api/messages/invalid-id`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("chat not found");
    });
});

describe("DELETE /api/messages/:messageId DELETE MESSAGE", () => {
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

    it("should delete a message if provided valid data", async () => {
        const messageId = await sendMessage(token);

        const response = await supertest(app)
            .delete(`/api/messages/${messageId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("the message has been deleted");
    });

    it("should return 404 status code if tried to delete an non-existing message (for e.g., an already deleted message)", async () => {
        const messageId = await sendMessage(token);

        await supertest(app)
            .delete(`/api/messages/${messageId}`)
            .set("Authorization", `Bearer ${token}`);

        const response = await supertest(app)
            .delete(`/api/messages/${messageId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("message not found");
    });
});

// util functions
async function setupChat(token) {
    // user to start (or get details about) a chat with
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
    const chatId = chatResponse.body.chat.id;

    return chatId;
}

async function sendMessage(token) {
    const chatId = await setupChat(token);

    const response = await supertest(app)
        .post(`/api/messages/${chatId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            text: "this is a message",
        });

    const messageId = response.body.message.id;

    return messageId;
}
