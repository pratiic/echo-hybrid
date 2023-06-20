import supertest from "supertest";

import { app } from "../index.js";
import {
    createBusiness,
    createNewUser,
    createProduct,
    deleteCreatedUser,
    setStock,
    signInAsAdmin,
} from "./utils.js";

describe("POST /api/carts CREATE USER CART", () => {
    let createdUser;

    beforeAll(async () => {
        createdUser = await createNewUser(app);
    });

    it("should return 401 status code if requested by admin", async () => {
        const adminToken = await signInAsAdmin(app);

        const response = await supertest(app)
            .post("/api/carts")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(401);
    });

    it("should create the shopping cart of the requesting user if the requesting user is not admin or delivery personnel", async () => {
        const response = await supertest(app)
            .post("/api/carts")
            .set("Authorization", `Bearer ${createdUser.token}`);

        expect(response.statusCode).toBe(201);
    });

    afterAll(async () => {
        await deleteCreatedUser(app, createdUser.id);
    });
});

describe("POST /api/carts/:productId SET CART ITEM", () => {
    let createdUser,
        individualSeller,
        businessSeller,
        secondHandProduct,
        flatStockedProduct,
        variedStockedProduct;

    beforeAll(async () => {
        createdUser = await createNewUser(app);

        individualSeller = await createNewUser(app);
        secondHandProduct = (await createProduct(app, individualSeller.token))
            .body.product;
        console.log("pratiic", secondHandProduct);

        businessSeller = await createNewUser(app);
        await createBusiness(app, businessSeller.token);
        const flatStockedProductRes = await createProduct(
            app,
            businessSeller.token,
            false,
            2,
            "flat"
        );
        flatStockedProduct = flatStockedProductRes.body.product;
        const variedStockedProductRes = await createProduct(
            app,
            businessSeller.token,
            false
        );
        variedStockedProduct = variedStockedProductRes.body.product;
    });

    it("should return 404 status code if the product does not exist", async () => {
        const response = await setCartItem(app, createdUser.token, -1);

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("product not found");
    });

    it("should set the product to the cart - SECOND HAND", async () => {
        const response = await setCartItem(
            app,
            createdUser.token,
            secondHandProduct.id
        );

        expect(response.statusCode).toBe(201);
    });

    it("should return 400 status code if the product already exists in the cart - SECOND HAND", async () => {
        const secondHandProduct = (
            await createProduct(app, individualSeller.token)
        ).body.product;

        await setCartItem(app, createdUser.token, secondHandProduct.id);

        const response = await setCartItem(
            app,
            createdUser.token,
            secondHandProduct.id
        );

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if the product stock has not been set - BRAND NEW", async () => {
        const response = await setCartItem(
            app,
            createdUser.token,
            flatStockedProduct.id
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("this product is not active yet");
    });

    it("should return 400 status code if quantity is not provided - BRAND NEW FLAT", async () => {
        const response = await setCartItem(
            app,
            createdUser.token,
            flatStockedProduct.id,
            {
                quantity: null,
            },
            true,
            "flat",
            businessSeller.token
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('"quantity" must be a number');
    });

    it("should return 400 status code if quantity is not a number - BRAND NEW FLAT", async () => {
        const response = await setCartItem(
            app,
            createdUser.token,
            flatStockedProduct.id,
            {
                quantity: "string",
            },
            true,
            "flat",
            businessSeller.token
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('"quantity" must be a number');
    });

    it("should return 400 status code if quantity is negative - BRAND NEW FLAT", async () => {
        const response = await setCartItem(
            app,
            createdUser.token,
            flatStockedProduct.id,
            {
                quantity: -1,
            },
            true,
            "flat",
            businessSeller.token
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            '"quantity" must be a positive number'
        );
    });

    it("should add the product to the cart if provided valid data - BRAND NEW FLAT", async () => {
        const response = await setCartItem(
            app,
            createdUser.token,
            flatStockedProduct.id,
            {
                quantity: 1,
            },
            true,
            "flat",
            businessSeller.token
        );

        expect(response.statusCode).toBe(200);
    });

    it("should update the product quantity if it already exists in the cart - BRAND NEW FLAT", async () => {
        const flatStockedProduct = (
            await createProduct(app, businessSeller.token, false, 2, "flat")
        ).body.product;

        await setCartItem(
            app,
            createdUser.token,
            flatStockedProduct.id,
            {
                quantity: 1,
            },
            true,
            "flat",
            businessSeller.token
        );

        const response = await setCartItem(
            app,
            createdUser.token,
            flatStockedProduct.id,
            {
                quantity: 2,
            },
            true,
            "flat",
            businessSeller.token
        );

        expect(response.statusCode).toBe(200);
        expect(response.body.item.quantity).toBe(2);
    });

    it("should add the product to the shopping cart even if the requested quantity is greater than available - BRAND NEW FLAT", async () => {
        const response = await setCartItem(
            app,
            createdUser.token,
            flatStockedProduct.id,
            {
                quantity: 100,
            },
            true,
            "flat",
            businessSeller.token
        );

        expect(response.statusCode).toBe(200);
    });

    it("should return 400 status code if variantId is not provided - BRAND NEW VARIED", async () => {
        const response = await setCartItem(
            app,
            createdUser.token,
            variedStockedProduct.id,
            {
                quantity: 1,
            },
            true,
            "varied",
            businessSeller.token
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("variantId cannot be empty");
    });

    it("should return 400 status code if variantId is not string - BRAND NEW VARIED", async () => {
        const response = await setCartItem(
            app,
            createdUser.token,
            variedStockedProduct.id,
            {
                quantity: 1,
                variantId: 1,
            },
            true,
            "varied",
            businessSeller.token
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('"variantId" must be a string');
    });

    it("should return 404 status code if variantId is invalid - BRAND NEW VARIED", async () => {
        const response = await setCartItem(
            app,
            createdUser.token,
            variedStockedProduct.id,
            {
                quantity: 1,
                variantId: "invalid-id",
            },
            true,
            "varied",
            businessSeller.token
        );

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("variant not found");
    });

    it("should return 400 status code if quantity is not provided - BRAND NEW VARIED", async () => {
        const response = await setCartItem(
            app,
            createdUser.token,
            variedStockedProduct.id,
            {
                variantId: "variant-id",
            },
            true,
            "varied",
            businessSeller.token
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('"quantity" must be a number');
    });

    it("should add the product to the shopping cart if provided valid data - BRAND NEW VARIED", async () => {
        const response = await setCartItem(
            app,
            createdUser.token,
            variedStockedProduct.id,
            {
                variantId: "red",
                quantity: 1,
            },
            true,
            "varied",
            businessSeller.token
        );

        expect(response.statusCode).toBe(200);
    });

    it("should update the quantity of the product variant if it already exists - BRAND NEW VARIED", async () => {
        const variedStockedProduct = (
            await createProduct(app, businessSeller.token, false)
        ).body.product;

        await setCartItem(
            app,
            createdUser.token,
            variedStockedProduct.id,
            {
                variantId: "red",
                quantity: 1,
            },
            true,
            "varied",
            businessSeller.token
        );

        const response = await setCartItem(
            app,
            createdUser.token,
            variedStockedProduct.id,
            {
                variantId: "red",
                quantity: 2,
            },
            true,
            "varied",
            businessSeller.token
        );

        expect(response.statusCode).toBe(200);
        expect(response.body.item.quantity).toBe(2);
    });

    it("should add the product even if the available quantity of the request variant is greater than available - BRAND NEW VARIED", async () => {
        const response = await setCartItem(
            app,
            createdUser.token,
            variedStockedProduct.id,
            {
                variantId: "red",
                quantity: 100,
            },
            true,
            "varied",
            businessSeller.token
        );

        expect(response.statusCode).toBe(200);
    });

    afterAll(async () => {
        await deleteCreatedUser(app, createdUser.id);
        await deleteCreatedUser(app, individualSeller.id);
        await deleteCreatedUser(app, businessSeller.id);
    });
});

describe("DELETE /api/carts/itemId REMOVE CART ITEM", () => {
    let createdUser, createdSeller, createdProduct;

    beforeAll(async () => {
        const cartElements = await prepareCartElements();
        createdUser = cartElements.createdUser;
        createdSeller = cartElements.createdSeller;
        createdProduct = cartElements.createdProduct;
    });

    it("should return 400 status code if the requesting user does not have a shopping cart", async () => {
        const response = await supertest(app)
            .delete(`/api/carts/1`)
            .set("Authorization", `Bearer ${createdUser.token}`);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("you do not have a shopping cart");
    });

    it("should return 400 status code if itemId is non-existing", async () => {
        await supertest(app)
            .post("/api/carts")
            .set("Authorization", `Bearer ${createdUser.token}`);

        const response = await supertest(app)
            .delete(`/api/carts/-1`)
            .set("Authorization", `Bearer ${createdUser.token}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe(
            "cart item not found in your shopping cart"
        );
    });

    it("should remove the cart item if provided valid data", async () => {
        const cartItemResponse = await setCartItem(
            app,
            createdUser.token,
            createdProduct.id,
            {
                variantId: "red",
                quantity: 1,
            },
            true,
            "varied",
            createdSeller.token
        );

        const response = await supertest(app)
            .delete(`/api/carts/${cartItemResponse.body.item.id}`)
            .set("Authorization", `Bearer ${createdUser.token}`);

        expect(response.statusCode).toBe(200);
    });

    afterAll(async () => {
        await deleteCreatedUser(app, createdUser.id);
        await deleteCreatedUser(app, createdSeller.id);
    });
});

describe("GET /api/carts/checkout CHECK ORDER ABILITY", () => {
    let createdUser, createdSeller, createdProduct;

    beforeAll(async () => {
        const cartElements = await prepareCartElements();
        createdUser = cartElements.createdUser;
        createdSeller = cartElements.createdSeller;
        createdProduct = cartElements.createdProduct;
    });

    it("should return 400 status code if the requesting user does not have a shopping cart", async () => {
        const response = await supertest(app)
            .get("/api/carts/checkout")
            .set("Authorization", `Bearer ${createdUser.token}`);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("you do not have a shopping cart");
    });

    it("should return 400 status code if the shopping cart is empty", async () => {
        await supertest(app)
            .post("/api/carts")
            .set("Authorization", `Bearer ${createdUser.token}`);

        const response = await supertest(app)
            .get("/api/carts/checkout")
            .set("Authorization", `Bearer ${createdUser.token}`);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "there are no items in your shopping cart"
        );
    });

    it("should return an array of items that cannot be ordered", async () => {
        await setCartItem(
            app,
            createdUser.token,
            createdProduct.id,
            {
                variantId: "red",
                quantity: 1,
            },
            true,
            "varied",
            createdSeller.token
        );

        const response = await supertest(app)
            .get("/api/carts/checkout")
            .set("Authorization", `Bearer ${createdUser.token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("cannotOrder");
    });

    afterAll(async () => {
        await deleteCreatedUser(app, createdUser.id);
        await deleteCreatedUser(app, createdSeller.id);
    });
});

async function prepareCartElements() {
    const createdUser = await createNewUser(app);

    const createdSeller = await createNewUser(app);
    await createBusiness(app, createdSeller.token);
    const createdProduct = (
        await createProduct(app, createdSeller.token, false)
    ).body.product;

    return { createdUser, createdSeller, createdProduct };
}

async function setCartItem(
    app,
    token,
    productId,
    cartData,
    setStk,
    stockType,
    sellerToken
) {
    if (setStk) {
        const stockData =
            stockType === "flat"
                ? { quantity: 3 }
                : { variants: [{ color: "red", quantity: 3 }] };

        await setStock(app, sellerToken, productId, stockData, sellerToken);
    }

    const response = await supertest(app)
        .post(`/api/carts/${productId}`)
        .set("Authorization", `Bearer ${token}`)
        .send(cartData);

    return response;
}
