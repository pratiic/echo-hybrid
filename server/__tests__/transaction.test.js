import { app } from "../index.js";
import { prepareOrderElements } from "./utils/order.utils.js";
import { buyProduct } from "./utils/product.utils.js";
import { deleteTransaction } from "./utils/transaction.utils.js";
import { deleteCreatedUser } from "./utils.js";

describe("DELETE /api/transactions/:transactionId DELETE TRANSACTION", () => {
    let createdUser, indSeller, busSeller, flatProduct, transactionId;

    beforeAll(async () => {
        const orderElements = await prepareOrderElements(app);
        createdUser = orderElements.createdUser;
        indSeller = orderElements.indSeller;
        busSeller = orderElements.busSeller;
        flatProduct = orderElements.flatProduct;

        transactionId = (
            await buyProduct(
                app,
                createdUser.token,
                busSeller.token,
                flatProduct.id
            )
        ).body.transaction.id;
    });

    it("should return 404 status code if the transaction does not exist", async () => {
        const response = await deleteTransaction(app, createdUser.token, -1);

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("transaction not found");
    });

    it("should return 401 status code if the requesting user is not the buyer", async () => {
        const response = await deleteTransaction(
            app,
            indSeller.token,
            transactionId
        );

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe(
            "you are unauthorized to delete this transaction"
        );
    });

    it("should return 401 status code if the requesting user is not the seller", async () => {
        const response = await deleteTransaction(
            app,
            indSeller.token,
            transactionId
        );

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe(
            "you are unauthorized to delete this transaction"
        );
    });

    it("should update deletedForBuyer to true if deleted by buyer", async () => {
        const response = await deleteTransaction(
            app,
            createdUser.token,
            transactionId
        );

        expect(response.statusCode).toBe(200);
        expect(response.body.transaction.deletedForBuyer).toBe(true);
        expect(response.body.transaction.isDeleted).toBe(false);
    });

    it("should update isDeleted to true if deleted by seller after being deleted by buyer", async () => {
        const response = await deleteTransaction(
            app,
            busSeller.token,
            transactionId
        );

        expect(response.statusCode).toBe(200);
        expect(response.body.transaction.isDeleted).toBe(true);
    });

    it("should return 404 status code if tried to delete again - BUYER", async () => {
        const response = await deleteTransaction(
            app,
            createdUser.token,
            transactionId
        );

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("transaction not found");
    });

    it("should return 404 status code if tried to delete again - SELLER", async () => {
        const response = await deleteTransaction(
            app,
            busSeller.token,
            transactionId
        );

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("transaction not found");
    });

    afterAll(async () => {
        await deleteCreatedUser(app, createdUser.id);
        await deleteCreatedUser(app, indSeller.id);
        await deleteCreatedUser(app, busSeller.id);
    });
});
