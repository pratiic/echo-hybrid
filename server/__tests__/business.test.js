import supertest from "supertest";

import { app } from "../index.js";
import {
    createNewUser,
    deleteCreatedStore,
    deleteCreatedUser,
    signInAsAdmin,
} from "./utils.js";

describe("POST /api/businesses REGISTER BUSINESS", () => {
    let createdUser;

    beforeAll(async () => {
        createdUser = await createNewUser(app);
    });

    it("should return 400 status code if tried to register business without registering as a seller", async () => {
        const response = await supertest(app)
            .post("/api/businesses")
            .set("Authorization", `Bearer ${createdUser.token}`);

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if tried to register business by an individual seller", async () => {
        await supertest(app).post("/api/stores/?type=IND");

        const response = await supertest(app)
            .post("/api/businesses")
            .set("Authorization", `Bearer ${createdUser.token}`);

        await deleteCreatedStore(app, createdUser.token);

        expect(response.statusCode).toBe(400);
    });

    // it("should register a business if provided valid data", async () => {
    //     await supertest(app).post("/api/stores/?type=BUS");

    //     const response = await supertest(app)
    //         .post("/api/businesses")
    //         .set("Authorization", `Bearer ${createdUser.token}`)
    //         .field("name", "new business")
    //         .field("PAN", "152347865")
    //         .field("phone", "9810222399")
    //         .attach("image", "images/profile.jpg");

    //     expect(response.statusCode).toBe(201);
    // });

    // it("should return 400 status code if name is not provided", async () => {
    //     const response = await supertest(app)
    //         .post("/api/businesses")
    //         .set("Authorization", `Bearer ${createdUser.token}`)
    //         .field("PAN", "152347865")
    //         .field("phone", "9810222399")
    //         .attach("image", "images/profile.jpg");

    //     expect(response.statusCode).toBe(400);
    // });

    afterAll(async () => {
        const adminToken = await signInAsAdmin(app);
        await deleteCreatedUser(app, createdUser.id, adminToken);
    });
});
