import { getExisting } from "../lib/cart.lib.js";
import prisma from "../lib/prisma.lib.js";
import { HttpError } from "../models/http-error.models.js";
import { validateCartItem } from "../validators/cart.validators.js";

export const createUserCart = async (request, response, next) => {
    const user = request.user;
    const cartData = {
        userId: user.id,
    };

    try {
        const cart = await prisma.cart.upsert({
            where: {
                userId: user.id,
            },
            create: cartData,
            update: cartData,
        });

        response.status(201).json({ cart: cart });
    } catch (error) {
        next(new HttpError());
    }
};

export const setCartItem = async (request, response, next) => {
    // 1. add an item to the cart
    // 2. increment and decrement quantity

    const user = request.user;
    let cart = user.cart;
    const productId = parseInt(request.params.productId) || 0;
    let itemData = {};

    if (!cart) {
        try {
            cart = await prisma.cart.create({
                data: {
                    userId: user.id,
                },
            });
        } catch (error) {
            return next(new HttpError());
        }
    }

    try {
        let { variantId, quantity } = request.body;
        quantity = parseInt(quantity);

        const product = await prisma.product.findUnique({
            where: {
                id: productId,
            },
            select: {
                id: true,
                isSecondHand: true,
                cartItems: {
                    select: {
                        id: true,
                        cartId: true,
                        variant: true,
                    },
                },
                store: {
                    select: {
                        userId: true,
                    },
                },
                stockType: true,
                stock: true,
            },
        });

        if (!product) {
            return next(new HttpError("product not found", 404));
        }

        if (product.store.userId === user.id) {
            return next(new HttpError("cannot buy your own product", 400));
        }

        // update item data
        itemData = {
            cartId: cart.id,
            productId,
        };

        const { isSecondHand, cartItems, stockType, stock } = product;

        if (isSecondHand) {
            // check if the product already exists in the cart
            if (getExisting(cartItems, cart.id)) {
                return next(
                    new HttpError(
                        "this product already exists in your cart",
                        400
                    )
                );
            }

            const cartItem = await prisma.cartItem.create({
                data: itemData,
            });

            response.json({ item: cartItem });
        } else {
            // cannot buy a product if its stock has not been set yet
            if (!stock) {
                return next(
                    new HttpError("this product is not active yet", 400)
                );
            }

            // validate cart item info
            let errorMsg = validateCartItem(
                { productId, variantId, quantity },
                stockType
            );

            if (errorMsg) {
                return next(new HttpError(errorMsg, 400));
            }

            let variant;

            if (stockType === "varied") {
                // check if the variant exists
                variant = stock.variants?.find(
                    (variant) => variant.id === variantId
                );

                if (!variant) {
                    return next(new HttpError("variant not found", 404));
                }

                // avoid provided quantity from being larger than available quantity
                if (quantity > variant.quantity) {
                    quantity = parseInt(variant.quantity);
                }
            } else {
                // same as above
                if (quantity > stock.quantity) {
                    quantity = parseInt(stock.quantity);
                }
            }

            // update item data
            itemData.quantity = quantity;

            if (stockType === "varied") {
                itemData.variant = variant;
            }

            // check if the product already exists in the cart
            let existingItem;
            let finalItem;

            if (stockType === "flat") {
                existingItem = getExisting(cartItems, cart.id);
            } else {
                // for varied stock variant id must also match
                existingItem = cartItems.find(
                    (cartItem) =>
                        cartItem.cartId === cart.id &&
                        cartItem.variant.id === variant.id
                );
            }

            if (existingItem) {
                finalItem = await prisma.cartItem.update({
                    where: {
                        id: existingItem.id,
                    },
                    data: itemData,
                });
            } else {
                finalItem = await prisma.cartItem.create({
                    data: itemData,
                });
            }

            response.json({ item: finalItem });
        }
    } catch (error) {
        console.log(error);
        return next(new HttpError());
    }
};

export const getCartItems = async (request, response, next) => {
    const user = request.user;
    let cart = user.cart;

    try {
        if (!cart) {
            try {
                cart = await prisma.cart.create({
                    data: {
                        userId: user.id,
                    },
                });

                response.json({ items: [] });
            } catch (error) {
                console.log(error);
                return next(new HttpError());
            }
        }

        const cartItems = await prisma.cartItem.findMany({
            where: {
                cartId: cart.id,
            },
            include: {
                product: {
                    include: {
                        store: {
                            select: {
                                id: true,

                                user: {
                                    select: {
                                        id: true,
                                        address: true,
                                    },
                                },
                                business: {
                                    select: {
                                        id: true,
                                        address: true,
                                    },
                                },
                            },
                        },
                        stock: true,
                    },
                },
            },
            orderBy: {
                updatedAt: "desc",
            },
        });

        response.json({ items: cartItems });
    } catch (error) {
        console.log(error);
        next(new HttpError());
    }
};

export const removeCartItem = async (request, response, next) => {
    const cart = request.user.cart;
    const itemId = parseInt(request.params.itemId) || 0;

    if (!cart) {
        return next(new HttpError("you do not have a shopping cart", 400));
    }

    if (!cart.items.find((item) => item.id === itemId)) {
        return next(
            new HttpError("cart item not found in your shopping cart", 404)
        );
    }

    try {
        await prisma.cartItem.delete({
            where: {
                id: itemId,
            },
        });

        response.json({ message: "cart item has been removed" });
    } catch (error) {
        next(new HttpError());
    }
};

export const checkOrderAbility = async (request, response, next) => {
    // some cart items cannot be ordered -> available quantity / availability (second hand) of corresponding product / variant may have changed
    const cartItems = request.user.cart.items;

    if (cartItems.length === 0) {
        return next(
            new HttpError("there are no items in your shopping cart", 400)
        );
    }

    let cannotOrder = []; // info about items that cannot be ordered

    cartItems.forEach((item) => {
        const { product, variant: itemVariant, quantity: itemQuantity } = item;
        let itemInfo = null;

        if (product.isSecondHand) {
            if (!product.storeId) {
                // product has been sold or deleted
                itemInfo = {
                    maxQuantity: -1,
                };
            }
        } else {
            if (!product.storeId) {
                // product has been deleted
                itemInfo = {
                    maxQuantity: -1,
                };
            } else if (itemVariant) {
                // stock type is varied
                const productVariant = product.stock.variants.find(
                    (variant) => variant.id === itemVariant.id
                );

                if (itemQuantity > productVariant.quantity) {
                    itemInfo = {
                        maxQuantity: productVariant.quantity,
                    };
                }
            } else {
                // stock type is flat
                const productQuantity = product.stock.quantity;

                if (itemQuantity > productQuantity) {
                    itemInfo = {
                        maxQuantity: productQuantity,
                    };
                }
            }
        }

        if (itemInfo) {
            cannotOrder.push({ ...itemInfo, id: item.id });
        }
    });

    response.json({
        cannotOrder,
    });
};
