import supertest from "supertest";

import { app } from "../index.js";
import { createNewUser, deleteCreatedUser, signInAsAdmin } from "./utils.js";

describe("POST /api/messages/:chatId SEND MESSAGE", () => {
    let userOne, userTwo, chatId;

    beforeAll(async () => {
        userOne = await createNewUser(app);
        userTwo = await createNewUser(app);
    });

    it("should send a message to a chat if provided valid data - TEXT AND IMAGE", async () => {
        chatId = await setupChat(userOne, userTwo);

        const response = await supertest(app)
            .post(`/api/messages/${chatId}`)
            .set("Authorization", `Bearer ${userOne.token}`)
            .field("text", "this is a message")
            .attach("image", "images/chat-image.jpeg");

        expect(response.statusCode).toBe(201);
    });

    it("should send a message to a chat if provided valid data - TEXT", async () => {
        chatId = await setupChat(userOne, userTwo);

        const response = await supertest(app)
            .post(`/api/messages/${chatId}`)
            .set("Authorization", `Bearer ${userOne.token}`)
            .field("text", "this is a message");

        expect(response.statusCode).toBe(201);
    });

    it("should send a message to a chat if provided valid data - IMAGE", async () => {
        chatId = await setupChat(userOne, userTwo);

        const response = await supertest(app)
            .post(`/api/messages/${chatId}`)
            .set("Authorization", `Bearer ${userOne.token}`)
            .attach("image", "images/chat-image.jpeg");

        expect(response.statusCode).toBe(201);
    });

    it("should return 400 status code if neither text nor image is provided", async () => {
        const response = await supertest(app)
            .post(`/api/messages/${chatId}`)
            .set("Authorization", `Bearer ${userOne.token}`);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("text cannot be empty");
    });

    it("should return 404 status code if the chat does not exist", async () => {
        const msgResponse = await supertest(app)
            .post(`/api/messages/nonexisting-id`)
            .set("Authorization", `Bearer ${userOne.token}`);

        expect(msgResponse.statusCode).toBe(404);
        expect(msgResponse.body.error).toBe("chat not found");
    });

    afterAll(async () => {
        const adminToken = await signInAsAdmin(app);
        await deleteCreatedUser(app, userOne.id, adminToken);
        await deleteCreatedUser(app, userTwo.id, adminToken);
        await deleteCreatedChat(app, chatId, adminToken);
    });
});

describe("GET /api/messages/:chatId GET CHAT MESSAGES", () => {
    let userOne, userTwo, userThree, chatId;

    beforeAll(async () => {
        [userOne, userTwo, userThree] = await Promise.all([
            createNewUser(app),
            createNewUser(app),
            createNewUser(app),
        ]);

        chatId = await setupChat(userOne, userTwo);
    });

    it("should return an array of messages if provided valid data", async () => {
        const response = await supertest(app)
            .get(`/api/messages/${chatId}`)
            .set("Authorization", `Bearer ${userOne.token}`);

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body.messages)).toBe(true);
    });

    it("should return 404 status code if provided a non-existing chat id", async () => {
        const response = await supertest(app)
            .get(`/api/messages/nonexisting-id`)
            .set("Authorization", `Bearer ${userOne.token}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("chat not found");
    });

    it("should return 401 status code if tried to get messages of someone else's chat", async () => {
        const response = await supertest(app)
            .get(`/api/messages/${chatId}`)
            .set("Authorization", `Bearer ${userThree.token}`);

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe(
            "you are unauthorized to perform any action on this chat"
        );
    });

    afterAll(async () => {
        const adminToken = await signInAsAdmin(app);
        await deleteCreatedUser(app, userOne.id, adminToken);
        await deleteCreatedUser(app, userTwo.id, adminToken);
        await deleteCreatedUser(app, userThree.id, adminToken);
        await deleteCreatedChat(app, chatId, adminToken);
    });
});

describe("DELETE /api/messages/:messageId DELETE MESSAGE", () => {
    let userOne, userTwo, chatId, messageId;

    beforeAll(async () => {
        [userOne, userTwo] = await Promise.all([
            createNewUser(app),
            createNewUser(app),
        ]);

        chatId = await setupChat(userOne, userTwo);

        const messageResponse = await supertest(app)
            .post(`/api/messages/${chatId}`)
            .set("Authorization", `Bearer ${userOne.token}`)
            .send({
                text: "this is a message",
            });
        messageId = messageResponse.body.message.id;
    });

    it("should return a 401 status code if tried to delete someone else's message", async () => {
        const response = await supertest(app)
            .delete(`/api/messages/${messageId}`)
            .set("Authorization", `Bearer ${userTwo.token}`);

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe(
            "you are unauthorized to delete this message"
        );
    });

    it("should delete a message if provided valid data", async () => {
        const response = await supertest(app)
            .delete(`/api/messages/${messageId}`)
            .set("Authorization", `Bearer ${userOne.token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("the message has been deleted");
    });

    it("should return 404 status code if tried to delete an non-existing message (for e.g., an already deleted message)", async () => {
        const response = await supertest(app)
            .delete(`/api/messages/${messageId}`)
            .set("Authorization", `Bearer ${userOne.token}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("message not found");
    });

    afterAll(async () => {
        const adminToken = await signInAsAdmin(app);
        await deleteCreatedUser(app, userOne.id, adminToken);
        await deleteCreatedUser(app, userTwo.id, adminToken);
        await deleteCreatedChat(app, chatId, adminToken);
    });
});

// util functions
async function setupChat(userOne, userTwo) {
    const chatResponse = await supertest(app)
        .post(`/api/chats/${userTwo.id}`)
        .set("Authorization", `Bearer ${userOne.token}`);
    const chatId = chatResponse.body.chat.id;

    return chatId;
}

async function deleteCreatedChat(app, chatId, adminToken) {
    await supertest(app)
        .delete(`/api/chats/${chatId}`)
        .set("Authorization", `Bearer ${adminToken}`);
}
