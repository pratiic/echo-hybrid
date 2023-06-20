import supertest from "supertest";

import { app } from "../index.js";
import { prepareOrderElements } from "./utils/order.utils.js";
import {
    deleteCreatedUser,
    signInAsAdmin,
    signInAsDeliveryPersonnel,
} from "./utils.js";
import { deleteRating, provideRating } from "./utils/rating.utils.js";
import { buyProduct } from "./utils/product.utils.js";

describe("POST /api/ratings/:targetType/:targetId PROVIDE RATING", () => {
    let createdUser,
        indSeller,
        busSeller,
        busSellerStoreId,
        secondHandProduct,
        flatProduct;

    beforeAll(async () => {
        const orderElements = await prepareOrderElements(app);
        createdUser = orderElements.createdUser;
        indSeller = orderElements.indSeller;
        busSeller = orderElements.busSeller;
        secondHandProduct = orderElements.secondHandProduct;
        flatProduct = orderElements.flatProduct;

        const busSellerStoreIdRes = await supertest(app)
            .get(`/api/users`)
            .set("Authorization", `Bearer ${busSeller.token}`);
        busSellerStoreId = busSellerStoreIdRes.body.user.store.id;
    });

    it("should return 401 status code if requested by admin", async () => {
        const adminToken = await signInAsAdmin(app);
        const response = await provideRating(app, adminToken, "product", -1);

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe(
            "admin and delivery personnel are not allowed to perform this action"
        );
    });

    it("should return 401 status code if requested by delivery personnel", async () => {
        const deliveryToken = await signInAsDeliveryPersonnel(app);
        const response = await provideRating(app, deliveryToken, "product", 1);

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe(
            "admin and delivery personnel are not allowed to perform this action"
        );
    });

    // it("should return 400 status code if targetType is invalid", async () => {
    //     const response = await postReview(app, createdUser.token, "invalid", 1);

    //     expect(response.body.error).toBe(
    //         "admin and delivery personnel are not allowed to perform this action"
    //     );
    //     expect(response.statusCode).toBe(400);
    // });

    it("should return 404 status code if target is not found - PRODUCT", async () => {
        const response = await provideRating(
            app,
            createdUser.token,
            "product",
            -1
        );

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("product not found");
    });

    it("should return 404 status code if target is not found - SELLER", async () => {
        const response = await provideRating(
            app,
            createdUser.token,
            "store",
            -1
        );

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("store not found");
    });

    it("should return 400 status code if the product is second hand", async () => {
        const response = await provideRating(
            app,
            createdUser.token,
            "product",
            secondHandProduct.id
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "a second-hand product cannot be rated"
        );
    });

    it("should return 400 status code if target belongs to the requesting user - PRODUCT", async () => {
        const response = await provideRating(
            app,
            busSeller.token,
            "product",
            flatProduct.id
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("you cannot rate your own product");
    });

    it("should return 400 status code if target belongs to the requesting user - SELLER", async () => {
        const response = await provideRating(
            app,
            busSeller.token,
            "store",
            busSellerStoreId
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("you cannot rate your own store");
    });

    it("should return 400 status code if the requesting user has not bought the product", async () => {
        const response = await provideRating(
            app,
            createdUser.token,
            "product",
            flatProduct.id
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "you must buy this product before rating it"
        );
    });

    it("should return 400 status code if the requesting user has not bought from the seller", async () => {
        const response = await provideRating(
            app,
            createdUser.token,
            "store",
            busSellerStoreId
        );

        await buyProduct(
            app,
            createdUser.token,
            busSeller.token,
            flatProduct.id
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "you must buy from this seller before rating them"
        );
    });

    it("should return 400 status code if 'stars' is not provided", async () => {
        const response = await provideRating(
            app,
            createdUser.token,
            "product",
            flatProduct.id
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("stars cannot be empty");
    });

    it("should return 400 status code if 'stars' is invalid - STRING", async () => {
        const response = await provideRating(
            app,
            createdUser.token,
            "product",
            flatProduct.id,
            "1"
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            '"stars" must be one of [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]'
        );
    });

    it("should return 400 status code if 'stars' is invalid - LESS THAN 1", async () => {
        const response = await provideRating(
            app,
            createdUser.token,
            "product",
            flatProduct.id,
            0
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            '"stars" must be one of [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]'
        );
    });

    it("should return 400 status code if 'stars' is invalid - MORE THAN 5", async () => {
        const response = await provideRating(
            app,
            createdUser.token,
            "product",
            flatProduct.id,
            7
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            '"stars" must be one of [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]'
        );
    });

    it("should provide a rating if provided valid data - 3", async () => {
        const response = await provideRating(
            app,
            createdUser.token,
            "product",
            flatProduct.id,
            3
        );

        expect(response.statusCode).toBe(200);
    });

    it("should update the previous rating if rated again - 3.5", async () => {
        const response = await provideRating(
            app,
            createdUser.token,
            "product",
            flatProduct.id,
            3.5
        );

        expect(response.statusCode).toBe(200);
        expect(
            response.body.target.ratings.find(
                (rating) => rating.userId === createdUser.id
            ).stars
        ).toBe(3.5);
    });

    afterAll(async () => {
        await deleteCreatedUser(app, createdUser.id);
        await deleteCreatedUser(app, indSeller.id);
        await deleteCreatedUser(app, busSeller.id);
    });
});

describe("POST /api/ratings/:ratingId DELETE RATING", () => {
    let createdUser, indSeller, busSeller, flatProduct, ratingId;

    beforeAll(async () => {
        const orderElements = await prepareOrderElements(app);
        createdUser = orderElements.createdUser;
        indSeller = orderElements.indSeller;
        busSeller = orderElements.busSeller;
        flatProduct = orderElements.flatProduct;

        // buy and rate a product
        await buyProduct(
            app,
            createdUser.token,
            busSeller.token,
            flatProduct.id
        );
        ratingId = (
            await provideRating(
                app,
                createdUser.token,
                "product",
                flatProduct.id,
                3
            )
        ).body.target.ratings[0].id;
    });

    it("should return 404 status code if the rating does not exist", async () => {
        const response = await deleteRating(app, createdUser.token, -1);

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("rating not found");
    });

    it("should return 401 status code if the rating does not belong to the requesting user", async () => {
        const response = await deleteRating(app, indSeller.token, ratingId);

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe(
            "you are unauthorized to delete this rating"
        );
    });

    it("should delete the rating if provided valid data", async () => {
        const response = await deleteRating(app, createdUser.token, ratingId);

        expect(response.statusCode).toBe(200);
    });

    afterAll(async () => {
        await deleteCreatedUser(app, createdUser.id);
        await deleteCreatedUser(app, indSeller.id);
        await deleteCreatedUser(app, busSeller.id);
    });
});
