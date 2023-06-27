import { app } from "../index.js";
import {
    createBusiness,
    createNewUser,
    createProduct,
    deleteCreatedUser,
    setStock,
    signInAsAdmin,
    signInAsDeliveryPersonnel,
} from "./utils.js";
import {
    controlOrder,
    deleteOrder,
    handleCompletionRequest,
    packageOrder,
    placeOrder,
    requestCompletion,
} from "./utils/order.utils.js";

describe("POST /api/orders/:productId PLACE ORDER", () => {
    let createdUser,
        indSeller,
        busSeller,
        secondHandProduct,
        flatProduct,
        variedProduct;

    beforeAll(async () => {
        const orderElements = await prepareOrderElements();
        createdUser = orderElements.createdUser;
        indSeller = orderElements.indSeller;
        busSeller = orderElements.busSeller;
        secondHandProduct = orderElements.secondHandProduct;
        flatProduct = orderElements.flatProduct;
        variedProduct = orderElements.variedProduct;
    });

    it("should return 401 status code if requested by admin", async () => {
        const adminToken = signInAsAdmin(app);
        const response = await placeOrder(app, adminToken, 1);

        expect(response.statusCode).toBe(401);
    });

    it("should return 401 status code if requested by delivery personnel", async () => {
        const deliveryPersonnelToken = signInAsDeliveryPersonnel(app);
        const response = await placeOrder(app, deliveryPersonnelToken, 1);

        expect(response.statusCode).toBe(401);
    });

    it("should return 404 status code if the product does not exist", async () => {
        const response = await placeOrder(app, createdUser.id, -1);

        expect(response.statusCode).toBe(401);
    });

    it("should return 400 status code if it is the requesting user's product", async () => {
        await createBusiness(app, createdUser.token);
        const createdProduct = (
            await createProduct(app, createdUser.token, false)
        ).body.product;

        const response = await placeOrder(
            app,
            createdUser.token,
            createdProduct.id
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("you cannot order your own product");
    });

    it("should return 400 status code if product stock has not been set", async () => {
        const createdProduct = (
            await createProduct(app, createdUser.token, false)
        ).body.product;

        const response = await placeOrder(
            app,
            createdUser.token,
            createdProduct.id
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("you cannot order your own product");
    });

    it("should place an order of the product - SECOND HAND", async () => {
        const response = await placeOrder(
            app,
            createdUser.token,
            secondHandProduct.id,
            {
                address: createdUser.address,
            }
        );

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("order");
    });

    it("should return 400 status code if quantity is not provided - BRAND NEW FLAT", async () => {
        const response = await placeOrder(
            app,
            createdUser.token,
            flatProduct.id
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("quantity cannot be empty");
    });

    it("should return 400 status code if quantity is not a number - BRAND NEW FLAT", async () => {
        const response = await placeOrder(
            app,
            createdUser.token,
            flatProduct.id,
            {
                quantity: "string",
            }
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('"quantity" must be a number');
    });

    it("should return 400 status code if quantity is not an integer - BRAND NEW FLAT", async () => {
        const response = await placeOrder(
            app,
            createdUser.token,
            flatProduct.id,
            {
                quantity: 1.5,
            }
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('"quantity" must be an integer');
    });

    it("should return 400 status code if quantity is less than 1 - BRAND NEW FLAT", async () => {
        const response = await placeOrder(
            app,
            createdUser.token,
            flatProduct.id,
            {
                quantity: 0,
            }
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            '"quantity" must be a positive number'
        );
    });

    it("should return 400 status code if requested quantity is greater than available - BRAND NEW FLAT", async () => {
        const response = await placeOrder(
            app,
            createdUser.token,
            flatProduct.id,
            {
                quantity: 100,
            }
        );

        expect(response.statusCode).toBe(400);
        expect(
            response.body.error ===
                "the requested quantity is greater than available - 3" ||
                response.body.error === "the requested product is out of stock"
        ).toBe(true);
    });

    it("should place an order of the product if provided valid data - BRAND NEW FLAT", async () => {
        const response = await placeOrder(
            app,
            createdUser.token,
            flatProduct.id,
            {
                quantity: 1,
                address: createdUser.address,
            }
        );

        expect(response.statusCode).toBe(200);
    });

    it("should return 400 status code if variantId is not provided - BRAND NEW VARIED", async () => {
        const response = await placeOrder(
            app,
            createdUser.token,
            variedProduct.id,
            {
                quantity: 1,
            }
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("variantId cannot be empty");
    });

    it("should return 400 status code if variantId is not string - BRAND NEW VARIED", async () => {
        const response = await placeOrder(
            app,
            createdUser.token,
            variedProduct.id,
            {
                quantity: 1,
                variantId: 1,
            }
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('"variantId" must be a string');
    });

    it("should return 404 status code if the requested variant does not exist - BRAND NEW VARIED", async () => {
        const response = await placeOrder(
            app,
            createdUser.token,
            variedProduct.id,
            {
                quantity: 1,
                variantId: "non-existing-variant",
            }
        );

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe(
            "the requested variant does not exist"
        );
    });

    it("should return 400 status code if the requested quantity is greater than available - BRAND NEW VARIED", async () => {
        const response = await placeOrder(
            app,
            createdUser.token,
            variedProduct.id,
            {
                quantity: 100,
                variantId: "red",
            }
        );

        expect(response.statusCode).toBe(400);
        expect(
            response.body.error ===
                "the requested quantity is greater than available - 3" ||
                response.body.error === "the requested product is out of stock"
        ).toBe(true);
    });

    it("should place an order of the product if provided valid data - BRAND NEW VARIED", async () => {
        const response = await placeOrder(
            app,
            createdUser.token,
            variedProduct.id,
            {
                quantity: 1,
                variantId: "red",
            }
        );

        expect(response.statusCode).toBe(200);
    });

    afterAll(async () => {
        await deleteCreatedUser(app, createdUser.id);
        await deleteCreatedUser(app, indSeller.id);
        await deleteCreatedUser(app, busSeller.id);
    });
});

describe("PATCH /api/orders/:orderId CONTROL ORDER", () => {
    let createdUser,
        indSeller,
        busSeller,
        secondHandProduct,
        flatProduct,
        variedProduct,
        secondHandOrder,
        flatOrder,
        variedOrder;

    beforeAll(async () => {
        const orderElements = await prepareOrderElements();
        createdUser = orderElements.createdUser;
        indSeller = orderElements.indSeller;
        busSeller = orderElements.busSeller;
        secondHandProduct = orderElements.secondHandProduct;
        flatProduct = orderElements.flatProduct;
        variedProduct = orderElements.variedProduct;

        secondHandOrder = (
            await placeOrder(app, createdUser.token, secondHandProduct.id, {
                address: createdUser.address,
            })
        ).body.order;

        flatOrder = (
            await placeOrder(app, createdUser.token, flatProduct.id, {
                address: createdUser.address,
                quantity: 1,
            })
        ).body.order;

        variedOrder = (
            await placeOrder(app, createdUser.token, variedProduct.id, {
                address: createdUser.address,
                quantity: 1,
                variantId: "red",
            })
        ).body.order;
    });

    it("should return 404 status code if the order does not exist", async () => {
        const response = await controlOrder(app, createdUser.token, -1);

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("order not found");
    });

    it("should return 400 status code if the action is not provided", async () => {
        const response = await controlOrder(
            app,
            createdUser.token,
            secondHandOrder.id
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            '"action" must be one of [confirm, reject, cancel, package]'
        );
    });

    it("should return 400 status code if the action is invalid", async () => {
        const response = await controlOrder(
            app,
            createdUser.token,
            secondHandOrder.id,
            "invalid-action"
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            '"action" must be one of [confirm, reject, cancel, package]'
        );
    });

    it("should return 401 status code if the action is 'cancel' and the requesting user is not the originator", async () => {
        const response = await controlOrder(
            app,
            indSeller.token, // not the originator
            secondHandOrder.id,
            "cancel"
        );

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe(
            "you are unauthorized to perform this action"
        );
    });

    it("should return 401 status code if the action is not 'cancel' and the requesting user is not the seller", async () => {
        const sellerActions = ["confirm", "reject", "package"];

        const response = await controlOrder(
            app,
            createdUser.token, // not the seller
            secondHandOrder.id,
            "confirm"
        );

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe(
            "you are unauthorized to perform this action"
        );
    });

    it("should change the order status if status is 'placed' and action is 'cancel' - BUYER", async () => {
        const response = await controlOrder(
            app,
            createdUser.token,
            secondHandOrder.id,
            "cancel"
        );

        expect(response.statusCode).toBe(200);
        expect(response.body.order.status).toBe("CANCELLED");
    });

    it("should change the order status if status is 'placed' and action is 'confirm' - SELLER", async () => {
        const response = await controlOrder(
            app,
            busSeller.token,
            flatOrder.id,
            "confirm"
        );

        expect(response.statusCode).toBe(200);
        expect(response.body.order.status).toBe("CONFIRMED");
    });

    it("should change the order status if status is 'placed' and action is 'reject' - SELLER", async () => {
        const response = await controlOrder(
            app,
            busSeller.token,
            variedOrder.id,
            "reject"
        );

        expect(response.statusCode).toBe(200);
        expect(response.body.order.status).toBe("REJECTED");
    });

    it("should return 400 status code if action is 'cancel' and status is not 'placed' - BUYER", async () => {
        const response = await controlOrder(
            app,
            createdUser.token,
            variedOrder.id,
            "cancel"
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("the order has already been rejected");
    });

    it("should return 400 status code if action is 'confirm' or 'reject' and status is not 'placed' - SELLER", async () => {
        const response = await controlOrder(
            app,
            busSeller.token,
            variedOrder.id,
            "confirm"
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("the order has already been rejected");
    });

    it("should return 400 status code if action is 'package' and status is not 'confirmed' - SELLER", async () => {
        const response = await controlOrder(
            app,
            busSeller.token,
            variedOrder.id,
            "package"
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "an order must be confirmed to be packaged"
        );
    });

    it("should change order status to 'packaged' if action is 'package' and status is 'confirmed' - SELLER", async () => {
        const response = await controlOrder(
            app,
            busSeller.token,
            flatOrder.id,
            "package"
        );

        expect(response.statusCode).toBe(200);
    });

    it("should return 400 status code if action is 'confirm' and another order the product has already been confirmed - SELLER SECOND HAND", async () => {
        const secondHandOrder = (
            await placeOrder(app, createdUser.token, secondHandProduct.id, {
                address: createdUser.address,
            })
        ).body.order;

        const secondHandOrderTwo = (
            await placeOrder(app, createdUser.token, secondHandProduct.id, {
                address: createdUser.address,
            })
        ).body.order;

        await controlOrder(app, indSeller.token, secondHandOrder.id, "confirm");

        const response = await controlOrder(
            app,
            indSeller.token,
            secondHandOrderTwo.id,
            "confirm"
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "another order of this product has already been confirmed"
        );
    });

    it("should return 400 status code if action is 'confirm' the ordered quantity is less than available - SELLER BRAND NEW FLAT", async () => {
        const flatOrder = (
            await placeOrder(app, createdUser.token, flatProduct.id, {
                address: createdUser.address,
                quantity: 2,
            })
        ).body.order;

        const flatOrderTwo = (
            await placeOrder(app, createdUser.token, flatProduct.id, {
                address: createdUser.address,
                quantity: 2,
            })
        ).body.order;

        await controlOrder(app, busSeller.token, flatOrder.id, "confirm");

        const response = await controlOrder(
            app,
            busSeller.token,
            flatOrderTwo.id,
            "confirm"
        );

        expect(response.statusCode).toBe(400);
        expect(
            response.body.error.includes(
                "the ordered quantity is greater than available"
            )
        ).toBe(true);
    });

    it("should return 400 status code if action is 'confirm' the ordered quantity of the variant is less than available - SELLER BRAND NEW VARIED", async () => {
        const variedOrder = (
            await placeOrder(app, createdUser.token, flatProduct.id, {
                address: createdUser.address,
                quantity: 2,
                variantId: "red",
            })
        ).body.order;

        const variedOrderTwo = (
            await placeOrder(app, createdUser.token, flatProduct.id, {
                address: createdUser.address,
                quantity: 2,
                variantId: 2,
            })
        ).body.order;

        await controlOrder(app, busSeller.token, variedOrder.id, "confirm");

        const response = await controlOrder(
            app,
            busSeller.token,
            variedOrderTwo.id,
            "confirm"
        );

        expect(response.statusCode).toBe(400);
        expect(
            response.body.error.includes(
                "the ordered quantity is greater than available"
            )
        ).toBe(true);
    });

    afterAll(async () => {
        await deleteCreatedUser(app, createdUser.id);
        await deleteCreatedUser(app, indSeller.id);
        await deleteCreatedUser(app, busSeller.id);
    });
});

describe("DELETE /api/orders/:orderId DELETE ORDER", () => {
    let createdUser,
        indSeller,
        busSeller,
        secondHandProduct,
        flatProduct,
        variedProduct,
        secondHandOrder,
        secondHandOrderTwo,
        flatOrder,
        variedOrder;

    beforeAll(async () => {
        const orderElements = await prepareOrderElements();
        createdUser = orderElements.createdUser;
        indSeller = orderElements.indSeller;
        busSeller = orderElements.busSeller;
        secondHandProduct = orderElements.secondHandProduct;
        flatProduct = orderElements.flatProduct;
        variedProduct = orderElements.variedProduct;

        secondHandOrder = (
            await placeOrder(app, createdUser.token, secondHandProduct.id)
        ).body.order;

        secondHandOrderTwo = (
            await placeOrder(app, createdUser.token, secondHandProduct.id)
        ).body.order;

        flatOrder = (
            await placeOrder(app, createdUser.token, flatProduct.id, {
                quantity: 1,
            })
        ).body.order;

        variedOrder = (
            await placeOrder(app, createdUser.token, variedProduct.id, {
                quantity: 1,
                variantId: "red",
            })
        ).body.order;
    });

    it("should return 404 status code if the order does not exist", async () => {
        const response = await deleteOrder(app, createdUser.token, -1);

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("order not found");
    });

    it("should return 400 status code if the status is not 'cancelled' or 'rejected'", async () => {
        const response = await deleteOrder(
            app,
            createdUser.token,
            secondHandOrder.id
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "an order must have been rejected or cancelled to be deleted"
        );
    });

    it("should return 401 status code if the status is 'cancelled' and the requesting user is not the seller", async () => {
        await controlOrder(
            app,
            createdUser.token,
            secondHandOrder.id,
            "cancel"
        );

        const response = await deleteOrder(
            app,
            createdUser.token,
            secondHandOrder.id
        );

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe("unauthorized to delete this order");
    });

    it("should return 401 status code if the status is 'rejected' and the requesting user is not the seller", async () => {
        await controlOrder(app, busSeller.token, flatOrder.id, "reject");

        const response = await deleteOrder(app, busSeller.token, flatOrder.id);

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe("unauthorized to delete this order");
    });

    it("should delete an order if the status is 'rejected' and the requesting user is the originator", async () => {
        await controlOrder(app, busSeller.token, variedOrder.id, "reject");

        const response = await deleteOrder(
            app,
            createdUser.token,
            flatOrder.id
        );

        expect(response.statusCode).toBe(200);
    });

    it("should delete an order if the status is 'cancelled' and the requesting user is the seller", async () => {
        await controlOrder(
            app,
            createdUser.token,
            secondHandOrderTwo.id,
            "cancel"
        );

        const response = await deleteOrder(
            app,
            indSeller.token,
            secondHandOrderTwo.id
        );

        expect(response.statusCode).toBe(200);
    });

    afterAll(async () => {
        await deleteCreatedUser(app, createdUser.id);
        await deleteCreatedUser(app, indSeller.id);
        await deleteCreatedUser(app, busSeller.id);
    });
});

describe("POST /api/orders/:orderId/completion REQUEST COMPLETION", () => {
    let createdUser,
        deliveryToken,
        indSeller,
        busSeller,
        secondHandProduct,
        deliveredOrder,
        undeliveredOrder;

    beforeAll(async () => {
        const orderElements = await prepareOrderElements();
        createdUser = orderElements.createdUser;
        indSeller = orderElements.indSeller;
        busSeller = orderElements.busSeller;
        secondHandProduct = orderElements.secondHandProduct;

        deliveryToken = await signInAsDeliveryPersonnel(app);

        const orders = await prepareOrders(createdUser, secondHandProduct);
        deliveredOrder = orders.deliveredOrder;
        undeliveredOrder = orders.undeliveredOrder;
    });

    it("should return 404 status code if the order does not exist", async () => {
        const response = await deleteOrder(app, createdUser.token, -1);

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("order not found");
    });

    it("should return 401 status code if the order is delivered and the requesting user is not delivery personnel - tried with buyer", async () => {
        const response = await requestCompletion(
            app,
            createdUser.token,
            deliveredOrder.id
        );

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe(
            "you are unauthorized to request the completion of this order"
        );
    });

    it("should return 401 status code if the order is delivered and the requesting user is not delivery personnel - tried with seller", async () => {
        const response = await requestCompletion(
            app,
            indSeller.token,
            deliveredOrder.id
        );

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe(
            "you are unauthorized to request the completion of this order"
        );
    });

    it("should return 401 status code if the order is not delivered and the requesting user is not the seller - tried with buyer", async () => {
        const response = await requestCompletion(
            app,
            createdUser.token,
            undeliveredOrder.id
        );

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe(
            "you are unauthorized to request the completion of this order"
        );
    });

    it("should return 401 status code if the order is not delivered and the requesting user is not the seller - tried with delivery personnel", async () => {
        const response = await requestCompletion(
            app,
            deliveryToken,
            undeliveredOrder.id
        );

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe(
            "you are unauthorized to request the completion of this order"
        );
    });

    it("should return 400 status code if the order is not packaged", async () => {
        const response = await requestCompletion(
            app,
            deliveryToken,
            deliveredOrder.id
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "the order needs to be packaged first"
        );
    });

    it("should create order completion request if provided valid data - UNDELIVERED", async () => {
        await packageOrder(app, indSeller.token, undeliveredOrder.id);

        const response = await requestCompletion(
            app,
            indSeller.token,
            undeliveredOrder.id
        );

        expect(response.statusCode).toBe(200);
    });

    it("should create order completion request if provided valid data - DELIVERED", async () => {
        await packageOrder(app, indSeller.token, deliveredOrder.id);

        const response = await requestCompletion(
            app,
            deliveryToken,
            deliveredOrder.id
        );

        expect(response.statusCode).toBe(200);
    });

    it("should return 400 status code if a completion request already exists", async () => {
        await packageOrder(app, indSeller.token, deliveredOrder.id);
        await requestCompletion(app, deliveryToken, deliveredOrder.id);

        const response = await requestCompletion(
            app,
            deliveryToken,
            deliveredOrder.id
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "a completion request has already been made"
        );
    });

    afterAll(async () => {
        await deleteCreatedUser(app, createdUser.id);
        await deleteCreatedUser(app, indSeller.id);
        await deleteCreatedUser(app, busSeller.id);
    });
});

describe("PATCH /api/orders/:orderId/completion HANDLE COMPLETION REQUEST", () => {
    let createdUser,
        deliveryToken,
        indSeller,
        busSeller,
        secondHandProduct,
        deliveredOrder,
        undeliveredOrder;

    beforeAll(async () => {
        const orderElements = await prepareOrderElements();
        createdUser = orderElements.createdUser;
        indSeller = orderElements.indSeller;
        busSeller = orderElements.busSeller;
        secondHandProduct = orderElements.secondHandProduct;

        deliveryToken = await signInAsDeliveryPersonnel(app);

        const orders = await prepareOrders(createdUser, secondHandProduct);
        deliveredOrder = orders.deliveredOrder;
        undeliveredOrder = orders.undeliveredOrder;
    });

    it("should return 404 status code if the order does not exist", async () => {
        const response = await handleCompletionRequest(
            app,
            createdUser.token,
            -1
        );

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("order not found");
    });

    it("should return 400 status code if the action is not provided", async () => {
        const response = await handleCompletionRequest(
            app,
            createdUser.token,
            deliveredOrder.id
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("invalid action");
    });

    it("should return 400 status code if the action is invalid", async () => {
        const response = await handleCompletionRequest(
            app,
            createdUser.token,
            deliveredOrder.id,
            "invalid action"
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("invalid action");
    });

    it("should return 400 status code if completion request does not exist", async () => {
        const response = await handleCompletionRequest(
            app,
            createdUser.token,
            deliveredOrder.id,
            "accept"
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "a request to complete the order does not exist"
        );
    });

    it("should return 401 status code if the requesting user is not the originator", async () => {
        await packageOrder(app, indSeller.token, deliveredOrder.id);
        await requestCompletion(app, deliveryToken, deliveredOrder.id);

        const response = await handleCompletionRequest(
            app,
            indSeller.token,
            deliveredOrder.id,
            "accept"
        );

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe(
            "you are unauthorized to handle the completion request of this order"
        );
    });

    it("should handle the completion request if provided valid data - ACCEPT", async () => {
        await packageOrder(app, indSeller.token, deliveredOrder.id);
        await requestCompletion(app, deliveryToken, deliveredOrder.id);

        const response = await handleCompletionRequest(
            app,
            createdUser.token,
            deliveredOrder.id,
            "accept"
        );

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("transaction");
    });

    it("should handle the completion request if provided valid data - REJECT", async () => {
        await packageOrder(app, indSeller.token, undeliveredOrder.id);
        await requestCompletion(app, indSeller.token, undeliveredOrder.id);

        const response = await handleCompletionRequest(
            app,
            createdUser.token,
            undeliveredOrder.id,
            "reject"
        );

        expect(response.statusCode).toBe(200);
    });

    afterAll(async () => {
        await deleteCreatedUser(app, createdUser.id);
        await deleteCreatedUser(app, indSeller.id);
        await deleteCreatedUser(app, busSeller.id);
    });
});

async function prepareOrderElements() {
    const createdUser = await createNewUser(app, true, true);

    const indSeller = await createNewUser(app, true, true);
    const secondHandProduct = (await createProduct(app, indSeller.token, true))
        .body.product;

    const busSeller = await createNewUser(app, true, false);
    await createBusiness(app, busSeller.token, true);
    const flatProduct = (
        await createProduct(app, busSeller.token, false, 2, "flat")
    ).body.product;
    const variedProduct = (await createProduct(app, busSeller.token, false))
        .body.product;

    await setStock(app, busSeller.token, flatProduct.id, { quantity: 3 });
    await setStock(
        app,
        busSeller.token,
        variedProduct.id,
        {
            variants: [
                {
                    color: "red",
                    quantity: 3,
                },
                {
                    color: "blue",
                    quantity: 2,
                },
            ],
        },
        true
    );

    return {
        createdUser,
        indSeller,
        busSeller,
        secondHandProduct,
        flatProduct,
        variedProduct,
    };
}

async function prepareOrders(createdUser, product) {
    const deliveredOrder = (
        await placeOrder(app, createdUser.token, product.id, {
            address: createdUser.address,
        })
    ).body.order;

    const undeliveredOrderRes = await placeOrder(
        app,
        createdUser.token,
        product.id,
        {
            address: {
                bagmati: "province no 1",
                city: "jhapa",
                area: "birtamode",
            },
        }
    );
    const undeliveredOrder = undeliveredOrderRes.body.order;

    return { deliveredOrder, undeliveredOrder };
}
