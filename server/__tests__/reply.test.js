import { app } from "../index.js";
import { deleteCreatedUser } from "./utils.js";
import { prepareOrderElements } from "./utils/order.utils.js";
import { buyProduct } from "./utils/product.utils.js";
import { deleteReply, replyToReview } from "./utils/reply.utils.js";
import { postReview } from "./utils/review.utils.js";

describe("POST /api/replies/:reviewId REPLY TO REVIEW", () => {
    let createdUser, indSeller, busSeller, flatProduct, reviewId;

    beforeAll(async () => {
        const orderElements = await prepareOrderElements(app);
        createdUser = orderElements.createdUser;
        indSeller = orderElements.indSeller;
        busSeller = orderElements.busSeller;
        flatProduct = orderElements.flatProduct;

        // buy and review product
        await buyProduct(
            app,
            createdUser.token,
            busSeller.token,
            flatProduct.id
        );
        const reviewIdResponse = await postReview(
            app,
            createdUser.token,
            "product",
            flatProduct.id,
            "this is a nice product"
        );
        reviewId = reviewIdResponse.body.review.id;
    });

    it("should return 404 status code if text is not provided", async () => {
        const response = await replyToReview(app, busSeller.token, -1);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("text cannot be empty");
    });

    it("should return 400 status code if text is less than 5 characters", async () => {
        const response = await replyToReview(app, busSeller.token, -1, "abcd");

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "text must be atleast 5 characters long"
        );
    });

    it("should return 400 status code if text is more than 200 characters", async () => {
        const response = await replyToReview(
            app,
            busSeller.token,
            -1,
            "thank you thank you thank you thank you thank you thank you thank you thank you thank you thank you thank you thank you thank you thank you thank you thank you thank you thank you thank you thank you thank you thank you thank you thank you"
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "text cannot be more than 200 characters long"
        );
    });

    it("should return 404 status code if the review does not exist", async () => {
        const response = await replyToReview(
            app,
            busSeller.token,
            -1,
            "thank you"
        );

        expect(response.body.error).toBe("review not found");
        expect(response.statusCode).toBe(404);
    });

    it("should reply to review if provided valid data", async () => {
        const response = await replyToReview(
            app,
            busSeller.token,
            reviewId,
            "thank you"
        );

        expect(response.statusCode).toBe(201);
    });

    afterAll(async () => {
        await deleteCreatedUser(app, createdUser.id);
        await deleteCreatedUser(app, indSeller.id);
        await deleteCreatedUser(app, busSeller.id);
    });
});

describe("DELETE /api/replies/:replyId DELETE REPLY", () => {
    let createdUser, indSeller, busSeller, flatProduct, replyId;

    beforeAll(async () => {
        const orderElements = await prepareOrderElements(app);
        createdUser = orderElements.createdUser;
        indSeller = orderElements.indSeller;
        busSeller = orderElements.busSeller;
        flatProduct = orderElements.flatProduct;

        // buy and review product
        await buyProduct(
            app,
            createdUser.token,
            busSeller.token,
            flatProduct.id
        );
        const reviewIdResponse = await postReview(
            app,
            createdUser.token,
            "product",
            flatProduct.id,
            "this is a nice product"
        );
        const reviewId = reviewIdResponse.body.review.id;

        // reply to the review
        replyId = (
            await replyToReview(app, busSeller.token, reviewId, "thank you")
        ).body.reply.id;
    });

    it("should return 404 status code if reply does not exist", async () => {
        const response = await deleteReply(app, busSeller.token, -1);

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("reply not found");
    });

    it("should return 401 status code if the reply does not belong to the requesting user", async () => {
        const response = await deleteReply(app, createdUser.token, replyId);

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe(
            "you are unauthorized to delete this reply"
        );
    });

    it("should delete the review if provided valid data", async () => {
        const response = await deleteReply(app, busSeller.token, replyId);

        expect(response.statusCode).toBe(200);
    });

    afterAll(async () => {
        await deleteCreatedUser(app, createdUser.id);
        await deleteCreatedUser(app, indSeller.id);
        await deleteCreatedUser(app, busSeller.id);
    });
});
