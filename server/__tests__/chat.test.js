import supertest from "supertest";

import { app } from "../index.js";
import { createNewUser, deleteCreatedUser, signInAsAdmin } from "./utils.js";

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
        expect(chatResponse.body.error).toBe("user not found");
    });

    afterAll(async () => {
        const adminToken = await signInAsAdmin(app);
        await deleteCreatedUser(app, userOne.id, adminToken);
        await deleteCreatedUser(app, userTwo.id, adminToken);
    });
});
