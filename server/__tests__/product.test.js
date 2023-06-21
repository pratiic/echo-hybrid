import supertest from "supertest";

import { app } from "../index.js";
import {
    createBusiness,
    createNewUser,
    createProduct,
    deleteCreatedUser,
    signInAsAdmin,
} from "./utils.js";
import { controlSuspension } from "./utils/suspension.utils.js";

describe("POST /api/products POST PRODUCT", () => {
    let createdUser;

    beforeAll(async () => {
        createdUser = await createNewUser(app, true, true);
        await supertest(app)
            .post("/api/stores/?type=IND")
            .set("Authorization", `Bearer ${createdUser.token}`);
    });

    // it("should return 401 status code if tried to post product by a suspended seller", async () => {
    //     const newUser = await createNewUser(app, true, true);
    //     const adminToken = await signInAsAdmin(app);

    //     const storeResponse = await supertest(app)
    //         .post("/api/stores/?type=IND")
    //         .set("Authorization", `Bearer ${newUser.token}}`);

    //     await controlSuspension(
    //         app,
    //         adminToken,
    //         "seller",
    //         storeResponse.body.store.id,
    //         "suspend",
    //         "this seller is highly inappropriate"
    //     );

    //     const productResponse = await createProduct(app, newUser.token, false);

    //     await deleteCreatedUser(app, newUser.id);

    //     expect(productResponse.statusCode).toBe(401);
    // });

    it("should return 400 status code if name is not provided", async () => {
        const response = await supertest(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${createdUser.token}`);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("name cannot be empty");
    });

    it("should return 400 status code if name is less than 5 characters", async () => {
        const response = await supertest(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${createdUser.token}`)
            .field("name", "prod");

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "name must be atleast 5 characters long"
        );
    });

    it("should return 400 status code if name is more than 100 characters", async () => {
        const response = await supertest(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${createdUser.token}`)
            .field(
                "name",
                "latest product from a very very reputable company that does a lot of things and also makes a lot of products"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "name cannot be more than 100 characters long"
        );
    });

    it("should return 400 status code if description is not provided", async () => {
        const response = await supertest(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${createdUser.token}`)
            .field("name", "new product");

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("description cannot be empty");
    });

    it("should return 400 status code if description is less than 50 characters", async () => {
        const response = await supertest(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${createdUser.token}`)
            .field("name", "new product")
            .field("description", "desc");

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "description must be atleast 50 characters long"
        );
    });

    it("should return 400 status code if description is more than 200 characters", async () => {
        const response = await supertest(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${createdUser.token}`)
            .field("name", "new product")
            .field(
                "description",
                "description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description description"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "description cannot be more than 200 characters long"
        );
    });

    it("should return 400 status code if price is not provided", async () => {
        const response = await supertest(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${createdUser.token}`)
            .field("name", "new product")
            .field(
                "description",
                "this has to be a minimum of 50 characters and i think it is now"
            );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("price cannot be empty");
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
            .field("price", "string");

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('"price" must be a number');
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
            .field("price", -100);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('"price" must be a positive number');
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
            .field("price", 1500);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("deliveryCharge cannot be empty");
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
            .field("deliveryCharge", "string");

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('"deliveryCharge" must be a number');
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
            .field("deliveryCharge", -100);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            '"deliveryCharge" must be a positive number'
        );
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
            .field("deliveryCharge", 100.5);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('"deliveryCharge" must be an integer');
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
            .field("deliveryCharge", 100);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("category cannot be empty");
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
            .field("category", "electronics");

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("subCategory cannot be empty");
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

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("provide at least one image");
    });

    it("should return 400 status code if tried to post product without registering as a seller", async () => {
        const createdUser = await createNewUser(app);
        const response = await createProduct(app, createdUser.token, false);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("you must register as a seller first");

        await deleteCreatedUser(app, createdUser.id);
    });

    it("should return 400 status code if tried to post product by a business seller without registering a business", async () => {
        const createdUser = await createNewUser(app, true, true);
        await supertest(app)
            .post("/api/stores/?type=BUS")
            .set("Authorization", `Bearer ${createdUser.token}`);
        const response = await createProduct(app, createdUser.token, false);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("you must register a business first");

        await deleteCreatedUser(app, createdUser.id);
    });

    it("should post a product if provided valid data - SECOND HAND", async () => {
        const response = await createProduct(app, createdUser.token);

        expect(response.statusCode).toBe(201);
        expect(response.body.product.isSecondHand).toBe(true);
    });

    it("should return 400 status code if it is a business seller and stockType is not provided", async () => {
        await deleteCreatedUser(app, createdUser.id);
        createdUser = await createNewUser(app, true, true);
        await supertest(app)
            .post("/api/stores/?type=BUS")
            .set("Authorization", `Bearer ${createdUser.token}`);

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

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("stockType cannot be empty");
    });

    it("should return 400 status code if it is a business seller and stockType is not valid", async () => {
        await deleteCreatedUser(app, createdUser.id);
        createdUser = await createNewUser(app, true, true);
        await createBusiness(app, createdUser.token);

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
            .field("subCategory", "phone")
            .field("stockType", "invalid-stock");

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            '"stockType" must be one of [flat, varied]'
        );
    });

    it("should post a product if provided valid data - BRAND NEW FLAT", async () => {
        const response = await createProduct(
            app,
            createdUser.token,
            false,
            2,
            "flat"
        );

        expect(response.statusCode).toBe(201);
        expect(response.body.product.stockType).toBe("flat");
    });

    it("should post a product if provided valid data - BRAND NEW FLAT", async () => {
        const response = await createProduct(app, createdUser.token, false);

        expect(response.statusCode).toBe(201);
        expect(response.body.product.stockType).toBe("varied");
    });

    afterAll(async () => {
        await deleteCreatedUser(app, createdUser.id);
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
        await deleteCreatedUser(app, createdUser.id);
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

    it("should return 401 status code if the product does not belong to the requesting user", async () => {
        const anotherUser = await createNewUser(app);

        const response = await supertest(app)
            .delete(`/api/products/${productOne.id}/images`)
            .set("Authorization", `Bearer ${anotherUser.token}`)
            .send("src", "non-existing-src");

        await deleteCreatedUser(app, anotherUser.id);

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe(
            "you are not allowed to make changes to this product"
        );
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

    it("should return 401 status code if the product does not belong to the requesting user", async () => {
        const anotherUser = await createNewUser(app);

        const response = await supertest(app)
            .delete(`/api/products/${createdProduct.id}`)
            .set("Authorization", `Bearer ${anotherUser.token}`);

        await deleteCreatedUser(app, anotherUser.id);

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe(
            "you are not allowed to make changes to this product"
        );
    });

    it("should return 404 status code if tried to delete a non-exising product", async () => {
        const response = await supertest(app)
            .delete(`/api/products/-1`)
            .set("Authorization", `Bearer ${createdUser.token}`);

        expect(response.statusCode).toBe(404);
    });

    it("should return 401 status code if tried to delete someone else's product", async () => {
        const anotherUser = await createNewUser(app);

        const response = await supertest(app)
            .delete(`/api/products/${createdProduct.id}`)
            .set("Authorization", `Bearer ${anotherUser.token}`);

        await deleteCreatedUser(app, anotherUser.id);

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe(
            "you are not allowed to make changes to this product"
        );
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
