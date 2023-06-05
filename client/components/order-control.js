import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { InformationCircleIcon } from "@heroicons/react/outline";
import { useRouter } from "next/router";

import { fetcher } from "../lib/fetcher";
import { capitalizeFirstLetter } from "../lib/strings";
import { setAlert, setErrorAlert } from "../redux/slices/alerts-slice";
import {
    closeModal,
    showConfirmationModal,
    showLoadingModal,
    showGenericModal,
} from "../redux/slices/modal-slice";
import { deleteOrder, updateOrder } from "../redux/slices/orders-slice";
// import { addTransaction } from "../redux/slices/transactions-slice";

import Button from "./button";
import { updateDelivery } from "../redux/slices/delivery-slice";

const OrderControl = ({
    orderId,
    status,
    origin,
    product,
    orderCompletion,
    orderType,
    store,
    isDelivered,
}) => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { authUser } = useSelector((state) => state.auth);

    const getStatus = (action) => {
        return action === "package" ? "packaged" : `${action}ed`;
    };

    const controlOrder = (event, action) => {
        event.stopPropagation();

        const modalTitle = action === "package" ? "order package" : "";

        dispatch(
            showConfirmationModal({
                title: modalTitle,
                message:
                    action === "package"
                        ? "Are you sure that the product has been packaged and ready for delivery ?"
                        : `Are you sure you want to ${action} this order?`,
                handler: async () => {
                    dispatch(showLoadingModal(`${action}ing this order...`));

                    try {
                        const data = await fetcher(
                            `orders/${orderId}/?action=${action}`,
                            "PATCH"
                        );

                        if (action === "confirm" || action === "package") {
                            dispatch(
                                updateOrder({
                                    id: orderId,
                                    type: "seller",
                                    updateInfo: { status: data.order.status },
                                })
                            );
                        }

                        if (action === "reject") {
                            dispatch(
                                deleteOrder({ id: orderId, type: "seller" })
                            );
                        }

                        dispatch(
                            setAlert({
                                message: `Order has been ${getStatus(action)}`,
                                type: "success",
                            })
                        );

                        try {
                            fetcher("notifications", "POST", {
                                destinationId: origin.id,
                                text: `Your order of ${capitalizeFirstLetter(
                                    product.name
                                )} has been ${getStatus(action)}`,
                                linkTo: `/orders/?show=user`,
                            });
                        } catch (error) {
                            console.log(error);
                        }
                    } catch (error) {
                        dispatch(setErrorAlert(error.message));
                    } finally {
                        dispatch(closeModal());
                    }
                },
            })
        );
    };

    const handleOrderCompletion = (event, action = "req") => {
        event.stopPropagation();

        if (
            (action === "accept" || action === "reject") &&
            authUser?.id !== origin?.id
        ) {
            // only the buyer is allowed to accept or reject a completion request
            return null;
        }

        const confirmationTitle = `order completion ${
            action === "accept"
                ? "confirmation"
                : action === "reject"
                ? "rejection"
                : "request"
        }`;
        const confirmationMsg = `Are you ${
            action === "req"
                ? "saying"
                : action === "accept"
                ? "confirming"
                : "denying"
        } that this order has been ${
            isDelivered ? "delivered" : "completed"
        } ?`;

        dispatch(
            showConfirmationModal({
                title: confirmationTitle,
                message: confirmationMsg,
                handler: async () => {
                    try {
                        dispatch(
                            showLoadingModal("processing your request...")
                        );

                        const data = await fetcher(
                            `orders/${orderId}/completion/?action=${action}`, // action not actually need while requesting
                            action === "req" ? "POST" : "PATCH"
                        );

                        let updateInfo = {};
                        let notification = {};

                        if (action === "req") {
                            updateInfo = {
                                orderCompletion: data.request,
                            };

                            // prepare notification data
                            notification.destinationId = origin?.id;
                            notification.text = `a completion request for the order of - ${product?.name} - with order Id ${orderId} has been received`;
                            notification.linkTo = `/orders/?show=user`;
                        } else {
                            if (action === "accept") {
                                // const transaction = data.transaction;
                                updateInfo = {
                                    status: "completed",
                                };

                                //add a new transaction
                                // dispatch(
                                //     addTransaction({
                                //         transaction,
                                //         type: orderType,
                                //     })
                                // );
                                // delete the completed order
                                dispatch(
                                    deleteOrder({
                                        type: orderType,
                                        id: orderId,
                                    })
                                );

                                router.push(`/transactions/?show=${orderType}`);
                            } else {
                                updateInfo = {
                                    orderCompletion: null,
                                };
                            }

                            // prepare notification data
                            notification.destinationId =
                                orderCompletion?.madeBy === "SELLER"
                                    ? store?.userId
                                    : 0; // destinationId -> 0 for delivery personnel
                            notification.text = `the completion request for the order of - ${product?.name} - with order Id ${orderId} has been ${action}ed`;
                            notification.linkTo =
                                orderCompletion?.madeBy === "SELLER"
                                    ? `/${
                                          action === "accept"
                                              ? "transactions"
                                              : "orders"
                                      }/?show=seller`
                                    : `/${
                                          action === "accept"
                                              ? "delivery/?show=completed"
                                              : "delivery/?show=pending"
                                      }`; // do not redirect anywhere in case of delivery personnel
                        }

                        // orderCompletion.madeBy -> SELLER, then update order
                        // orderCompletion.madeBy -> DELIVERY_PERSONNEL, then update pending delivery

                        if (!authUser?.isDeliveryPersonnel) {
                            dispatch(
                                updateOrder({
                                    id: orderId,
                                    type: router.query.show,
                                    updateInfo,
                                })
                            );
                        } else {
                            dispatch(
                                updateDelivery({
                                    id: orderId,
                                    type: "pending",
                                    updateInfo,
                                })
                            );
                        }

                        dispatch(
                            setAlert({
                                message:
                                    action === "req"
                                        ? "order completion request has been made"
                                        : `order completion request has been ${action}ed`,
                            })
                        );

                        // send notification
                        fetcher("notifications", "POST", notification);
                    } catch (error) {
                        dispatch(setErrorAlert(error.message));
                    } finally {
                        dispatch(closeModal());
                    }
                },
            })
        );
    };

    const handleInfoClick = (event) => {
        event.stopPropagation();

        const CompletionInfo = () => {
            return (
                <div>
                    <h3 className="heading-generic-modal">Order completion</h3>

                    <div className="max-w-[350px] dark-light -mt-1">
                        <p>
                            To complete an order, there has to be an agreement
                            from both sides.
                        </p>
                        <p>
                            The seller or a delivery personnel claims that an
                            order has been completed or delivered and the
                            request may be accepted or rejected by the buyer.
                        </p>
                    </div>
                </div>
            );
        };

        dispatch(showGenericModal(<CompletionInfo />));
    };

    const renderControl = () => {
        if (status === "PLACED" && authUser?.id === store?.userId) {
            return (
                <React.Fragment>
                    <Button
                        small
                        onClick={(event) => controlOrder(event, "confirm")}
                    >
                        Accept Order
                    </Button>
                    <Button
                        type="tertiary"
                        small
                        onClick={(event) => controlOrder(event, "reject")}
                    >
                        Reject Order
                    </Button>
                </React.Fragment>
            );
        } else if (status === "CONFIRMED" && authUser?.id === store?.userId) {
            return (
                <Button
                    small
                    onClick={(event) => controlOrder(event, "package")}
                >
                    Set Packaged
                </Button>
            );
        } else if (status === "PACKAGED") {
            // isDelivered -> allow delivery personnel
            // not isDelivered -> allow seller
            // access to order completion
            const isAuthUserOriginator = origin?.id === authUser?.id; // auth user made the order
            const isAuthUserSeller = store?.userId === authUser?.id;

            if (
                isDelivered &&
                !authUser?.isDeliveryPersonnel &&
                !isAuthUserOriginator
            ) {
                return null;
            }

            if (!isDelivered && !isAuthUserSeller && !isAuthUserOriginator) {
                return null;
            }

            if (orderCompletion) {
                if (
                    orderCompletion?.madeBy === "DELIVERY_PERSONNEL" &&
                    !authUser?.isDeliveryPersonnel &&
                    !isAuthUserOriginator
                ) {
                    return null;
                }

                if (
                    orderCompletion?.madeBy === "SELLER" &&
                    !isAuthUserSeller &&
                    !isAuthUserOriginator
                ) {
                    return null;
                }

                if (isAuthUserOriginator) {
                    return (
                        <div className="max-w-[300px]">
                            <p className="mb-3">
                                Order completion request was received. Has this
                                order been{" "}
                                {isDelivered ? "delivered" : "completed"} ?
                            </p>
                            <div className="flex space-x-3">
                                <Button
                                    onClick={(event) =>
                                        handleOrderCompletion(event, "accept")
                                    }
                                >
                                    yes
                                </Button>
                                <Button
                                    type="tertiary"
                                    onClick={(event) =>
                                        handleOrderCompletion(event, "reject")
                                    }
                                >
                                    no
                                </Button>
                            </div>
                        </div>
                    );
                }

                return (
                    <p className="italic max-w-[300px]">
                        Order completion request has been sent, waiting
                        confirmation
                    </p>
                );
            }

            if (isDelivered && !authUser?.isDeliveryPersonnel) {
                return null;
            }

            if (!isDelivered && !isAuthUserSeller) {
                return null;
            }

            return (
                <div className="flex items-center">
                    <InformationCircleIcon
                        className="icon mr-3"
                        onClick={handleInfoClick}
                    />
                    <Button
                        small
                        onClick={(event) => handleOrderCompletion(event)}
                    >
                        request completion
                    </Button>
                </div>
            );
        }
    };

    return <div className="flex space-x-5 mt-5 text-sm">{renderControl()}</div>;
};

export default OrderControl;
