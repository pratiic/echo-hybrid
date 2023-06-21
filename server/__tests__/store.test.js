import supertest from "supertest";

import { app } from "../index.js";
import {
    createNewUser,
    deleteCreatedStore,
    deleteCreatedUser,
    signInAsAdmin,
    signInAsDeliveryPersonnel,
} from "./utils.js";
import { setAddress } from "./utils/address.utils.js";

describe("POST /api/stores REGISTER STORE", () => {
    let createdUser;

    beforeAll(async () => {
        createdUser = await createNewUser(app, false);
    });

    it("should return 401 status code if requested by admin", async () => {
        const adminToken = await signInAsAdmin(app);

        const response = await supertest(app)
            .post(`/api/stores/?type=IND`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(401);
    });

    it("should return 401 status code if requested by delivery personnel", async () => {
        const deliveryToken = await signInAsDeliveryPersonnel(app);

        const response = await supertest(app)
            .post(`/api/stores/?type=IND`)
            .set("Authorization", `Bearer ${deliveryToken}`);

        expect(response.statusCode).toBe(401);
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

    it("should return 400 status code if the address is not set - IND", async () => {
        const response = await supertest(app)
            .post(`/api/stores/?type=IND`)
            .set("Authorization", `Bearer ${createdUser.token}`);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("you need to set your address first");
    });

    it("should return 400 status code if the address is not set - BUS", async () => {
        const response = await supertest(app)
            .post(`/api/stores/?type=BUS`)
            .set("Authorization", `Bearer ${createdUser.token}`);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("you need to set your address first");
    });

    it("should register an individual store if provided valid data", async () => {
        await setAddress(app, createdUser.token);

        const response = await supertest(app)
            .post(`/api/stores/?type=IND`)
            .set("Authorization", `Bearer ${createdUser.token}`);

        await deleteCreatedUser(app, createdUser.id);
        createdUser = await createNewUser(app, true, true);

        expect(response.statusCode).toBe(201);
    });

    it("should register a business store if provided valid data", async () => {
        const response = await supertest(app)
            .post(`/api/stores/?type=BUS`)
            .set("Authorization", `Bearer ${createdUser.token}`);

        expect(response.statusCode).toBe(201);
    });

    it("should return 400 status code if the user is already registered as a seller - IND", async () => {
        const response = await supertest(app)
            .post(`/api/stores/?type=IND`)
            .set("Authorization", `Bearer ${createdUser.token}`);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "a store is already associated with your account"
        );
    });

    it("should return 400 status code if the user is already registered as a seller - BUS", async () => {
        const response = await supertest(app)
            .post(`/api/stores/?type=BUS`)
            .set("Authorization", `Bearer ${createdUser.token}`);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "a store is already associated with your account"
        );
    });

    afterAll(async () => {
        await deleteCreatedUser(app, createdUser.id);
    });
});

describe("DELETE /api/stores DELETE STORE", () => {
    let createdUser;

    beforeAll(async () => {
        createdUser = await createNewUser(app, true, true);
    });

    it("should delete the store of the user if it is registered - IND", async () => {
        await supertest(app)
            .post(`/api/stores/?type=IND`)
            .set("Authorization", `Bearer ${createdUser.token}`);

        const response = await deleteCreatedStore(app, createdUser.token);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("the store has been deleted");
    });

    it("should delete the store of the user if it is registered - BUS", async () => {
        await supertest(app)
            .post(`/api/stores/?type=BUS`)
            .set("Authorization", `Bearer ${createdUser.token}`);

        const response = await deleteCreatedStore(app, createdUser.token);

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
        await deleteCreatedUser(app, createdUser.id);
    });
});
