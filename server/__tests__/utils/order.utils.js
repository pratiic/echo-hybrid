import supertest from "supertest";
import {
    createBusiness,
    createNewUser,
    createProduct,
    setStock,
} from "../utils";

export const placeOrder = async (app, token, productId, orderData) => {
    const response = await supertest(app)
        .post(`/api/orders/${productId}`)
        .set("Authorization", `Bearer ${token}`)
        .send(orderData);

    return response;
};

export const controlOrder = async (app, token, orderId, action) => {
    const response = await supertest(app)
        .patch(`/api/orders/${orderId}/?action=${action}`)
        .set("Authorization", `Bearer ${token}`);

    return response;
};

export const deleteOrder = async (app, token, orderId) => {
    const response = await supertest(app)
        .delete(`/api/orders/${orderId}}`)
        .set("Authorization", `Bearer ${token}`);

    return response;
};

export const requestCompletion = async (app, token, orderId) => {
    const response = await supertest(app)
        .post(`/api/orders/${orderId}}/completion`)
        .set("Authorization", `Bearer ${token}`);

    return response;
};

export const packageOrder = async (app, token, orderId) => {
    await controlOrder(app, token, orderId, "confirm");
    await controlOrder(app, token, orderId, "package");

    return;
};

export const handleCompletionRequest = async (app, token, orderId, action) => {
    const response = await supertest(app)
        .patch(`/api/orders/${orderId}}/completion/?action=${action}`)
        .set("Authorization", `Bearer ${token}`);

    return response;
};

export const prepareOrderElements = async (app) => {
    const createdUser = await createNewUser(app, true, true);

    const indSeller = await createNewUser(app, true, true);
    const secondHandProduct = (await createProduct(app, indSeller.token, true))
        .body.product;

    const busSeller = await createNewUser(app, true, false);
    await createBusiness(app, busSeller.token, true);
    const flatProductRes = await createProduct(
        app,
        busSeller.token,
        false,
        2,
        "flat"
    );
    const flatProduct = flatProductRes.body.product;
    console.log("pratiic", flatProductRes.body);
    const variedProductRes = await createProduct(app, busSeller.token, false);
    const variedProduct = variedProductRes.body.product;

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
};
