import supertest from "supertest";

import { app } from "../index.js";
import { createNewUser, deleteCreatedUser } from "./utils.js";

describe("POST /api/chats/:userId START CHAT", () => {
    let userOne, userTwo;

    beforeAll(async () => {
        userOne = await createNewUser(app);
        userTwo = await createNewUser(app);
    });

    it("should start a chat with a user when provided valid data", async () => {
        const response = await supertest(app)
            .post(`/api/chats/${userTwo.id}`)
            .set("Authorization", `Bearer ${userOne.token}`);

        expect(response.statusCode === 200 || response.statusCode === 201).toBe(
            true
        );
    });

    it("should return status code 400 if tried to chat with oneself", async () => {
        const chatResponse = await supertest(app)
            .post(`/api/chats/${userOne.id}`)
            .set("Authorization", `Bearer ${userOne.token}`);

        expect(chatResponse.statusCode).toBe(400);
        expect(chatResponse.body.error).toBe(
            "you cannot start a chat with yourself"
        );
    });

    it("should return status code 404 if tried to chat with a non-existing user", async () => {
        const chatResponse = await supertest(app)
            .post(`/api/chats/-1`)
            .set("Authorization", `Bearer ${userOne.token}`);

        expect(chatResponse.statusCode).toBe(404);
        expect(chatResponse.body.error).toBe(
            "the user you are trying to chat with was not found, they may have been deleted"
        );
    });

    afterAll(async () => {
        await deleteCreatedUser(app, userOne.id);
        await deleteCreatedUser(app, userTwo.id);
    });
});

describe("PATCH /api/chats/unseen/:chatId RESET UNSEEN MESSAGES COUNT", () => {
    let userOne, userTwo, userThree, chatId;

    beforeAll(async () => {
        userOne = await createNewUser(app);
        userTwo = await createNewUser(app);
        userThree = await createNewUser(app);

        chatId = (
            await supertest(app)
                .post(`/api/chats/${userTwo.id}`)
                .set("Authorization", `Bearer ${userOne.token}`)
        ).body.chat.id;
    });

    it("should return 400 status code if the chat does not exist", async () => {
        const response = await supertest(app)
            .patch(`/api/chats/unseen/-1`)
            .set("Authorization", `Bearer ${userOne.token}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("chat not found");
    });

    it("should return 401 status code if the requesting user is not part of the chat", async () => {
        const response = await supertest(app)
            .patch(`/api/chats/unseen/${chatId}`)
            .set("Authorization", `Bearer ${userThree.token}`);

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe(
            "you are unauthorized to perform this action"
        );
    });

    it("should reset unseen messages count if provided valid data", async () => {
        const response = await supertest(app)
            .patch(`/api/chats/unseen/${chatId}`)
            .set("Authorization", `Bearer ${userOne.token}`);

        expect(response.statusCode).toBe(200);
    });

    afterAll(async () => {
        await deleteCreatedUser(app, userOne.id);
        await deleteCreatedUser(app, userTwo.id);
        await deleteCreatedUser(app, userThree.id);
    });
});
