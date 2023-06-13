import supertest from "supertest";

import { app } from "../index.js";
import { createNewUser, deleteCreatedUser, signInAsAdmin } from "./utils.js";

describe("POST /api/categories ADD CATEGORIES", () => {
    let adminToken, createdUser;
    const ADDED_CATEGORY = "new cat";

    beforeAll(async () => {
        adminToken = await signInAsAdmin(app);

        createdUser = await createNewUser(app);
    });

    it("should return 401 status code if the request is sent by a non-admin user", async () => {
        const response = await supertest(app)
            .post(`/api/categories`)
            .set("Authorization", `Bearer ${createdUser.token}`)
            .send({
                categories: [{ name: ADDED_CATEGORY }],
            });
        expect(response.statusCode).toBe(401);
    });

    it("should add categories when provided valid data", async () => {
        const response = await supertest(app)
            .post(`/api/categories`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                categories: [{ name: ADDED_CATEGORY }],
            });
        expect(response.statusCode).toBe(200);
    });

    it("should return 400 status code if a duplicate category is provided", async () => {
        const response = await supertest(app)
            .post(`/api/categories`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                categories: [{ name: ADDED_CATEGORY }],
            });
        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if catgories is not provided", async () => {
        const response = await supertest(app)
            .post(`/api/categories`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({});
        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if a category name is not provided", async () => {
        const response = await supertest(app)
            .post(`/api/categories`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                categories: [
                    {
                        name: "",
                    },
                ],
            });
        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if a category name is invalid (not string)", async () => {
        const response = await supertest(app)
            .post(`/api/categories`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                categories: [
                    {
                        name: 123,
                    },
                ],
            });
        expect(response.statusCode).toBe(400);
    });

    afterAll(async () => {
        await supertest(app)
            .delete(`/api/categories/${ADDED_CATEGORY}`)
            .set("Authorization", `Bearer ${adminToken}`);
        await deleteCreatedUser(app, createdUser.id, adminToken);
    });
});

describe("POST /api/categories/request REQUEST CATEGORY", () => {
    let createdUser;
    const REQ_CATEGORY = "req cat";

    beforeAll(async () => {
        createdUser = await createNewUser(app);
    });

    it("should request category when provided valid data", async () => {
        const response = await supertest(app)
            .post(`/api/categories/request/?name=${REQ_CATEGORY}`)
            .set("Authorization", `Bearer ${createdUser.token}`);
        expect(response.statusCode).toBe(200);
    });

    it("should return 400 status code if a duplicate category is provided", async () => {
        const response = await supertest(app)
            .post(`/api/categories/request/?name=${REQ_CATEGORY}`)
            .set("Authorization", `Bearer ${createdUser.token}`);
        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if a category name is not provided", async () => {
        const response = await supertest(app)
            .post(`/api/categories/request`)
            .set("Authorization", `Bearer ${createdUser.token}`);
        expect(response.statusCode).toBe(400);
    });

    afterAll(async () => {
        const adminToken = await signInAsAdmin(app);
        await deleteCreatedUser(app, createdUser.id, adminToken);
    });
});

describe("PATCH /api/categories/request CONTROL CATEGORY REQUEST", () => {
    let adminToken, createdUser;
    const REQ_CATEGORY = "req cat";

    beforeAll(async () => {
        adminToken = await signInAsAdmin(app);

        // create a new user and request a new cateogory
        createdUser = await createNewUser(app);
        await supertest(app)
            .post(`/api/categories/request/?name=${REQ_CATEGORY}`)
            .set("Authorization", `Bearer ${createdUser.token}`);
    });

    it("should return 400 status code if action is invalid (not accept or reject)", async () => {
        const response = await supertest(app)
            .patch(
                `/api/categories/request/?name=${REQ_CATEGORY}&action=invalid`
            )
            .set("Authorization", `Bearer ${adminToken}`);
        expect(response.statusCode).toBe(400);
    });

    it("should perform the requested action (accept or reject) on the category when provided valid data", async () => {
        const response = await supertest(app)
            .patch(
                `/api/categories/request/?name=${REQ_CATEGORY}&action=reject`
            )
            .set("Authorization", `Bearer ${adminToken}`);
        expect(response.statusCode).toBe(200);
    });

    it("should return 400 status code if both name and action are not provided", async () => {
        const response = await supertest(app)
            .patch(`/api/categories/request`)
            .set("Authorization", `Bearer ${adminToken}`);
        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if name is not provided", async () => {
        const response = await supertest(app)
            .patch(`/api/categories/request/?action=accept`)
            .set("Authorization", `Bearer ${adminToken}`);
        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if action is not provided", async () => {
        const response = await supertest(app)
            .patch(`/api/categories/request/?name=electronics`)
            .set("Authorization", `Bearer ${adminToken}`);
        expect(response.statusCode).toBe(400);
    });

    afterAll(async () => {
        await deleteCreatedUser(app, createdUser.id, adminToken);
    });
});

describe("DELETE /api/categories/request DELETE CATEGORY", () => {
    let adminToken;
    const ADDED_CATEGORY = "new cat";

    beforeAll(async () => {
        adminToken = await signInAsAdmin(app);

        await supertest(app)
            .post(`/api/categories`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                categories: [{ name: ADDED_CATEGORY }],
            });
    });

    it("should delete the category if provided valid data", async () => {
        const response = await supertest(app)
            .delete(`/api/categories/${ADDED_CATEGORY}`)
            .set("Authorization", `Bearer ${adminToken}`);
        expect(response.statusCode).toBe(200);
    });

    it("should return 404 status code if the category does not exist", async () => {
        const response = await supertest(app)
            .delete(`/api/categories/${ADDED_CATEGORY}`)
            .set("Authorization", `Bearer ${adminToken}`);
        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("category not found");
    });

    it("should return 400 status code if the category has atleast one product associated with it", async () => {
        const response = await supertest(app)
            .delete(`/api/categories/electronics`)
            .set("Authorization", `Bearer ${adminToken}`);
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "a category must have no product associated with it to be deleted"
        );
    });
});
