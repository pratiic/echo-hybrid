import React, { useState, useEffect } from "react";
import { XCircleIcon, ChatAlt2Icon } from "@heroicons/react/outline";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";

import { capitalizeFirstLetter } from "../lib/strings";
import {
    closeModal,
    showConfirmationModal,
    showLoadingModal,
} from "../redux/slices/modal-slice";
import { fetcher } from "../lib/fetcher";
import { setAlert, setErrorAlert } from "../redux/slices/alerts-slice";
import { deleteOrder } from "../redux/slices/orders-slice";
import { MenuAlt4Icon } from "@heroicons/react/outline";

import Dropdown from "./dropdown";
import DropdownItem from "./dropdown-item";
import OrderControl from "./order-control";
import OrderTimeline from "./order-timeline";
import OrderHead from "./order-head";
import OrderRest from "./order-rest";
import Icon from "./icon";

const OrderCard = ({
    id,
    product,
    store,
    consumerAddress,
    origin,
    variant,
    quantity,
    status,
    unitPrice,
    isDelivered,
    deliveryCharge,
    orderCompletion,
    createdAt,
}) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [isUserOrder, setIsUserOrder] = useState(false);
    const [isSellerOrder, setIsSellerOrder] = useState(false);
    const dispatch = useDispatch();
    const router = useRouter();

    const { authUser } = useSelector((state) => state.auth);

    useEffect(() => {
        setIsUserOrder(origin.id === authUser?.id);
        setIsSellerOrder(store.userId === authUser?.id);
    }, [origin, authUser]);

    const renderDropdownItems = () => {
        // can cancel if status is placed
        // can delete if status is rejected
        if (
            ((status === "PLACED" || status === "REJECTED") &&
                !isSellerOrder) ||
            (status === "CANCELLED" && isSellerOrder)
        ) {
            return (
                <React.Fragment>
                    {status === "PLACED" && isUserOrder && (
                        <DropdownItem
                            icon={<XCircleIcon className="icon-no-bg" />}
                            propagateEvent={false}
                            onClick={handleOrderCancellation}
                        >
                            cancel order
                        </DropdownItem>
                    )}

                    {((status === "REJECTED" && isUserOrder) ||
                        (status === "CANCELLED" && isSellerOrder)) && (
                        <DropdownItem
                            action="delete"
                            propagateEvent={false}
                            onClick={handleOrderDeletion}
                        >
                            delete order
                        </DropdownItem>
                    )}
                </React.Fragment>
            );
        }
    };

    const renderDropdown = () => {
        return (
            <div className="relative">
                <Icon toolName="options" onClick={toggleDropdown}>
                    <MenuAlt4Icon className="icon-small" />
                </Icon>

                <Dropdown
                    show={showDropdown}
                    position="top"
                    toggleDropdown={toggleDropdown}
                >
                    <DropdownItem
                        icon={<ChatAlt2Icon className="icon-no-bg" />}
                        onClick={handleChatClick}
                    >
                        chat now
                    </DropdownItem>

                    {renderDropdownItems()}
                </Dropdown>
            </div>
        );
    };

    const handleChatClick = (event) => {
        event.stopPropagation();

        router.push(`/chats/${isUserOrder ? store?.user?.id : origin.id}`);
    };

    const toggleDropdown = (event) => {
        event.stopPropagation();

        setShowDropdown(!showDropdown);
    };

    const handleOrderCancellation = () => {
        dispatch(
            showConfirmationModal({
                message: "are you sure you want to cancel your order ?",
                handler: async () => {
                    dispatch(showLoadingModal("cancelling your order..."));

                    try {
                        await fetcher(`orders/${id}/?action=cancel`, "PATCH");

                        dispatch(deleteOrder({ id, type: "user" }));
                        dispatch(
                            setAlert({
                                message: "your order has been cancelled",
                                type: "success",
                            })
                        );

                        try {
                            fetcher("notifications", "POST", {
                                destinationId: store?.userId,
                                text: `The order of ${capitalizeFirstLetter(
                                    product.name
                                )} has been cancelled`,
                                linkTo: `orders/?show=seller`,
                            });
                        } catch (error) {}
                    } catch (error) {
                        dispatch(setErrorAlert(error.message));
                    } finally {
                        dispatch(closeModal());
                    }
                },
            })
        );
    };

    const handleOrderDeletion = () => {
        dispatch(
            showConfirmationModal({
                message: "are you sure you want to delete this order ?",
                handler: async () => {
                    dispatch(showLoadingModal("deleting your order..."));

                    try {
                        await fetcher(`orders/${id}`, "DELETE");

                        dispatch(
                            deleteOrder({
                                id,
                                type: status === "REJECTED" ? "user" : "seller",
                            })
                        );
                        dispatch(
                            setAlert({
                                message: "the order was deleted",
                                type: "success",
                            })
                        );
                    } catch (error) {
                        dispatch(setErrorAlert(error.message));
                    } finally {
                        dispatch(closeModal());
                    }
                },
            })
        );
    };

    const handleOrderClick = () => {
        router.push(`/products/${product.id}`);
    };

    return (
        <div className="card-transparent" onClick={handleOrderClick}>
            <div>
                <OrderHead {...{ product, variant, quantity }} />

                {/* order control */}
                <OrderControl
                    orderId={id}
                    status={status}
                    origin={origin}
                    product={product}
                    orderCompletion={orderCompletion}
                    orderType={isUserOrder ? "user" : "seller"}
                    store={store}
                    isDelivered={isDelivered}
                />

                {/* order timeline */}
                <OrderTimeline status={status} isDelivered={isDelivered} />
            </div>

            <OrderRest
                {...{
                    id,
                    isSellerItem: isSellerOrder,
                    isUserItem: isUserOrder,
                    user: origin,
                    store,
                    address: consumerAddress,
                    isDelivered,
                    deliveryCharge,
                    unitPrice,
                    quantity,
                    createdAt,
                }}
            />

            {/* order dropdown */}
            <div className="absolute bottom-0 right-0">{renderDropdown()}</div>
        </div>
    );
};

export default OrderCard;
