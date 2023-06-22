import supertest from "supertest";

import { app } from "../index.js";
import {
    deleteCreatedUser,
    signInAsAdmin,
    signInAsDeliveryPersonnel,
} from "./utils.js";
import { deleteReview, postReview } from "./utils/review.utils.js";
import { prepareOrderElements } from "./utils/order.utils.js";
import { buyProduct } from "./utils/product.utils.js";

describe("POST /api/reviews/:targetType/:targetId POST REVIEW", () => {
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
        const response = await postReview(app, adminToken, "product", 1);

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe(
            "admin and delivery personnel are not allowed to perform this action"
        );
    });

    it("should return 401 status code if requested by delivery personnel", async () => {
        const deliveryToken = await signInAsDeliveryPersonnel(app);
        const response = await postReview(app, deliveryToken, "product", 1);

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
        const response = await postReview(
            app,
            createdUser.token,
            "product",
            -1
        );

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("product not found");
    });

    it("should return 404 status code if target is not found - SELLER", async () => {
        const response = await postReview(app, createdUser.token, "store", -1);

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("store not found");
    });

    it("should return 400 status code if the product is second hand", async () => {
        const response = await postReview(
            app,
            createdUser.token,
            "product",
            secondHandProduct.id
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "a second-hand product cannot be reviewed"
        );
    });

    it("should return 400 status code if target belongs to the requesting user - PRODUCT", async () => {
        const response = await postReview(
            app,
            busSeller.token,
            "product",
            flatProduct.id
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("you cannot review your own product");
    });

    it("should return 400 status code if target belongs to the requesting user - SELLER", async () => {
        const response = await postReview(
            app,
            busSeller.token,
            "store",
            busSellerStoreId
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("you cannot review your own store");
    });

    it("should return 400 status code if the requesting user has not bought the product", async () => {
        const response = await postReview(
            app,
            createdUser.token,
            "product",
            flatProduct.id
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "you must buy this product before reviewing it"
        );
    });

    it("should return 400 status code if the requesting user has not bought from the seller", async () => {
        const response = await postReview(
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
            "you must buy from this seller before reviewing them"
        );
    });

    it("should return 400 status code if text is not provided", async () => {
        const response = await postReview(
            app,
            createdUser.token,
            "product",
            flatProduct.id
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("text cannot be empty");
    });

    it("should return 400 status code if text is less than 5 characters", async () => {
        const response = await postReview(
            app,
            createdUser.token,
            "product",
            flatProduct.id,
            "nice"
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "text must be atleast 5 characters long"
        );
    });

    it("should return 400 status code if text is more than 200 characters", async () => {
        const response = await postReview(
            app,
            createdUser.token,
            "product",
            flatProduct.id,
            "this is a nice product this is a nice product this is a nice product this is a nice product this is a nice product this is a nice product this is a nice product this is a nice product this is a nice product this is a nice product this is a nice product this is a nice product this is a nice product this is a nice product this is a nice product"
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "text cannot be more than 200 characters long"
        );
    });

    it("should return 400 status code if image is invalid", async () => {
        const response = await postReview(
            app,
            createdUser.token,
            "product",
            flatProduct.id,
            "this is a nice product",
            "not-image.txt"
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "supported file types are .jpeg, .jpg, .png"
        );
    });

    it("should return 400 status code if image is larger than 3 mb", async () => {
        const response = await postReview(
            app,
            createdUser.token,
            "product",
            flatProduct.id,
            "this is a nice product",
            "large.jpeg"
        );

        expect(response.body.error).toBe("File too large");
    });

    it("should post a review if provided valid data - PRODUCT WITH IMAGE", async () => {
        const response = await postReview(
            app,
            createdUser.token,
            "product",
            flatProduct.id,
            "this is a nice product",
            "comment.jpeg"
        );

        expect(response.statusCode).toBe(201);
    });

    it("should post a review if provided valid data - PRODUCT WITHOUT IMAGE", async () => {
        const response = await postReview(
            app,
            createdUser.token,
            "product",
            flatProduct.id,
            "this is a nice product"
        );

        expect(response.statusCode).toBe(201);
    });

    it("should post a review if provided valid data - SELLER WITH IMAGE", async () => {
        const response = await postReview(
            app,
            createdUser.token,
            "store",
            busSellerStoreId,
            "this is a nice seller",
            "comment.jpeg"
        );

        expect(response.statusCode).toBe(201);
    });

    it("should post a review if provided valid data - SELLER WITHOUT IMAGE", async () => {
        const response = await postReview(
            app,
            createdUser.token,
            "store",
            busSellerStoreId,
            "this is a nice seller"
        );

        expect(response.statusCode).toBe(201);
    });

    afterAll(async () => {
        await deleteCreatedUser(app, createdUser.id);
        await deleteCreatedUser(app, indSeller.id);
        await deleteCreatedUser(app, busSeller.id);
    });
});

describe("DELETE /api/reviews/:reviewId DELETE REVIEW", () => {
    let createdUser, indSeller, busSeller, flatProduct, reviewId;

    beforeAll(async () => {
        const orderElements = await prepareOrderElements(app);
        createdUser = orderElements.createdUser;
        indSeller = orderElements.indSeller;
        busSeller = orderElements.busSeller;
        flatProduct = orderElements.flatProduct;

        // buy and review a product
        await buyProduct(
            app,
            createdUser.token,
            busSeller.token,
            flatProduct.id
        );
        reviewId = (
            await postReview(
                app,
                createdUser.token,
                "product",
                flatProduct.id,
                "this is a nice product"
            )
        ).body.review.id;
    });

    it("should return 404 status code if the review does not exist", async () => {
        const response = await deleteReview(app, createdUser.token, -1);

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("review not found");
    });

    it("should return 401 status code if the review does not belong to the requesting user", async () => {
        const response = await deleteReview(app, indSeller.token, reviewId);


        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe(
            "you are unauthorized to delete this review"
        );
    });

    it("should delete the review if provided valid data", async () => {
        const response = await deleteReview(app, createdUser.token, reviewId);

        expect(response.statusCode).toBe(200);
    });

    afterAll(async () => {
        await deleteCreatedUser(app, createdUser.id);
        await deleteCreatedUser(app, indSeller.id);
        await deleteCreatedUser(app, busSeller.id);
    });
});
