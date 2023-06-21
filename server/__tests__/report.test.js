import supertest from "supertest";

import { app } from "../index.js";
import { prepareOrderElements } from "./utils/order.utils.js";
import { buyProduct } from "./utils/product.utils.js";
import { postReview } from "./utils/review.utils.js";
import { deleteReport, reportTarget } from "./utils/report.utils.js";
import {
    deleteCreatedUser,
    signInAsAdmin,
    signInAsDeliveryPersonnel,
} from "./utils.js";

// describe("POST /api/reports/:targetType/:targetId REPORT TARGET", () => {
//     let createdUser,
//         indSeller,
//         busSeller,
//         busSellerStoreId,
//         flatProduct,
//         reviewId;

//     beforeAll(async () => {
//         // 1. create a new user
//         // 2. create a new seller, new product
//         // 3. review the product by the new user
//         const orderElements = await prepareOrderElements(app);
//         createdUser = orderElements.createdUser;
//         indSeller = orderElements.indSeller;
//         busSeller = orderElements.busSeller;
//         flatProduct = orderElements.flatProduct;

//         const busSellerStoreIdRes = await supertest(app)
//             .get(`/api/users`)
//             .set("Authorization", `Bearer ${busSeller.token}`);
//         busSellerStoreId = busSellerStoreIdRes.body.user.store.id;

//         await buyProduct(
//             app,
//             createdUser.token,
//             busSeller.token,
//             flatProduct.id
//         );

//         const reviewRes = await postReview(
//             app,
//             createdUser.token,
//             "product",
//             flatProduct.id,
//             "this is an absolutely garbage product that i hate"
//         );
//         reviewId = reviewRes.body.review.id;
//     });

//     it("should return 401 status code if requested by admin", async () => {
//         const adminToken = await signInAsAdmin(app);
//         const response = await reportTarget(app, adminToken);

//         expect(response.statusCode).toBe(401);
//         expect(response.body.error).toBe(
//             "admin and delivery personnel are not allowed to perform this action"
//         );
//     });

//     it("should return 401 status code if requested by delivery personnel", async () => {
//         const deliveryToken = await signInAsDeliveryPersonnel(app);
//         const response = await reportTarget(app, deliveryToken);

//         expect(response.statusCode).toBe(401);
//         expect(response.body.error).toBe(
//             "admin and delivery personnel are not allowed to perform this action"
//         );
//     });

//     it("should return 400 status code if target type is invalid", async () => {
//         const response = await reportTarget(
//             app,
//             createdUser.token,
//             "invalid-target"
//         );

//         expect(response.statusCode).toBe(400);
//         expect(response.body.error).toBe(
//             '"targetType" must be one of [product, store, user, review]'
//         );
//     });

//     it("should return 400 status code if cause is not provided", async () => {
//         const response = await reportTarget(app, createdUser.token, "product");

//         expect(response.statusCode).toBe(400);
//         expect(response.body.error).toBe("cause cannot be empty");
//     });

//     it("should return 400 status code if cause is less than 20 characters", async () => {
//         const response = await reportTarget(
//             app,
//             createdUser.token,
//             "product",
//             -1,
//             "cause"
//         );

//         expect(response.statusCode).toBe(400);
//         expect(response.body.error).toBe(
//             "cause must be atleast 20 characters long"
//         );
//     });

//     it("should return 400 status code if cause is more than 150 characters", async () => {
//         const response = await reportTarget(
//             app,
//             createdUser.token,
//             "product",
//             -1,
//             "cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause"
//         );

//         expect(response.statusCode).toBe(400);
//         expect(response.body.error).toBe(
//             "cause cannot be more than 150 characters long"
//         );
//     });

//     it("should return 404 status code if target is not found - PRODUCT", async () => {
//         const response = await reportTarget(
//             app,
//             createdUser.token,
//             "product",
//             -1,
//             "this product is highly inappropriate"
//         );

//         expect(response.body.error).toBe("product not found");
//         expect(response.statusCode).toBe(404);
//     });

//     it("should return 404 status code if target is not found - SELLER", async () => {
//         const response = await reportTarget(
//             app,
//             createdUser.token,
//             "store",
//             -1,
//             "this store is highly inappropriate"
//         );

//         expect(response.body.error).toBe("store not found");
//         expect(response.statusCode).toBe(404);
//     });

//     it("should return 404 status code if target is not found - REVIEW", async () => {
//         const response = await reportTarget(
//             app,
//             busSeller.token,
//             "review",
//             -1,
//             "this review is highly inappropriate"
//         );

//         expect(response.body.error).toBe("review not found");
//         expect(response.statusCode).toBe(404);
//     });

//     it("should return 404 status code if target is not found - USER", async () => {
//         const response = await reportTarget(
//             app,
//             busSeller.token,
//             "user",
//             -1,
//             "this user is highly inappropriate"
//         );

//         expect(response.body.error).toBe("user not found");
//         expect(response.statusCode).toBe(404);
//     });

//     it("should return 400 status code if tried to report one's own product", async () => {
//         const response = await reportTarget(
//             app,
//             busSeller.token,
//             "product",
//             flatProduct.id,
//             "this product is highly inappropriate"
//         );

//         expect(response.statusCode).toBe(400);
//         expect(response.body.error).toBe("you cannot report your own product");
//     });

//     it("should return 400 status code if tried to report one's own seller profile", async () => {
//         const response = await reportTarget(
//             app,
//             busSeller.token,
//             "store",
//             busSellerStoreId,
//             "this store is highly inappropriate"
//         );

//         expect(response.statusCode).toBe(400);
//         expect(response.body.error).toBe(
//             "you cannot report your own seller profile"
//         );
//     });

//     it("should return 400 status code if tried to report one's own review", async () => {
//         const response = await reportTarget(
//             app,
//             createdUser.token,
//             "review",
//             reviewId,
//             "this review is highly inappropriate"
//         );

//         expect(response.statusCode).toBe(400);
//         expect(response.body.error).toBe("you cannot report your own review");
//     });

//     it("should return 400 status code if tried to report oneself", async () => {
//         const response = await reportTarget(
//             app,
//             createdUser.token,
//             "user",
//             createdUser.id,
//             "this user is highly inappropriate"
//         );

//         expect(response.statusCode).toBe(400);
//         expect(response.body.error).toBe("you cannot report yourself");
//     });

//     it("should report the target if provided valid data - PRODUCT", async () => {
//         const response = await reportTarget(
//             app,
//             createdUser.token,
//             "product",
//             flatProduct.id,
//             "this product is highly inappropriate"
//         );

//         expect(response.statusCode).toBe(201);
//     });

//     it("should report the target if provided valid data - SELLER", async () => {
//         const response = await reportTarget(
//             app,
//             createdUser.token,
//             "store",
//             busSellerStoreId,
//             "this seller is highly inappropriate"
//         );

//         expect(response.statusCode).toBe(201);
//     });

//     it("should report the target if provided valid data - REVIEW", async () => {
//         const response = await reportTarget(
//             app,
//             busSeller.token,
//             "review",
//             reviewId,
//             "this review is highly inappropriate"
//         );

//         expect(response.statusCode).toBe(201);
//     });

//     it("should report the target if provided valid data - USER", async () => {
//         const response = await reportTarget(
//             app,
//             busSeller.token,
//             "user",
//             createdUser.id,
//             "this user is highly inappropriate"
//         );

//         expect(response.statusCode).toBe(201);
//     });

//     it("should return 400 status code if tried to report a target more than once", async () => {
//         await reportTarget(
//             app,
//             createdUser.token,
//             "product",
//             flatProduct.id,
//             "this product is highly inappropriate"
//         );

//         const response = await reportTarget(
//             app,
//             createdUser.token,
//             "product",
//             flatProduct.id,
//             "this product is highly inappropriate"
//         );

//         expect(response.statusCode).toBe(400);
//         expect(response.body.error).toBe(
//             "you have already reported this product"
//         );
//     });

//     afterAll(async () => {
//         await deleteCreatedUser(app, createdUser.id);
//         await deleteCreatedUser(app, indSeller.id);
//         await deleteCreatedUser(app, busSeller.id);
//     });
// });

describe("DELETE /api/reports/:reportId DELETE REPORT", () => {
    let createdUser,
        adminToken,
        indSeller,
        busSeller,
        busSellerStoreId,
        flatProduct,
        reviewId,
        productReport,
        sellerReport,
        reviewReport,
        userReport;

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

        // buy the product
        await buyProduct(
            app,
            createdUser.token,
            busSeller.token,
            flatProduct.id
        );

        // review the product
        const reviewRes = await postReview(
            app,
            createdUser.token,
            "product",
            flatProduct.id,
            "this is an absolutely garbage product that i hate"
        );
        reviewId = reviewRes.body.review.id;

        // report product, seller, review and user
        productReport = (
            await reportTarget(
                app,
                createdUser.token,
                "product",
                flatProduct.id,
                "this is an inappropriate product"
            )
        ).body.report;
        sellerReport = (
            await reportTarget(
                app,
                createdUser.token,
                "store",
                busSellerStoreId,
                "this is an inappropriate seller"
            )
        ).body.report;
        reviewReport = (
            await reportTarget(
                app,
                busSeller.token,
                "review",
                reviewId,
                "this is an inappropriate review"
            )
        ).body.report;
        userReport = (
            await reportTarget(
                app,
                busSeller.token,
                "user",
                createdUser.id,
                "this is an inappropriate user"
            )
        ).body.report;

        // sign in as admin
        adminToken = await signInAsAdmin(app);
    });

    it("should return 401 status code if requested by a non-admin user", async () => {
        const response = await deleteReport(
            app,
            createdUser.token,
            productReport.id
        );

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe(
            "you need to be an admin to perform this action"
        );
    });

    it("should return 404 status code if the report does not exist", async () => {
        const response = await deleteReport(app, adminToken, -1);

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("the report does not exist");
    });

    it("should delete the report if provided valid data - PRODUCT REPORT", async () => {
        const response = await deleteReport(app, adminToken, productReport.id);

        expect(response.statusCode).toBe(200);
    });

    it("should delete the report if provided valid data - SELLER REPORT", async () => {
        const response = await deleteReport(app, adminToken, sellerReport.id);

        expect(response.statusCode).toBe(200);
    });

    it("should delete the report if provided valid data - REVIEW REPORT", async () => {
        const response = await deleteReport(app, adminToken, reviewReport.id);

        expect(response.statusCode).toBe(200);
    });

    it("should delete the report if provided valid data - USER REPORT", async () => {
        const response = await deleteReport(app, adminToken, userReport.id);

        expect(response.statusCode).toBe(200);
    });

    afterAll(async () => {
        await deleteCreatedUser(app, createdUser.id);
        await deleteCreatedUser(app, indSeller.id);
        await deleteCreatedUser(app, busSeller.id);
    });
});
