import supertest from "supertest";

import { app } from "../index.js";
import { deleteCreatedUser, signInAsAdmin } from "./utils.js";
import { controlSuspension } from "./utils/suspension.utils.js";
import { prepareOrderElements } from "./utils/order.utils.js";

describe("POST /api/suspensions/:targetType/:targetId CONTROL SUSPENSION", () => {
    let createdUser,
        adminToken,
        indSeller,
        busSeller,
        busSellerStoreId,
        flatProduct;

    beforeAll(async () => {
        const orderElements = await prepareOrderElements(app);
        createdUser = orderElements.createdUser;
        indSeller = orderElements.indSeller;
        busSeller = orderElements.busSeller;
        flatProduct = orderElements.flatProduct;

        const busSellerStoreIdRes = await supertest(app)
            .get(`/api/users`)
            .set("Authorization", `Bearer ${busSeller.token}`);
        busSellerStoreId = busSellerStoreIdRes.body.user.store.id;

        // sign in as admin
        adminToken = await signInAsAdmin(app);
    });

    it("should return 401 status code if requested by a non-admin user", async () => {
        const response = await controlSuspension(app, createdUser.token);

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe(
            "you need to be an admin to perform this action"
        );
    });

    it("should return 400 status code if targetType is invalid", async () => {
        const response = await controlSuspension(
            app,
            adminToken,
            "invalid-target"
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            '"targetType" must be one of [product, store, user, review]'
        );
    });

    it("should return 400 status code if action is not provided", async () => {
        const response = await controlSuspension(app, adminToken, "product");

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            '"action" must be one of [suspend, reinstate]'
        );
    });

    it("should return 400 status code if action is invalid", async () => {
        const response = await controlSuspension(
            app,
            adminToken,
            "product",
            -1,
            "invalid-action"
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            '"action" must be one of [suspend, reinstate]'
        );
    });

    it("should return 400 status code if action is 'suspend' and cause is not provided", async () => {
        const response = await controlSuspension(
            app,
            adminToken,
            "product",
            -1,
            "suspend"
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("cause cannot be empty");
    });

    it("should return 400 status code if action is 'suspend' and cause is less than 20 characters", async () => {
        const response = await controlSuspension(
            app,
            adminToken,
            "product",
            -1,
            "suspend",
            "cause"
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "cause must be atleast 20 characters long"
        );
    });

    it("should return 400 status code if action is 'suspend' and cause is more than 150 characters long", async () => {
        const response = await controlSuspension(
            app,
            adminToken,
            "product",
            -1,
            "suspend",
            "cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause"
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "cause cannot be more than 150 characters long"
        );
    });

    it("should return 404 status code if the target does not exist - PRODUCT", async () => {
        const response = await controlSuspension(
            app,
            adminToken,
            "product",
            -1,
            "suspend",
            "this product is highly inappropriate"
        );

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("product not found");
    });

    it("should return 404 status code if the target does not exist - SELLER", async () => {
        const response = await controlSuspension(
            app,
            adminToken,
            "store",
            -1,
            "suspend",
            "this seller is highly inappropriate"
        );

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("store not found");
    });

    it("should return 404 status code if the target does not exist - USER", async () => {
        const response = await controlSuspension(
            app,
            adminToken,
            "user",
            -1,
            "suspend",
            "this user is highly inappropriate"
        );

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("user not found");
    });

    it("should suspend target if provided valid data - PRODUCT", async () => {
        const response = await controlSuspension(
            app,
            adminToken,
            "product",
            flatProduct.id,
            "suspend",
            "this product is highly inappropriate"
        );

        expect(response.statusCode).toBe(200);
    });

    it("should suspend target if provided valid data - SELLER", async () => {
        const response = await controlSuspension(
            app,
            adminToken,
            "store",
            busSellerStoreId,
            "suspend",
            "this seller is highly inappropriate"
        );

        expect(response.statusCode).toBe(200);
    });

    it("should suspend target if provided valid data - USER", async () => {
        const response = await controlSuspension(
            app,
            adminToken,
            "user",
            createdUser.id,
            "suspend",
            "this user is highly inappropriate"
        );

        expect(response.statusCode).toBe(200);
    });

    it("should return 400 status code if tried to suspend a target more than once", async () => {
        await controlSuspension(
            app,
            adminToken,
            "product",
            flatProduct.id,
            "suspend",
            "this product is highly inappropriate"
        );

        const response = await controlSuspension(
            app,
            adminToken,
            "product",
            flatProduct.id,
            "suspend",
            "this product is highly inappropriate"
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("the product is already suspended");
    });

    it("should return 400 status code if action is 'reinstate' and the target is not suspended", async () => {
        const response = await controlSuspension(
            app,
            adminToken,
            "user",
            busSeller.id,
            "reinstate"
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("the user is not suspended");
    });

    it("should reinstate a target if provided valid data - PRODUCT", async () => {
        const response = await controlSuspension(
            app,
            adminToken,
            "product",
            flatProduct.id,
            "reinstate"
        );

        expect(response.statusCode).toBe(200);
    });

    it("should reinstate a target if provided valid data - SELLER", async () => {
        const response = await controlSuspension(
            app,
            adminToken,
            "store",
            busSellerStoreId,
            "reinstate"
        );

        expect(response.statusCode).toBe(200);
    });

    it("should reinstate a target if provided valid data - USER", async () => {
        const response = await controlSuspension(
            app,
            adminToken,
            "user",
            createdUser.id,
            "reinstate"
        );

        expect(response.statusCode).toBe(200);
    });

    afterAll(async () => {
        await deleteCreatedUser(app, createdUser.id);
        await deleteCreatedUser(app, indSeller.id);
        await deleteCreatedUser(app, busSeller.id);
    });
});
