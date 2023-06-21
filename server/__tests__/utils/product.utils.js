import {
    handleCompletionRequest,
    packageOrder,
    placeOrder,
    requestCompletion,
} from "./order.utils";

export const buyProduct = async (app, buyerToken, sellerToken, productId) => {
    const order = (
        await placeOrder(app, buyerToken, productId, {
            quantity: 1,
        })
    ).body.order;
    await packageOrder(app, sellerToken, order.id);
    await requestCompletion(app, sellerToken, order.id);
    const response = await handleCompletionRequest(
        app,
        buyerToken,
        order.id,
        "accept"
    );

    return response;
};
