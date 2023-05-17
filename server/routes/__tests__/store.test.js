import supertest from "supertest";

import { app } from "../../index.js";

describe("POST /api/stores REGISTER STORE", () => {
    let token;

    beforeAll(async () => {
        // sign in and get a JWT token to use in the tests
        const response = await supertest(app).post("/api/auth/signin").send({
            email: "janedoe@gmail.com",
            password: "prat123!",
        });

        token = response.body.user.token;
    });

    it("should register an individual store if provided valid data", async () => {
        const response = await supertest(app)
            .post(`/api/stores/?type=IND`)
            .set("Authorization", `Bearer ${token}`);

        await supertest(app)
            .delete(`/api/stores`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(201);
    });

    it("should register a business store if provided valid data", async () => {
        const response = await supertest(app)
            .post(`/api/stores/?type=BUS`)
            .set("Authorization", `Bearer ${token}`);

        await supertest(app)
            .delete(`/api/stores`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(201);
    });

    it("should return 400 status code if type is not provided", async () => {
        const response = await supertest(app)
            .post(`/api/stores/`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("store type cannot be empty");
    });

    it("should return 400 status code if type is invalid (not IND or BUS)", async () => {
        const response = await supertest(app)
            .post(`/api/stores/?type=invalid`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            '"store type" must be one of [IND, BUS]'
        );
    });
});

describe("DELETE /api/stores DELETE STORE", () => {
    let token;

    beforeAll(async () => {
        // sign in and get a JWT token to use in the tests
        const response = await supertest(app).post("/api/auth/signin").send({
            email: "janedoe@gmail.com",
            password: "prat123!",
        });

        token = response.body.user.token;
    });

    it("should delete the store of the user if it is registered", async () => {
        await supertest(app)
            .post(`/api/stores/?type=IND`)
            .set("Authorization", `Bearer ${token}`);

        const response = await supertest(app)
            .delete(`/api/stores`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("the store has been deleted");
    });

    it("should return 404 status code if a store is not registered", async () => {
        const response = await supertest(app)
            .delete(`/api/stores`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("store does not exist");
    });
});
