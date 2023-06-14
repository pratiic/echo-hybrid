import supertest from "supertest";

import { app } from "../index.js";
import { createNewUser, deleteCreatedUser, signInAsAdmin } from "./utils.js";

describe("POST /api/stores REGISTER STORE", () => {
    let createdUser;

    beforeAll(async () => {
        createdUser = await createNewUser(app);
    });

    it("should register an individual store if provided valid data", async () => {
        const response = await supertest(app)
            .post(`/api/stores/?type=IND`)
            .set("Authorization", `Bearer ${createdUser.token}`);

        expect(response.statusCode).toBe(201);

        await deleteStore(app, createdUser.token);
    });

    it("should register a business store if provided valid data", async () => {
        const response = await supertest(app)
            .post(`/api/stores/?type=BUS`)
            .set("Authorization", `Bearer ${createdUser.token}`);

        expect(response.statusCode).toBe(201);

        await deleteStore(app, createdUser.token);
    });

    it("should return 400 status code if type is not provided", async () => {
        const response = await supertest(app)
            .post(`/api/stores/`)
            .set("Authorization", `Bearer ${createdUser.token}`);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("store type cannot be empty");
    });

    it("should return 400 status code if type is invalid (not IND or BUS)", async () => {
        const response = await supertest(app)
            .post(`/api/stores/?type=invalid`)
            .set("Authorization", `Bearer ${createdUser.token}`);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            '"store type" must be one of [IND, BUS]'
        );
    });

    afterAll(async () => {
        const adminToken = await signInAsAdmin(app);
        await deleteCreatedUser(app, createdUser.id, adminToken);
    });
});

describe("DELETE /api/stores DELETE STORE", () => {
    let createdUser;

    beforeAll(async () => {
        createdUser = await createNewUser(app);
    });

    it("should delete the store of the user if it is registered", async () => {
        await supertest(app)
            .post(`/api/stores/?type=IND`)
            .set("Authorization", `Bearer ${createdUser.token}`);

        const response = await deleteStore(app, createdUser.token);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("the store has been deleted");
    });

    it("should return 404 status code if a store is not registered", async () => {
        const response = await supertest(app)
            .delete(`/api/stores`)
            .set("Authorization", `Bearer ${createdUser.token}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("you are not registered as a seller");
    });

    afterAll(async () => {
        const adminToken = await signInAsAdmin(app);
        await deleteCreatedUser(app, createdUser.id, adminToken);
    });
});

async function deleteStore(app, token) {
    const response = await supertest(app)
        .delete(`/api/stores`)
        .set("Authorization", `Bearer ${token}`);

    return response;
}
