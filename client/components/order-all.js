import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";

import { fetcher } from "../lib/fetcher";
import { setAlert, setErrorAlert } from "../redux/slices/alerts-slice";
import {
    closeModal,
    showConfirmationModal,
    showGenericModal,
    showLoadingModal,
} from "../redux/slices/modal-slice";
import { setNeedToFetch } from "../redux/slices/orders-slice";
import { deleteCartItem } from "../redux/slices/cart-slice";
import { singularOrPluralCount } from "../lib/strings";
import { checkDelivery } from "../lib/delivery";

import Button from "./button";

const GenericChild = ({ removeCartItems, cannotOrder, items }) => {
    const dispatch = useDispatch();

    return (
        <div className="max-w-[350px]">
            <h4 className="heading-generic-modal-thin">Order failed</h4>
            <p className="dark-light -mt-2 mb-3">
                The reason for the failure of each cart item is given below:
            </p>

            <div>
                {cannotOrder.map((orderInfo) => {
                    return (
                        <div className="flex items-center" key={orderInfo.id}>
                            <span className="black-white w-[50px]">
                                # {orderInfo.id}
                            </span>
                            <span className="dark-light">
                                {orderInfo.maxQuantity === -3 &&
                                    "Seller has been suspended"}

                                {orderInfo.maxQuantity === -2 &&
                                    "Has been suspended"}

                                {orderInfo.maxQuantity === -1 &&
                                    (orderInfo.isSecondHand
                                        ? "Has been sold or deleted"
                                        : "Has been deleted")}

                                {orderInfo.maxQuantity === 0 && "Out of stock"}

                                {orderInfo.maxQuantity > 0 &&
                                    `Only ${
                                        orderInfo.maxQuantity
                                    } ${singularOrPluralCount(
                                        orderInfo.maxQuantity,
                                        "unit",
                                        "units"
                                    )} available`}
                            </span>
                        </div>
                    );
                })}
            </div>

            {items.length >= cannotOrder.length && (
                <div className="mt-3">
                    <span className="black-white">
                        Would you like to remove{" "}
                        {cannotOrder.length > 1
                            ? "these cart items"
                            : "this cart item"}{" "}
                        ?
                    </span>

                    <div className="flex items-center space-x-3 mt-3">
                        <Button
                            small
                            onClick={() =>
                                removeCartItems(
                                    cannotOrder.map((item) => item.id)
                                )
                            }
                        >
                            Yes
                        </Button>
                        <Button
                            small
                            type="secondary"
                            onClick={() => dispatch(closeModal())}
                        >
                            No
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

const OrderAll = ({ items }) => {
    const { authUser } = useSelector((state) => state.auth);
    const router = useRouter();
    const dispatch = useDispatch();

    const placeOrders = async (cannotOrder = []) => {
        const itemsToOrder = items.filter(
            (item) => !cannotOrder.find((orderInfo) => orderInfo.id === item.id)
        );

        const orderDataList = [];
        itemsToOrder.forEach((item) => {
            const { productId, quantity, variant, product } = item;
            const orderData = {
                quantity,
                variantId: variant?.id,
                consumerAddress: checkDelivery(
                    authUser?.address,
                    product.isSecondHand
                        ? product.store?.user?.address
                        : product.store?.business?.address
                )
                    ? authUser?.address
                    : null,
                productId,
            };

            orderDataList.push(orderData);
        });

        try {
            dispatch(showLoadingModal("placing orders..."));

            const results = await Promise.all(
                orderDataList.map((data) => {
                    return fetcher(`orders/${data.productId}`, "POST", data);
                })
            );

            if (results.length !== itemsToOrder.length) {
                dispatch(
                    setErrorAlert(
                        `${itemsToOrder.length - results.length} orders failed`
                    )
                );
            }

            // delete cart items
            results.map((result) => {
                if (result.cartItemId) {
                    dispatch(deleteCartItem(result.cartItemId));
                }
            });

            dispatch(setNeedToFetch({ needToFetch: true, type: "user" }));
            router.push(`/orders/?show=user`);
        } catch (error) {
            dispatch(setErrorAlert(error.message));
        } finally {
            dispatch(closeModal());
        }
    };

    const handleOrderAllClick = () => {
        if (!authUser?.address) {
            dispatch(
                setAlert({
                    message: "you need to set your address first",
                    type: "info",
                })
            );
            return router.push(
                `/profile/?show=address&redirect=${router.pathname}`
            );
        }

        dispatch(
            showConfirmationModal({
                title: "order all items",
                message:
                    "are you sure you want to order all items in your cart ?",
                handler: async () => {
                    dispatch(
                        showLoadingModal(
                            "checking if all items can be ordered..."
                        )
                    );

                    try {
                        const data = await fetcher("carts/checkout", "GET");
                        dispatch(closeModal());

                        if (data.cannotOrder.length > 0) {
                            dispatch(
                                showGenericModal(
                                    <GenericChild
                                        removeCartItems={removeCartItems}
                                        cannotOrder={data.cannotOrder}
                                        items={items}
                                    />
                                )
                            );
                        } else {
                            placeOrders();
                        }
                    } catch (error) {
                        dispatch(closeModal());
                        dispatch(setErrorAlert(error.message));
                    }
                },
            })
        );
    };

    const removeCartItems = async (itemIds) => {
        try {
            dispatch(showLoadingModal("removing cart items..."));

            await Promise.all(
                itemIds.map((itemId) => {
                    return fetcher(`carts/${itemId}`, "DELETE");
                })
            );

            itemIds.forEach((itemId) => {
                dispatch(deleteCartItem(itemId));
            });
            dispatch(setAlert({ message: "cart items have been removed" }));
        } catch (error) {
            dispatch(setErrorAlert(error.message));
        } finally {
            dispatch(closeModal());
        }
    };

    return (
        <Button type="primary" small onClick={handleOrderAllClick}>
            Order All
        </Button>
    );
};

export default OrderAll;
