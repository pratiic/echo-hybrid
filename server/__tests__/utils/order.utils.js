import supertest from "supertest";

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
