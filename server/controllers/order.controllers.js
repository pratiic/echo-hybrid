import {
    deliveryInclusionFields,
    genericUserFields,
    orderInclusionFields,
    transactionSelectionFields,
} from "../lib/data-source.lib.js";
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
    const io = request.io;
    let errorMsg = "";

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
                        suspension: {
                            select: {
                                id: true,
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
                suspension: {
                    select: {
                        id: true,
                    },
                },
            },
        });

        if (!product || product.isDeleted) {
            return next(
                new HttpError("product not found, may have been deleted", 404)
            );
        }

        // cannot order a suspended product
        if (product.suspension) {
            return next(
                new HttpError("this product is currently suspended", 400)
            );
        }

        // cannot order from a suspended seller
        if (product.store.suspension) {
            return next(
                new HttpError(
                    "the seller of this product is currently suspended",
                    400
                )
            );
        }

        // cannot order one's own product
        if (product.store.userId === user.id) {
            return next(
                new HttpError("you cannot order your own product", 400)
            );
        }

        // check if the product is delivered for handling address
        const isDelivered = checkDelivery(
            orderInfo.address,
            product.isSecondHand
                ? product.store.user.address
                : product.store.business.address
        );

        if (isDelivered) {
            // validate order address
            if (!orderInfo.address) {
                return next(new HttpError("address is required", 400));
            }

            errorMsg = validateAddress(orderInfo.address);

            if (errorMsg) {
                return next(new HttpError(errorMsg, 400));
            }
        }

        const { stockType, stock, isSecondHand } = product;

        let orderData = {
            productId: product.id,
            originId: user.id,
            storeId: product.store.id,
            unitPrice: product.price,
            consumerAddress: isDelivered ? orderInfo.address : undefined,
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
            include: {
                origin: {
                    select: genericUserFields,
                },
                store: {
                    include: {
                        user: {
                            select: {
                                ...genericUserFields,
                                address: true,
                            },
                        },
                        business: {
                            include: {
                                address: true,
                            },
                        },
                    },
                },
                product: true,
            },
        });

        // delete cart item in the requesting user's cart related to the orderd product
        let cartItemId = null;
        if (user.cart) {
            const cartItems = await prisma.cartItem.findMany({
                where: {
                    cartId: user.cart.id,
                    productId: product.id,
                },
                select: {
                    id: true,
                    variant: true,
                },
            });

            if (cartItems.length > 0) {
                let cartItem = cartItems[0];

                if (stockType === "varied") {
                    cartItem = cartItems.find(
                        (cartItem) =>
                            cartItem.variant.id === orderInfo.variantId
                    );
                }

                if (cartItem) {
                    await prisma.cartItem.delete({
                        where: {
                            id: cartItem.id,
                        },
                    });
                    cartItemId = cartItem.id;
                }
            }
        }

        io.emit("order", createdOrder);

        response.json({
            order: createdOrder,
            cartItemId,
        });
    } catch (error) {
        console.log(error);
        next(new HttpError());
    }
};

export const getOrders = async (request, response, next) => {
    const user = request.user;
    const type = request.query.type; // user, seller or delivery
    const page = parseInt(request.query.page) || 1;
    let skip = parseInt(request.query.skip) || -1;
    const searchQuery = request.query.query || "";
    const PAGE_SIZE = 10;

    if (skip < 0) {
        skip = 0;
    }

    if (type !== "user" && type !== "seller" && type !== "delivery") {
        return next(
            new HttpError(
                "invalid type, valid types is 'user', 'seller' and 'delivery'"
            )
        );
    }

    if (type === "delivery" && !user?.isDeliveryPersonnel) {
        return next(
            new HttpError(
                "you have to be a delivery personnel to get these orders",
                401
            )
        );
    }

    // user -> do not show cancelled orders
    // seller -> do not show rejected orders
    // both -> do not show "deleted" or completed orders
    let filter = {};

    if (type === "user") {
        filter = {
            originId: user.id,
            status: {
                not: "CANCELLED",
            },
        };
    } else if (type === "seller") {
        filter = {
            storeId: user.store?.id || -1,
            status: {
                not: "REJECTED",
            },
        };
    } else {
        filter = {
            status: "PACKAGED",
            isDelivered: true,
        };
    }

    filter = {
        ...filter,
        NOT: {
            isDeleted: true,
        },
    };

    let searchFilter = {};

    if (searchQuery) {
        searchFilter = {
            OR: [
                {
                    product: {
                        name: {
                            contains: searchQuery.trim(),
                            mode: "insensitive",
                        },
                    },
                },
                {
                    id: {
                        equals: parseInt(searchQuery.trim()) || -1,
                    },
                },
            ],
        };
    }

    filter = { ...filter, ...searchFilter };

    try {
        const [orders, totalCount] = await Promise.all([
            prisma.order.findMany({
                where: filter,
                include: orderInclusionFields,
                orderBy: {
                    createdAt: "desc",
                },
                take: PAGE_SIZE,
                skip: (page - 1) * PAGE_SIZE + skip,
            }),
            prisma.order.count({
                where: filter,
            }),
        ]);

        response.json({ orders, totalCount });
    } catch (error) {
        console.log(error);
        next(new HttpError());
    }
};

export const controlOrder = async (request, response, next) => {
    const user = request.user;
    const action = request.query.action;
    const order = request.order;
    const io = request.io;
    let operations = [];

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
                    401
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

        // can confirm only if remaining quantity >= requested quantity or if order not already confirmed (second hand)
        if (action === "confirm") {
            if (order.product.isSecondHand) {
                // check if an order of this product has already been confirmed
                const orders = await prisma.order.findMany({
                    where: {
                        productId: order.product.id,
                        status: "CONFIRMED",
                    },
                });

                if (orders.length > 0) {
                    return next(
                        new HttpError(
                            `another order of this product has already been confirmed`,
                            400
                        )
                    );
                }
            } else {
                const { quantity: orderedQuantity, variant: orderedVariant } =
                    order;

                let remainingQuantity;

                if (orderedVariant) {
                    // stock type -> varied
                    remainingQuantity = order.product.stock.variants.find(
                        (variant) => variant.id === orderedVariant.id
                    ).quantity;
                } else {
                    // stock type -> flat
                    remainingQuantity = order.product.stock.quantity;
                }

                if (remainingQuantity < orderedQuantity) {
                    return next(
                        new HttpError(
                            `the ordered quantity is greater than available - ${remainingQuantity}`,
                            400
                        )
                    );
                }

                // update the stock of the ordererd product
                let updateData = {};

                if (orderedVariant) {
                    updateData = {
                        variants: order.product.stock.variants.map(
                            (variant) => {
                                if (variant.id === orderedVariant.id) {
                                    return {
                                        ...variant,
                                        quantity:
                                            variant.quantity - orderedQuantity,
                                    };
                                }

                                return variant;
                            }
                        ),
                    };
                } else {
                    updateData = {
                        quantity: remainingQuantity - orderedQuantity,
                    };
                }

                operations.push(
                    prisma.stock.update({
                        where: {
                            productId: order.product.id,
                        },
                        data: updateData,
                    })
                );
            }
        }

        // update order status
        const actionStatusMap = {
            cancel: "CANCELLED",
            confirm: "CONFIRMED",
            reject: "REJECTED",
            package: "PACKAGED",
        };
        operations.unshift(
            prisma.order.update({
                where: {
                    id: order.id,
                },
                data: {
                    status: actionStatusMap[action],
                },
            })
        );

        const [updatedOrder] = await Promise.all(operations);

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

        io.emit(`order-${action}`, {
            id: order.id,
            status: updatedOrder.status,
            originId: order.origin.id,
            sellerId: order.store.userId,
        });

        if (action === "package" && order.isDelivered) {
            const orderWithAllFields = await prisma.order.findUnique({
                where: {
                    id: order.id,
                },
                include: orderInclusionFields,
            });

            io.emit("delivery-request", orderWithAllFields);
        }

        response.json({ order: updatedOrder });
    } catch (error) {
        console.log(error);
        next(new HttpError());
    }
};

export const acknowledgeOrders = async (request, response, next) => {
    const user = request.user;

    try {
        await prisma.order.updateMany({
            where: {
                storeId: user.store?.id || -1,
            },
            data: {
                isAcknowledged: true,
            },
        });

        response.json({});
    } catch (error) {
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

export const requestCompletion = async (request, response, next) => {
    // claim that an order has been completed or delivered
    // delivery available -> delivery personnel
    // delivery not availabel -> seller

    const user = request.user;
    const order = request.order;
    const io = request.io;

    if (
        (order.isDelivered && !user.isDeliveryPersonnel) ||
        (!order.isDelivered && order.store.userId !== user.id)
    ) {
        return next(
            new HttpError(
                "you are unauthorized to request the completion of this order",
                401
            )
        );
    }

    if (order.status !== "PACKAGED") {
        return next(new HttpError("the order needs to be packaged first", 400));
    }

    if (order.orderCompletion) {
        return next(
            new HttpError("a completion request has already been made", 400)
        );
    }

    try {
        const completionRequest = await prisma.orderCompletion.create({
            data: {
                orderId: order.id,
                madeBy: user.isDeliveryPersonnel
                    ? "DELIVERY_PERSONNEL"
                    : "SELLER",
                requestorId: user.id,
            },
        });

        io.emit("order-completion-request", {
            id: order.id,
            updateInfo: {
                orderCompletion: completionRequest,
            },
            originId: order.originId,
        });

        response.json({
            request: completionRequest,
        });
    } catch (error) {
        console.log(error);

        next(new HttpError());
    }
};

export const handleCompletionRequest = async (request, response, next) => {
    const user = request.user;
    const order = request.order;
    const action = request.query.action;
    const io = request.io;

    if (action !== "accept" && action !== "reject") {
        return next(new HttpError("invalid action", 400));
    }

    if (!order.orderCompletion) {
        return next(
            new HttpError("a request to complete the order does not exist", 400)
        );
    }

    if (order.originId !== user.id) {
        return next(
            new HttpError(
                "you are unauthorized to handle the completion request of this order",
                400
            )
        );
    }

    try {
        await prisma.$transaction(async (prisma) => {
            let createdTransaction, createdDelivery;

            if (action === "accept") {
                // update the status of the order and create a transaction
                const operations = [
                    prisma.order.update({
                        where: {
                            id: order.id,
                        },
                        data: {
                            status: "COMPLETED",
                            isDeleted: true,
                        },
                    }),
                    prisma.transaction.create({
                        data: {
                            orderId: order.id,
                            createdMonth: new Date().getMonth(),
                            createdYear: new Date().getFullYear(),
                        },
                        select: transactionSelectionFields,
                    }),
                ];

                if (order.isDelivered) {
                    // create a delivery
                    operations.push(
                        prisma.delivery.create({
                            data: {
                                orderId: order.id,
                                madeById: order.orderCompletion.requestorId,
                            },
                            include: deliveryInclusionFields,
                        })
                    );
                }

                if (order.product.isSecondHand) {
                    // second hand product -> hasBeenSold true after order completion
                    operations.push(
                        prisma.product.update({
                            where: {
                                id: order.product.id,
                            },
                            data: {
                                hasBeenSold: true,
                            },
                        })
                    );
                }

                const data = await Promise.all(operations);
                createdTransaction = data[1];
                createdDelivery = data[2];
            }

            // delete order completion request
            await prisma.orderCompletion.delete({
                where: {
                    id: order.orderCompletion.id,
                },
            });

            io.emit(`order-completion-${action}`, {
                id: order.id,
                originId: order.originId,
                updateInfo:
                    action === "accept"
                        ? {
                              status: "completed",
                              orderCompletion: null,
                          }
                        : {
                              orderCompletion: null,
                          },
            });

            if (createdTransaction) {
                io.emit("new-transaction", createdTransaction);
            }

            if (createdDelivery) {
                io.emit("delivery-completion", {
                    ...createdDelivery,
                });
            }

            response.json(
                action === "accept" ? { transaction: createdTransaction } : {}
            );
        });
    } catch (error) {
        console.log(error);
        next(new HttpError());
    }
};
