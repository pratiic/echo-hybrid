import { validateAddress } from "../validators/address.validators.js";
import { validateOrder } from "../validators/order.validators.js";

export const placeOrder = async (request, response, next) => {
    const user = request.user;
    const productId = parseInt(request.params.productId) || 0;
    const orderInfo = request.body;

    try {
        // check to see if the product with the given id exists
        const product = await prisma.product.findUnique({
            where: {
                id: productId,
            },
            include: {
                store: true,
                stock: {
                    select: {
                        variants: true,
                        quantity: true,
                        inOrder: true,
                    },
                },
            },
        });

        if (!product) {
            return next(new HttpError("product not found", 404));
        }

        // validate order address
        if (!orderInfo.address) {
            return next(new HttpError("consumer address is required", 400));
        }

        const errorMsg = validateAddress(orderInfo.address);

        if (errorMsg) {
            return next(new HttpError(errorMsg, 400));
        }

        const { stockType, stock, isSecondHand } = product;
        const orderData = {
            productId: product.id,
            originId: user.id,
            storeId: product.store.id,
            unitPrice: product.price,
            consumerAddress: orderInfo.address,
        };

        if (!isSecondHand) {
            if (!stock) {
                return next(
                    new HttpError(
                        "cannot order a product whose stock has not been set yet",
                        400
                    )
                );
            }

            // validate order
            errorMsg = validateOrder(orderInfo, stockType);

            if (errorMsg) {
                return next(new HttpError(errorMsg, 400));
            }

            let orderedVariant;
            if (stockType === "varied") {
                // check if the ordered variant exists
                orderedVariant = stock.variants.find(
                    (variant) => variant.id === orderInfo.variantId
                );

                if (!orderedVariant) {
                    return next(
                        new HttpError(
                            "the requested variant does not exist",
                            400
                        )
                    );
                }
            }

            // check if the requested quantity is available
            let quantityGreater = null;
            if (stockType === "varied") {
                if (orderInfo.quantity > orderedVariant.quantity) {
                    quantityGreater = orderedVariant.quantity;
                }
            } else {
                if (orderInfo.quantity > stock.quantity) {
                    quantityGreater = stock.quantity;
                }
            }

            if (quantityGreater) {
                return next(
                    new HttpError(
                        parseInt(quantityGreater) === 0
                            ? `the requested product is out of stock`
                            : `the requested quantity is greater than available - ${quantityGreater}`,
                        400
                    )
                );
            }
        }
    } catch (error) {}
};
