import supertest from "supertest";

import { app } from "../index.js";
import {
    createNewUser,
    createProduct,
    deleteCreatedStore,
    deleteCreatedUser,
    signInAsAdmin,
} from "./utils.js";

describe("POST /api/products POST PRODUCT", () => {
    let createdUser;

    beforeAll(async () => {
        createdUser = await createNewUser(app);
    });

    it("should post a product if provided valid data", async () => {
        const response = await createProduct(app, createdUser.token);

        expect(response.statusCode).toBe(201);
    });

    it("should return 400 status code if name is not provided", async () => {
        const response = await supertest(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${createdUser.token}`)
            .field(
                "description",
                "this has to be a minimum of 50 characters and i think it is now"
            )
            .field("price", 1500)
            .field("deliveryCharge", 100)
            .field("category", "electronics")
            .field("subCategory", "phone")
            .attach("images", "images/products/1.jpeg")
            .attach("images", "images/products/2.jpeg");

        await deleteCreatedStore(app, createdUser.token);

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if name is less than 5 characters", async () => {
        const response = await supertest(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${createdUser.token}`)
            .field("name", "prod")
            .field(
                "description",
                "this has to be a minimum of 50 characters and i think it is now"
            )
            .field("price", 1500)
            .field("deliveryCharge", 100)
            .field("category", "electronics")
            .field("subCategory", "phone")
            .attach("images", "images/products/1.jpeg")
            .attach("images", "images/products/2.jpeg");

        await deleteCreatedStore(app, createdUser.token);

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if name is more than 100 characters", async () => {
        const response = await supertest(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${createdUser.token}`)
            .field(
                "name",
                "latest product from a very very reputable company that does a lot of things and also makes a lot of products"
            )
            .field(
                "description",
                "this has to be a minimum of 50 characters and i think it is now"
            )
            .field("price", 1500)
            .field("deliveryCharge", 100)
            .field("category", "electronics")
            .field("subCategory", "phone")
            .attach("images", "images/products/1.jpeg")
            .attach("images", "images/products/2.jpeg");

        await deleteCreatedStore(app, createdUser.token);

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if description is not provided", async () => {
        const response = await supertest(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${createdUser.token}`)
            .field(
                "description",
                "this has to be a minimum of 50 characters and i think it is now"
            )
            .field("price", 1500)
            .field("deliveryCharge", 100)
            .field("category", "electronics")
            .field("subCategory", "phone")
            .attach("images", "images/products/1.jpeg")
            .attach("images", "images/products/2.jpeg");

        await deleteCreatedStore(app, createdUser.token);

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if description is less than 50 characters", async () => {
        const response = await supertest(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${createdUser.token}`)
            .field("description", "desc")
            .field("price", 1500)
            .field("deliveryCharge", 100)
            .field("category", "electronics")
            .field("subCategory", "phone")
            .attach("images", "images/products/1.jpeg")
            .attach("images", "images/products/2.jpeg");

        await deleteCreatedStore(app, createdUser.token);

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if description is more than 200 characters", async () => {
        const response = await supertest(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${createdUser.token}`)
            .field(
                "description",
                "description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description"
            )
            .field("price", 1500)
            .field("deliveryCharge", 100)
            .field("category", "electronics")
            .field("subCategory", "phone")
            .attach("images", "images/products/1.jpeg")
            .attach("images", "images/products/2.jpeg");

        await deleteCreatedStore(app, createdUser.token);

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if price is not provided", async () => {
        const response = await supertest(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${createdUser.token}`)
            .field("name", "new product")
            .field(
                "description",
                "this has to be a minimum of 50 characters and i think it is now"
            )
            .field("deliveryCharge", 100)
            .field("category", "electronics")
            .field("subCategory", "phone")
            .attach("images", "images/products/1.jpeg")
            .attach("images", "images/products/2.jpeg");

        await deleteCreatedStore(app, createdUser.token);

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if price is not a number", async () => {
        const response = await supertest(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${createdUser.token}`)
            .field("name", "new product")
            .field(
                "description",
                "this has to be a minimum of 50 characters and i think it is now"
            )
            .field("price", "string")
            .field("deliveryCharge", 100)
            .field("category", "electronics")
            .field("subCategory", "phone")
            .attach("images", "images/products/1.jpeg")
            .attach("images", "images/products/2.jpeg");

        await deleteCreatedStore(app, createdUser.token);

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if price is negative", async () => {
        const response = await supertest(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${createdUser.token}`)
            .field("name", "new product")
            .field(
                "description",
                "this has to be a minimum of 50 characters and i think it is now"
            )
            .field("price", -100)
            .field("deliveryCharge", 100)
            .field("category", "electronics")
            .field("subCategory", "phone")
            .attach("images", "images/products/1.jpeg")
            .attach("images", "images/products/2.jpeg");

        await deleteCreatedStore(app, createdUser.token);

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if delivery charge is not provided", async () => {
        const response = await supertest(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${createdUser.token}`)
            .field("name", "new product")
            .field(
                "description",
                "this has to be a minimum of 50 characters and i think it is now"
            )
            .field("price", 1500)
            .field("category", "electronics")
            .field("subCategory", "phone")
            .attach("images", "images/products/1.jpeg")
            .attach("images", "images/products/2.jpeg");

        await deleteCreatedStore(app, createdUser.token);

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if delivery charge is not a number", async () => {
        const response = await supertest(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${createdUser.token}`)
            .field("name", "new product")
            .field(
                "description",
                "this has to be a minimum of 50 characters and i think it is now"
            )
            .field("price", 1500)
            .field("deliveryCharge", "string")
            .field("category", "electronics")
            .field("subCategory", "phone")
            .attach("images", "images/products/1.jpeg")
            .attach("images", "images/products/2.jpeg");

        await deleteCreatedStore(app, createdUser.token);

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if delivery charge is negative", async () => {
        const response = await supertest(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${createdUser.token}`)
            .field("name", "new product")
            .field(
                "description",
                "this has to be a minimum of 50 characters and i think it is now"
            )
            .field("price", 1500)
            .field("deliveryCharge", -100)
            .field("category", "electronics")
            .field("subCategory", "phone")
            .attach("images", "images/products/1.jpeg")
            .attach("images", "images/products/2.jpeg");

        await deleteCreatedStore(app, createdUser.token);

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if delivery charge is not an integer", async () => {
        const response = await supertest(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${createdUser.token}`)
            .field("name", "new product")
            .field(
                "description",
                "this has to be a minimum of 50 characters and i think it is now"
            )
            .field("price", 1500)
            .field("deliveryCharge", 100.5)
            .field("category", "electronics")
            .field("subCategory", "phone")
            .attach("images", "images/products/1.jpeg")
            .attach("images", "images/products/2.jpeg");

        await deleteCreatedStore(app, createdUser.token);

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if category is not provided", async () => {
        const response = await supertest(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${createdUser.token}`)
            .field("name", "new product")
            .field(
                "description",
                "this has to be a minimum of 50 characters and i think it is now"
            )
            .field("price", 1500)
            .field("deliveryCharge", 100)
            .field("subCategory", "phone")
            .attach("images", "images/products/1.jpeg")
            .attach("images", "images/products/2.jpeg");

        await deleteCreatedStore(app, createdUser.token);

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if category is non-existing", async () => {
        const response = await supertest(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${createdUser.token}`)
            .field("name", "new product")
            .field(
                "description",
                "this has to be a minimum of 50 characters and i think it is now"
            )
            .field("price", 1500)
            .field("deliveryCharge", 100)
            .field("category", "non-existing-category")
            .field("subCategory", "phone")
            .attach("images", "images/products/1.jpeg")
            .attach("images", "images/products/2.jpeg");

        await deleteCreatedStore(app, createdUser.token);

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if sub category is not provided", async () => {
        const response = await supertest(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${createdUser.token}`)
            .field("name", "new product")
            .field(
                "description",
                "this has to be a minimum of 50 characters and i think it is now"
            )
            .field("price", 1500)
            .field("deliveryCharge", 100)
            .field("category", "electronics")
            .attach("images", "images/products/1.jpeg")
            .attach("images", "images/products/2.jpeg");

        await deleteCreatedStore(app, createdUser.token);

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if images are not provided", async () => {
        const response = await supertest(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${createdUser.token}`)
            .field("name", "new product")
            .field(
                "description",
                "this has to be a minimum of 50 characters and i think it is now"
            )
            .field("price", 1500)
            .field("deliveryCharge", 100)
            .field("category", "electronics")
            .field("subCategory", "phone");

        await deleteCreatedStore(app, createdUser.token);

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if tried to post product without registering as a seller", async () => {
        const createdUser = await createNewUser(app);
        const response = await createProduct(app, createdUser.token, false);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("you must register as a seller first");

        const adminToken = await signInAsAdmin(app);
        await deleteCreatedUser(app, createdUser.id, adminToken);
    });

    it("should return 400 status code if tried to post product by a business seller without registering a business", async () => {
        const createdUser = await createNewUser(app);
        await supertest(app).post("/api/store/?type=BUS");
        const response = await createProduct(app, createdUser.token, false);

        expect(response.statusCode).toBe(400);

        const adminToken = await signInAsAdmin(app);
        await deleteCreatedUser(app, createdUser.id, adminToken);
        await deleteCreatedStore(app, createdUser.token);
    });

    // it("should return 401 status code if tried to post product by a suspended seller", async () => {
    //     const createdUser = await createNewUser(app);
    //     const adminToken = await signInAsAdmin(app);
    //     const storeResponse = await supertest(app)
    //         .post("/api/stores/?type=IND")
    //         .set("Authorization", `Bearer ${createdUser.token}}`);

    //     await supertest(app)
    //         .post(
    //             `/api/suspensions/user/${storeResponse.body.store.id}/?action=suspend`
    //         )
    //         .set("Authorization", `Bearer ${adminToken}`);

    //     const productResponse = await supertest(app)
    //         .post("/api/products")
    //         .set("Authorization", `Bearer ${createdUser.token}`)
    //         .field("name", "new product")
    //         .field(
    //             "description",
    //             "this has to be a minimum of 50 characters and i think it is now"
    //         )
    //         .field("price", 1500)
    //         .field("deliveryCharge", 100)
    //         .field("category", "electronics")
    //         .field("subCategory", "phone")
    //         .attach("images", "images/products/1.jpeg")
    //         .attach("images", "images/products/2.jpeg");

    //     expect(productResponse.statusCode).toBe(401);
    // });

    afterAll(async () => {
        const adminToken = await signInAsAdmin(app);
        await deleteCreatedUser(app, createdUser.id, adminToken);
        await deleteCreatedStore(app, createdUser.token);
    });
});

describe("PATCH /api/products/:productId/images ADD PRODUCT IMAGES", () => {
    let createdUser, createdProduct;

    beforeAll(async () => {
        createdUser = await createNewUser(app);
        const productResponse = await createProduct(app, createdUser.token);
        createdProduct = productResponse.body.product;
    });

    it("should return 400 status code if images are not provided", async () => {
        const response = await supertest(app)
            .patch(`/api/products/${createdProduct.id}/images`)
            .set("Authorization", `Bearer ${createdUser.token}`);

        expect(response.statusCode).toBe(400);
    });

    it("should add images if provided valid data", async () => {
        const response = await supertest(app)
            .patch(`/api/products/${createdProduct.id}/images`)
            .set("Authorization", `Bearer ${createdUser.token}`)
            .attach("images", "images/products/1.jpeg")
            .attach("images", "images/products/2.jpeg")
            .attach("images", "images/products/2.jpeg");

        expect(response.statusCode).toBe(200);
    });

    it("should return 400 status code if the maximum limit has been reached", async () => {
        const response = await supertest(app)
            .patch(`/api/products/${createdProduct.id}/images`)
            .set("Authorization", `Bearer ${createdUser.token}`)
            .attach("images", "images/products/1.jpeg");

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "maximum limit 5 of product images reached"
        );
    });

    afterAll(async () => {
        const adminToken = await signInAsAdmin(app);
        await deleteCreatedUser(app, createdUser.id, adminToken);
    });
});

describe("DELETE /api/products/:productId/images DELETE PRODUCT IMAGE", () => {
    let createdUser, productOne, productTwo;

    beforeAll(async () => {
        createdUser = await createNewUser(app);
        const productResponseOne = await createProduct(app, createdUser.token);
        const productResponseTwo = await createProduct(
            app,
            createdUser.token,
            true,
            1
        );
        productOne = productResponseOne.body.product;
        productTwo = productResponseTwo.body.product;
    });

    it("should return 400 status code if the provided src is invalid", async () => {
        const response = await supertest(app)
            .delete(`/api/products/${productOne.id}/images`)
            .set("Authorization", `Bearer ${createdUser.token}`)
            .send("src", "non-existing-src");

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "this image does not belong to this product"
        );
    });

    it("should return 400 status code if the product has only one image", async () => {
        const response = await supertest(app)
            .delete(`/api/products/${productTwo.id}/images`)
            .set("Authorization", `Bearer ${createdUser.token}`);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "a product must have atleast one image"
        );
    });

    // it("should delete a product image is provided valid data", async () => {
    //     const response = await supertest(app)
    //         .delete(`/api/products/${createdProduct.id}/images`)
    //         .set("Authorization", `Bearer ${createdUser.token}`)
    //         .send("src", createdProduct.images[0]);

    //     expect(response.body.error).toBe("");
    //     expect(response.statusCode).toBe(200);
    // });

    afterAll(async () => {
        const adminToken = await signInAsAdmin(app);
        await deleteCreatedUser(app, createdUser.id, adminToken);
    });
});

describe("DELETE /api/products/:productId DELETE PRODUCT", () => {
    let createdUser, createdProduct;

    beforeAll(async () => {
        createdUser = await createNewUser(app);
        const productResponse = await createProduct(app, createdUser.token);
        createdProduct = productResponse.body.product;
    });

    it("should return 404 status code if tried to delete a non-exising product", async () => {
        const response = await supertest(app)
            .delete(`/api/products/-1`)
            .set("Authorization", `Bearer ${createdUser.token}`);

        expect(response.statusCode).toBe(404);
    });

    it("should delete a product if provided valid data", async () => {
        const response = await supertest(app)
            .delete(`/api/products/${createdProduct.id}`)
            .set("Authorization", `Bearer ${createdUser.token}`);

        expect(response.statusCode).toBe(200);
    });

    it("should return 404 status code if tried to delete a deleted product", async () => {
        const response = await supertest(app)
            .delete(`/api/products/${createdProduct.id}`)
            .set("Authorization", `Bearer ${createdUser.token}`);

        expect(response.statusCode).toBe(404);
    });

    afterAll(async () => {
        const adminToken = await signInAsAdmin(app);
        await deleteCreatedUser(app, createdUser.id, adminToken);
    });
});
