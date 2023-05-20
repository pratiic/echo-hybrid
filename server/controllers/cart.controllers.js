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
    // 3. remove variant from cart

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
                    },
                },
                store: {
                    select: {
                        userId: true,
                    },
                },
            },
        });

        if (!product) {
            return next(new HttpError("product not found", 404));
        }

        if (product.store.userId === user.id) {
            return next(new HttpError("cannot buy your own product", 400));
        }

        const { isSecondHand, cartItems } = product;

        if (isSecondHand) {
            // check if the product already exists in the cart
            if (cartItems.find((cartItem) => cartItem.cartId === cart.id)) {
                return next(
                    new HttpError(
                        "this product already exists in your cart",
                        400
                    )
                );
            }

            itemData = {
                cartId: cart.id,
                productId,
            };
        } else {
            // validate cart item info
            let errorMsg = validateCartItem(
                { productId, variantId, quantity },
                variantId ? "varied" : "flat"
            );

            if (errorMsg) {
                return next(new HttpError(errorMsg, 400));
            }
        }

        const cartItem = await prisma.cartItem.create({
            data: itemData,
        });

        response.json({ item: cartItem });
    } catch (error) {
        return next(new HttpError());
    }
};

export const getCartItems = async (request, response, next) => {
    const user = request.user;
    const cart = user.cart;

    if (!cart) {
        return next(new HttpError("you do not have a shopping cart", 400));
    }

    try {
        const cartItems = await prisma.cartItem.findMany({
            where: {
                cartId: cart.id,
            },
            orderBy: {
                updatedAt: "desc",
            },
        });

        response.json({ items: cartItems });
    } catch (error) {
        next(new HttpError());
    }
};
