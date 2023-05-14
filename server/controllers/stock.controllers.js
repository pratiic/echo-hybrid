import { validateSingularStock } from "../validators/stock.validators";

export const setStock = async (request, response, next) => {
    const product = request.product;
    let errorMsg;
    let stockData = {
        productId: product.id,
    };

    // second hand -> no stock
    if (product.isSecondHand) {
        return next(
            new HttpError(
                "second hand products are not allowed to have a stock"
            )
        );
    }

    // two stock types -> flat and varied
    if (product.stockType === "flat") {
        const { quantity } = request.body;
        errorMsg = validateSingularStock(quantity);

        if (errorMsg) {
            return next(new HttpError(errorMsg, 400));
        }

        stockData.quantity = parseInt(quantity);
    }
};
