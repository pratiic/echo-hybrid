import supertest from "supertest";

import { app } from "../index.js";
import { createNewUser, deleteCreatedUser, signInAsAdmin } from "./utils.js";

describe("GET /api/addresses SET ADDRESS", () => {
    let createdUser;
    const validAddress = {
        province: "province no 1",
        city: "jhapa",
        area: "birtamode",
        description: "near hanuman complex",
    };

    beforeAll(async () => {
        createdUser = await createNewUser(app);
    });

    it("should set user address when provided valid data", async () => {
        const response = await setAddress(app, createdUser.token, validAddress);

        expect(response.statusCode).toBe(200);
    });

    it("should return 400 status code when targetType is invalid", async () => {
        const response = await supertest(app)
            .post(`/api/addresses/invalid`)
            .set("Authorization", `Bearer ${createdUser.token}`)
            .send(validAddress);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("invalid target type");
    });

    it("should return 400 status code when province is not provided", async () => {
        const response = await setAddress(app, createdUser.token, {
            ...validAddress,
            province: "",
        });

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code when province is invalid", async () => {
        const response = await setAddress(app, createdUser.token, {
            ...validAddress,
            province: "invalid province",
        });

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code when city is not provided", async () => {
        const response = await setAddress(app, createdUser.token, {
            ...validAddress,
            city: "",
        });

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code when province is 'bagmati' and city is not one of the districts of bagmati province", async () => {
        const response = await setAddress(app, createdUser.token, {
            ...validAddress,
            province: "bagmati",
            city: "birtamode",
        });

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code when province is not 'bagmati' and city is less than 5 characters", async () => {
        const response = await setAddress(app, createdUser.token, {
            ...validAddress,
            province: "province no 1",
            city: "test",
        });

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code when province is not 'bagmati' and city is more than 5 characters", async () => {
        const response = await setAddress(app, createdUser.token, {
            ...validAddress,
            province: "province no 1",
            city: "test address test address",
        });

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code when area is not provided", async () => {
        const response = await setAddress(app, createdUser.token, {
            ...validAddress,
            area: "",
        });

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code when area is less than 5 characters long", async () => {
        const response = await setAddress(app, createdUser.token, {
            ...validAddress,
            area: "test",
        });

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code when area is more than 20 characters long", async () => {
        const response = await setAddress(app, createdUser.token, {
            ...validAddress,
            area: "test address test address",
        });

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code when description is more than 100 characters long", async () => {
        const response = await setAddress(app, createdUser.token, {
            ...validAddress,
            description:
                "test description test description test description test description test description test description test description test description test description test description test test description",
        });

        expect(response.statusCode).toBe(400);
    });

    afterAll(async () => {
        const adminToken = await signInAsAdmin(app);
        await deleteCreatedUser(app, createdUser.id, adminToken);
    });
});

async function setAddress(app, token, data) {
    const response = await supertest(app)
        .post(`/api/addresses/user`)
        .set("Authorization", `Bearer ${token}`)
        .send(data);

    return response;
}
