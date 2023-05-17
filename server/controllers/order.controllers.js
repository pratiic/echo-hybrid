import { checkDelivery } from "../lib/delivery.lib.js";
import { sendEmail } from "../lib/email.lib.js";
import prisma from "../lib/prisma.lib.js";
import { capitalizeFirstLetter } from "../lib/strings.lib.js";
import { HttpError } from "../models/http-error.models.js";
import { validateAddress } from "../validators/address.validators.js";
import {
    validateOrder,
    validateOrderAction,
} from "../validators/order.validators.js";

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
                store: {
                    include: {
                        business: {
                            include: {
                                address: true,
                            },
                        },
                        user: {
                            include: {
                                address: true,
                            },
                        },
                    },
                },
                stock: {
                    select: {
                        variants: true,
                        quantity: true,
                    },
                },
            },
        });

        if (!product) {
            return next(new HttpError("product not found", 404));
        }

        // cannot order one's own product
        if (product.store.userId === user.id) {
            return next(
                new HttpError("you cannot order your own product", 400)
            );
        }

        // validate order address
        if (!orderInfo.address) {
            return next(new HttpError("address is required", 400));
        }

        let errorMsg = validateAddress(orderInfo.address);

        if (errorMsg) {
            return next(new HttpError(errorMsg, 400));
        }

        const { stockType, stock, isSecondHand } = product;
        const isDelivered = checkDelivery(
            orderInfo.address,
            isSecondHand
                ? product.store.user.address
                : product.store.business.address
        );
        let orderData = {
            productId: product.id,
            originId: user.id,
            storeId: product.store.id,
            unitPrice: product.price,
            consumerAddress: orderInfo.address,
            isDelivered,
            deliveryCharge: isDelivered ? product.deliveryCharge : null,
        };

        if (!isSecondHand) {
            // brand new product -> additional validation

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

            orderData.quantity = orderInfo.quantity;

            if (stockType === "varied") {
                orderData.variant = orderedVariant;
            }
        }

        const createdOrder = await prisma.order.create({
            data: orderData,
        });

        response.json({
            order: createdOrder,
        });
    } catch (error) {
        console.log(error);
        next(new HttpError());
    }
};

export const controlOrder = async (request, response, next) => {
    const user = request.user;
    const action = request.query.action;
    const order = request.order;

    const errorMsg = validateOrderAction(action);

    if (errorMsg) {
        return next(new HttpError(errorMsg, 400));
    }

    try {
        if (
            (action === "cancel" && order.origin.id !== user.id) ||
            (action !== "cancel" && order.store.userId !== user.id)
        ) {
            // order originator -> cancel
            // order product owner -> reset of the actions

            return next(
                new HttpError(
                    "you are unauthorized to perform this action",
                    400
                )
            );
        }

        // can confirm, reject or cancel only if status -> PLACED
        if (
            (action === "confirm" ||
                action === "reject" ||
                action === "cancel") &&
            order.status !== "PLACED"
        ) {
            return next(
                new HttpError(
                    `the order has already been ${order.status}`.toLowerCase()
                )
            );
        }

        // can package only if status -> CONFIRMED
        if (action === "package" && order.status !== "CONFIRMED") {
            return next(
                new HttpError(`an order must be confirmed to be packaged`)
            );
        }

        // update order status
        const actionStatusMap = {
            cancel: "CANCELLED",
            confirm: "CONFIRMED",
            reject: "REJECTED",
            package: "PACKAGED",
        };
        const updatedOrder = await prisma.order.update({
            where: {
                id: order.id,
            },
            data: {
                status: actionStatusMap[action],
            },
        });

        // send email
        if (
            action === "confirm" ||
            action === "reject" ||
            action === "package"
        ) {
            const productName = capitalizeFirstLetter(order.product.name);
            const emailMap = {
                confirm: {
                    subject: "confirmation",
                    text: `Your order of - ${productName} - has been confirmed`,
                },
                reject: {
                    subject: "rejection",
                    text: `We are sorry to have to inform you that your order of - ${productName} - has been rejected`,
                },
                package: {
                    subject: "packaging",
                    text: `Your order of - ${productName} - has been packaged`,
                },
            };

            sendEmail(
                order.origin.email,
                `Order ${emailMap[action].subject}`,
                emailMap[action].text
            );
        }

        response.json({ order: updatedOrder });
    } catch (error) {
        console.log(error);
        next(new HttpError());
    }
};

export const deleteOrder = async (request, response, next) => {
    const user = request.user;
    const order = request.order;

    if (order.status !== "REJECTED" && order.status !== "CANCELLED") {
        return next(
            new HttpError(
                "an order must have been rejected or cancelled to be deleted",
                400
            )
        );
    }

    if (
        (order.status === "REJECTED" && order.originId !== user.id) ||
        (order.status === "CANCELLED" && order.store.userId !== user.id)
    ) {
        // order cancelled -> can be deleted by product owner
        // order rejected -> can be deleted by originator
        return next(new HttpError("unauthorized to delete this order", 400));
    }

    try {
        await prisma.order.delete({
            where: {
                id: order.id,
            },
        });

        response.json({ message: "order has been deleted" });
    } catch (error) {
        next(new HttpError());
    }
};
