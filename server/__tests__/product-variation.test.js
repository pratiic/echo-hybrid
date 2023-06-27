import supertest from "supertest";

import { app } from "../index.js";
import {
    createBusiness,
    createNewUser,
    createProduct,
    deleteCreatedUser,
    setProductVariations,
} from "./utils.js";

describe("POST /api/product-variations SET PRODUCT VARIATION", () => {
    it("should return 400 status code if tried to set product variations of a second hand product", async () => {
        const createdUser = await createNewUser(app);
        const createdProduct = (await createProduct(app, createdUser.token))
            .body.product;

        const response = await setProductVariations(
            app,
            createdUser.token,
            createdProduct.id,
            false
        );

        await deleteCreatedUser(app, createdUser.id);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "second hand products and products with flat stock are not allowed to have variations"
        );
    });

    it("should return 400 status code if tried to set product variations of a flat stocked product", async () => {
        const createdUser = await createNewUser(app);
        await createBusiness(app, createdUser.token);
        const productResponse = await createProduct(
            app,
            createdUser.token,
            false,
            2,
            "flat"
        );
        const createdProduct = productResponse.body.product;

        const response = await setProductVariations(
            app,
            createdUser.token,
            createdProduct.id,
            false
        );

        await deleteCreatedUser(app, createdUser.id);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "second hand products and products with flat stock are not allowed to have variations"
        );
    });

    it("should return 400 status code if variations are not provided", async () => {
        const createdUser = await createNewUser(app);
        const response = await setProductVariations(
            app,
            createdUser.token,
            null,
            true,
            null
        );

        await deleteCreatedUser(app, createdUser.id);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("variations must be an array");
    });

    it("should return 400 status code if provided an empty variations array", async () => {
        const createdUser = await createNewUser(app);

        const response = await setProductVariations(
            app,
            createdUser.token,
            null,
            true,
            []
        );

        await deleteCreatedUser(app, createdUser.id);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("provide atleast one variation");
    });

    it("should return 400 status code if label is not provided", async () => {
        const createdUser = await createNewUser(app);

        const response = await setProductVariations(
            app,
            createdUser.token,
            null,
            true,
            [
                {
                    options: ["one", "two"],
                },
            ]
        );

        await deleteCreatedUser(app, createdUser.id);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("label cannot be empty");
    });

    it("should return 400 status code if label is less than 3 characters", async () => {
        const createdUser = await createNewUser(app);
        await createBusiness(app, createdUser.token);
        const createdProduct = (
            await createProduct(app, createdUser.token, false, 2, "varied")
        ).body.product;

        const response = await supertest(app)
            .post(`/api/product-variations/${createdProduct.id}`)
            .set("Authorization", `Bearer ${createdUser.token}`)
            .send({
                variations: [
                    {
                        label: "on",
                        options: ["one", "two"],
                    },
                ],
            });

        await deleteCreatedUser(app, createdUser.id);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "label must be atleast 3 characters long"
        );
    });

    it("should return 400 status code if label is more than 15 characters", async () => {
        const createdUser = await createNewUser(app);
        await createBusiness(app, createdUser.token);
        const createdProduct = (
            await createProduct(app, createdUser.token, false, 2, "varied")
        ).body.product;

        const response = await supertest(app)
            .post(`/api/product-variations/${createdProduct.id}`)
            .set("Authorization", `Bearer ${createdUser.token}`)
            .send({
                variations: [
                    {
                        label: "one one one one one",
                        options: ["one", "two"],
                    },
                ],
            });

        await deleteCreatedUser(app, createdUser.id);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "label cannot be more than 15 characters long"
        );
    });

    it("should return 400 status code if options are not provided", async () => {
        const createdUser = await createNewUser(app);
        await createBusiness(app, createdUser.token);
        const createdProduct = (
            await createProduct(app, createdUser.token, false, 2, "varied")
        ).body.product;

        const response = await supertest(app)
            .post(`/api/product-variations/${createdProduct.id}`)
            .set("Authorization", `Bearer ${createdUser.token}`)
            .send({
                variations: [
                    {
                        label: "one",
                    },
                ],
            });

        await deleteCreatedUser(app, createdUser.id);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("options must be an array");
    });

    it("should return 400 status code if options is not an array", async () => {
        const createdUser = await createNewUser(app);
        await createBusiness(app, createdUser.token);
        const createdProduct = (
            await createProduct(app, createdUser.token, false, 2, "varied")
        ).body.product;

        const response = await supertest(app)
            .post(`/api/product-variations/${createdProduct.id}`)
            .set("Authorization", `Bearer ${createdUser.token}`)
            .send({
                variations: [
                    {
                        label: "one",
                        options: "string",
                    },
                ],
            });

        await deleteCreatedUser(app, createdUser.id);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("options must be an array");
    });

    it("should return 400 status code if options has less than two elements", async () => {
        const createdUser = await createNewUser(app);
        await createBusiness(app, createdUser.token);
        const createdProduct = (
            await createProduct(app, createdUser.token, false, 2, "varied")
        ).body.product;

        const response = await supertest(app)
            .post(`/api/product-variations/${createdProduct.id}`)
            .set("Authorization", `Bearer ${createdUser.token}`)
            .send({
                variations: [
                    {
                        label: "one",
                        options: ["one"],
                    },
                ],
            });

        await deleteCreatedUser(app, createdUser.id);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("provide atleast two options for one");
    });

    it("should return 400 status code if an options is more than 15 characters", async () => {
        const createdUser = await createNewUser(app);
        await createBusiness(app, createdUser.token);
        const createdProduct = (
            await createProduct(app, createdUser.token, false, 2, "varied")
        ).body.product;

        const response = await supertest(app)
            .post(`/api/product-variations/${createdProduct.id}`)
            .set("Authorization", `Bearer ${createdUser.token}`)
            .send({
                variations: [
                    {
                        label: "one",
                        options: ["one", "two two two two two"],
                    },
                ],
            });

        await deleteCreatedUser(app, createdUser.id);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "option cannot be more than 15 characters long"
        );
    });

    it("should set product variations if provided valid data", async () => {
        const createdUser = await createNewUser(app);
        const response = await setProductVariations(app, createdUser.token);

        await deleteCreatedUser(app, createdUser.id);

        expect(response.statusCode).toBe(200);
    });

    it("should return 400 status code if products variations are already set", async () => {
        const createdUser = await createNewUser(app);
        await createBusiness(app, createdUser.token);
        const createdProduct = (
            await createProduct(app, createdUser.token, false, 2, "varied")
        ).body.product;

        await supertest(app)
            .post(`/api/product-variations/${createdProduct.id}`)
            .set("Authorization", `Bearer ${createdUser.token}`)
            .send({
                variations: [
                    {
                        label: "one",
                        options: ["one", "two"],
                    },
                ],
            });

        const response = await setProductVariations(
            app,
            createdUser.token,
            createdProduct.id,
            false
        );

        await deleteCreatedUser(app, createdUser.id);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("product variations already set");
    });
});
