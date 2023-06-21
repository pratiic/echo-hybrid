import supertest from "supertest";

import { app } from "../index.js";
import {
    createBusiness,
    createNewUser,
    createProduct,
    deleteCreatedUser,
    setStock,
} from "./utils.js";

describe("POST /api/stocks/:productId SET STOCK", () => {
    let createdUser, flatStockedProduct, variedStockedProduct;

    beforeAll(async () => {
        createdUser = await createNewUser(app);
        await createBusiness(app, createdUser.token);

        flatStockedProduct = (
            await createProduct(app, createdUser.token, false, 2, "flat")
        ).body.product;
        variedStockedProduct = (
            await createProduct(app, createdUser.token, false)
        ).body.product;
    });

    it("should return 400 status code if tried to set stock of a second hand product", async () => {
        const createdUser = await createNewUser(app);
        const secondHandProduct = (await createProduct(app, createdUser.token))
            .body.product;

        const response = await supertest(app)
            .post(`/api/stocks/${secondHandProduct.id}`)
            .set("Authorization", `Bearer ${createdUser.token}`);

        await deleteCreatedUser(app, createdUser.id);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "second hand products are not allowed to have a stock"
        );
    });

    it("should return 400 status code if quantity is not provided - FLAT", async () => {
        const response = await setStock(
            app,
            createdUser.token,
            flatStockedProduct.id
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("quantity cannot be empty");
    });

    it("should return 400 status code if quantity is not a number - FLAT", async () => {
        const response = await setStock(
            app,
            createdUser.token,
            flatStockedProduct.id,
            { quantity: "string" }
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('"quantity" must be a number');
    });

    it("should return 400 status code if quantity is less than 0 - FLAT", async () => {
        const response = await setStock(
            app,
            createdUser.token,
            flatStockedProduct.id,
            { quantity: -1 }
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "quantity must be atleast 0 characters long"
        );
    });

    it("should set stock if provided valid data - FLAT", async () => {
        const response = await setStock(
            app,
            createdUser.token,
            flatStockedProduct.id,
            { quantity: 1 }
        );

        expect(response.statusCode).toBe(200);
    });

    it("should update quantity if the stock is already set - FLAT", async () => {
        const flatStockedProduct = (
            await createProduct(app, createdUser.token, false, 2, "flat")
        ).body.product;

        await setStock(app, createdUser.token, flatStockedProduct.id, {
            quantity: 1,
        });

        const response = await setStock(
            app,
            createdUser.token,
            flatStockedProduct.id,
            { quantity: 2 }
        );

        expect(response.statusCode).toBe(200);
        expect(response.body.stock.quantity).toBe(2);
    });

    it("should return 400 status code if tried to set stock before setting product variations - VARIED", async () => {
        const response = await setStock(
            app,
            createdUser.token,
            variedStockedProduct.id
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "product variations must be set before setting stock"
        );
    });

    it("should return 400 status code if variants is not provided - VARIED", async () => {
        const response = await setStock(
            app,
            createdUser.token,
            variedStockedProduct.id,
            {
                variants: null,
            },
            true
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("provide an array of variants");
    });

    it("should return 400 status code if provided an empty array of variants - VARIED", async () => {
        const response = await setStock(
            app,
            createdUser.token,
            variedStockedProduct.id,
            {
                variants: [],
            },
            true
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("provide an array of variants");
    });

    it("should return 400 status code if quantity is not provided - VARIED", async () => {
        const response = await setStock(
            app,
            createdUser.token,
            variedStockedProduct.id,
            {
                variants: [{}],
            },
            true
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("quantity cannot be empty");
    });

    it("should return 400 status code if label is not provided - VARIED", async () => {
        const response = await setStock(
            app,
            createdUser.token,
            variedStockedProduct.id,
            {
                variants: [
                    {
                        quantity: 1,
                    },
                ],
            },
            true
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("color is required");
    });

    it("should return 400 status code if label is invalid - VARIED", async () => {
        const response = await setStock(
            app,
            createdUser.token,
            variedStockedProduct.id,
            {
                variants: [
                    {
                        quantity: 1,
                        color: "invalid-value",
                    },
                ],
            },
            true
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("the value for color is invalid");
    });

    it("should return 400 status code if a duplicate variant are provided - VARIED", async () => {
        const response = await setStock(
            app,
            createdUser.token,
            variedStockedProduct.id,
            {
                variants: [
                    {
                        quantity: 1,
                        color: "red",
                    },
                    {
                        quantity: 1,
                        color: "red",
                    },
                ],
            },
            true
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("duplicate variant provided");
    });

    it("should return 400 status code if quantity is not provided - VARIED", async () => {
        const response = await setStock(
            app,
            createdUser.token,
            variedStockedProduct.id,
            {
                variants: [
                    {
                        color: "color",
                    },
                ],
            },
            true
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("quantity cannot be empty");
    });

    it("should set stock is provided valid data - VARIED", async () => {
        const response = await setStock(
            app,
            createdUser.token,
            variedStockedProduct.id,
            {
                variants: [
                    {
                        quantity: 1,
                        color: "red",
                    },
                ],
            },
            true
        );

        expect(response.statusCode).toBe(200);
    });

    it("should update the quantity of already existing variants - VARIED", async () => {
        const variedStockedProduct = (
            await createProduct(app, createdUser.token, false)
        ).body.product;

        await setStock(
            app,
            createdUser.token,
            variedStockedProduct.id,
            {
                variants: [
                    {
                        quantity: 1,
                        color: "red",
                    },
                    {
                        quantity: 3,
                        color: "blue",
                    },
                    {
                        quantity: 1,
                        color: "yellow",
                    },
                ],
            },
            true
        );

        const response = await setStock(
            app,
            createdUser.token,
            variedStockedProduct.id,
            {
                variants: [
                    {
                        quantity: 2,
                        color: "red",
                    },
                    {
                        quantity: 2,
                        color: "blue",
                    },
                ],
            },
            true
        );

        expect(response.statusCode).toBe(200);
        expect(
            response.body.stock.variants.find((variant) => variant.id === "red")
                .quantity
        ).toBe(2);
        expect(
            response.body.stock.variants.find(
                (variant) => variant.id === "blue"
            ).quantity
        ).toBe(2);
    });

    afterAll(async () => {
        await deleteCreatedUser(app, createdUser.id);
    });
});
