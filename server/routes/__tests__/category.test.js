import supertest from "supertest";

import { app } from "../../index.js";

describe("POST /api/categories ADD CATEGORIES", () => {
    let token;

    beforeAll(async () => {
        // sign in and get a JWT token to use in the tests
        const response = await supertest(app).post("/api/auth/signin").send({
            email: "pratikbhandari99999@gmail.com",
            password: "prat123!",
        });
        token = response.body.user.token;
    });

    // it("should add categories when provided valid data", async () => {
    //     const response = await supertest(app)
    //         .post(`/api/categories`)
    //         .set("Authorization", `Bearer ${token}`)
    //         .send({
    //             categories: [{ name: "test category" }],
    //         });
    //     expect(response.statusCode).toBe(200);
    // });

    it("should return 400 status code if a duplicate category is provided", async () => {
        const response = await supertest(app)
            .post(`/api/categories`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                categories: [{ name: "test category" }],
            });
        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if catgories is not provided", async () => {
        const response = await supertest(app)
            .post(`/api/categories`)
            .set("Authorization", `Bearer ${token}`)
            .send({});
        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if a category name is not provided", async () => {
        const response = await supertest(app)
            .post(`/api/categories`)
            .set("Authorization", `Bearer ${token}`)
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
            .set("Authorization", `Bearer ${token}`)
            .send({
                categories: [
                    {
                        name: 123,
                    },
                ],
            });
        expect(response.statusCode).toBe(400);
    });
});

describe("POST /api/categories/request REQUEST CATEGORY", () => {
    let token;

    beforeAll(async () => {
        // sign in and get a JWT token to use in the tests
        const response = await supertest(app).post("/api/auth/signin").send({
            email: "pratikbhandari99999@gmail.com",
            password: "prat123!",
        });
        token = response.body.user.token;
    });

    // it("should request category when provided valid data", async () => {
    //     const response = await supertest(app)
    //         .post(`/api/categories/request/?name=requested category`)
    //         .set("Authorization", `Bearer ${token}`);
    //     expect(response.statusCode).toBe(200);
    // });

    // it("should return 400 status code if a duplicate category is provided", async () => {
    //     const response = await supertest(app)
    //         .post(`/api/categories/request/?name=requested category`)
    //         .set("Authorization", `Bearer ${token}`)
    //         .send({
    //             categories: [{ name: "test category" }],
    //         });
    //     expect(response.statusCode).toBe(400);
    // });

    it("should return 400 status code if a category name is not provided", async () => {
        const response = await supertest(app)
            .post(`/api/categories/request`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                categories: [{ name: "test category" }],
            });
        expect(response.statusCode).toBe(400);
    });

    // it("should return 400 status code if a category name is invalid (not string)", async () => {
    //     const response = await supertest(app)
    //         .post(`/api/categories/request/?name=123`)
    //         .set("Authorization", `Bearer ${token}`)
    //         .send({
    //             categories: [{ name: "test category" }],
    //         });
    //     expect(response.statusCode).toBe(400);
    // });
});

describe("PATCH /api/categories/request CONTROL CATEGORY REQUEST", () => {
    let token;

    beforeAll(async () => {
        // sign in and get a JWT token to use in the tests
        const response = await supertest(app).post("/api/auth/signin").send({
            email: "pratikbhandari99999@gmail.com",
            password: "prat123!",
        });
        token = response.body.user.token;
    });

    // it("should perform the requested action (accept or reject) on the category when provided valid data", async () => {
    //     const response = await supertest(app)
    //         .patch(
    //             `/api/categories/request/?name=requested category&action=reject`
    //         )
    //         .set("Authorization", `Bearer ${token}`);
    //     expect(response.statusCode).toBe(200);
    // });

    it("should return 400 status code if both name and action are not provided", async () => {
        const response = await supertest(app)
            .patch(`/api/categories/request`)
            .set("Authorization", `Bearer ${token}`);
        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if name is not provided", async () => {
        const response = await supertest(app)
            .patch(`/api/categories/request/?action=accept`)
            .set("Authorization", `Bearer ${token}`);
        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if action is not provided", async () => {
        const response = await supertest(app)
            .patch(`/api/categories/request/?name=electronics`)
            .set("Authorization", `Bearer ${token}`);
        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if action is invalid (not accept or reject)", async () => {
        const response = await supertest(app)
            .patch(`/api/categories/request/?name=electronics&action=invalid`)
            .set("Authorization", `Bearer ${token}`);
        expect(response.statusCode).toBe(400);
    });
});

describe("DELETE /api/categories/request CONTROL CATEGORY REQUEST", () => {
    let token;

    beforeAll(async () => {
        // sign in and get a JWT token to use in the tests
        const response = await supertest(app).post("/api/auth/signin").send({
            email: "pratikbhandari99999@gmail.com",
            password: "prat123!",
        });
        token = response.body.user.token;
    });

    it("should return 404 status code if the category does not exist", async () => {
        const response = await supertest(app)
            .delete(`/api/categories/nonexistingcategory`)
            .set("Authorization", `Bearer ${token}`);
        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("category not found");
    });

    it("should return 400 status code if the category has atleast one product associated with it", async () => {
        const response = await supertest(app)
            .delete(`/api/categories/electronics`)
            .set("Authorization", `Bearer ${token}`);
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "a category must have no product associated with it to be deleted"
        );
    });
});
