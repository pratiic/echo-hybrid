import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { ChatAlt2Icon, MenuAlt4Icon } from "@heroicons/react/outline";

import { setAlert, setErrorAlert } from "../redux/slices/alerts-slice";
import {
    closeModal,
    showConfirmationModal,
    showLoadingModal,
} from "../redux/slices/modal-slice";
import { deleteTransaction } from "../redux/slices/transactions-slice";
import { fetcher } from "../lib/fetcher";

import OrderHead from "./order-head";
import OrderRest from "./order-rest";
import Dropdown from "./dropdown";
import DropdownItem from "./dropdown-item";

const TransactionCard = ({
    id,
    order: {
        product,
        quantity,
        variant,
        origin,
        store,
        address,
        deliveryType,
        deliveryCharge,
        unitPrice,
    },
    createdAt,
}) => {
    const [isUserTransaction, setUserTransaction] = useState(false);
    const [isSellerTransaction, setSellerTransaction] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const { authUser } = useSelector((state) => state.auth);

    const router = useRouter();
    const dispatch = useDispatch();

    useEffect(() => {
        setUserTransaction(origin?.id === authUser?.id);
        setSellerTransaction(store?.user?.id === authUser?.id);
    }, [origin, store, authUser]);

    const handleTransactionClick = () => {
        router.push(`/products/${product?.id}`);
    };

    const toggleDropdown = (event) => {
        if (event) {
            event.stopPropagation();
        }

        setShowDropdown(!showDropdown);
    };

    const handleChatClick = (event) => {
        event.stopPropagation();

        router.push(
            `/chats/${isUserTransaction ? store?.user?.id : origin?.id}`
        );
    };

    const handleTransactionDeletion = (event) => {
        event.stopPropagation();

        dispatch(
            showConfirmationModal({
                title: "transaction deletion",
                message: "Are you sure you want to delete this transaction?",
                handler: async () => {
                    dispatch(showLoadingModal("deleting your transaction..."));

                    try {
                        await fetcher(`transactions/${id}`, "DELETE");

                        dispatch(
                            deleteTransaction({
                                type: isUserTransaction ? "user" : "seller",
                                id,
                            })
                        );

                        dispatch(
                            setAlert({
                                message: "the transaction has been deleted",
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

    return (
        <div className="card-transparent" onClick={handleTransactionClick}>
            <OrderHead
                product={product}
                variant={variant}
                quantity={quantity}
            />

            <OrderRest
                isSellerItem={isSellerTransaction}
                isUserItem={isUserTransaction}
                user={origin}
                store={store}
                address={address}
                deliveryType={deliveryType}
                deliveryCharge={deliveryCharge}
                unitPrice={unitPrice}
                quantity={quantity}
                itemType="transaction"
                isProductSecondHand={product?.isSecondHand}
                productWarranty={product?.warranty}
                createdAt={createdAt}
            />

            <div className="absolute bottom-0 right-0">
                <MenuAlt4Icon
                    className="icon"
                    onClick={(event) => toggleDropdown(event)}
                />

                <Dropdown
                    show={showDropdown}
                    toggleDropdown={toggleDropdown}
                    position="top"
                >
                    <DropdownItem
                        icon={<ChatAlt2Icon className="icon-no-bg" />}
                        textAsIs
                        onClick={handleChatClick}
                    >
                        Chat with {isUserTransaction ? "seller" : "buyer"}
                    </DropdownItem>
                    <DropdownItem
                        action="delete"
                        onClick={handleTransactionDeletion}
                    >
                        delete transaction
                    </DropdownItem>
                </Dropdown>
            </div>
        </div>
    );
};

export default TransactionCard;
