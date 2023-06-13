import React, { useState } from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { MenuAlt4Icon } from "@heroicons/react/outline";

import { deleteProduct } from "../redux/slices/products-slice";
import { fetcher } from "../lib/fetcher";
import {
    closeModal,
    showConfirmationModal,
    showGenericModal,
    showLoadingModal,
} from "../redux/slices/modal-slice";
import { setActiveProduct } from "../redux/slices/products-slice";
import { setAlert, setErrorAlert } from "../redux/slices/alerts-slice";

import Dropdown from "./dropdown";
import DropdownItem from "./dropdown-item";
import Icon from "./icon";
import TargetReporter from "./target-reporter";

const ProductMenu = ({ id, isMyProduct, hasBeenSold, store }) => {
    const [showDropdown, setShowDropdown] = useState(false);

    const router = useRouter();
    const dispatch = useDispatch();

    const toggleDropdown = (event) => {
        event.stopPropagation();

        setShowDropdown(!showDropdown);
    };

    const handleDeletion = () => {
        const productId = parseInt(router.query.id);

        dispatch(
            showConfirmationModal({
                title: "product deletion",
                message:
                    "You will not be able to revert this action, however product details will remain in existing orders and transactions. Continue ?",
                handler: async () => {
                    dispatch(showLoadingModal("deleting your product..."));
                    try {
                        await fetcher(`products/${productId}`, "DELETE");

                        dispatch(setActiveProduct(null));
                        dispatch(
                            setAlert({
                                message: "your product has been deleted",
                            })
                        );
                        dispatch(deleteProduct(productId));
                        router.push("/products");
                    } catch (error) {
                        dispatch(setErrorAlert(error.message));
                    } finally {
                        dispatch(closeModal());
                    }
                },
            })
        );
    };

    const handleChatClick = () => {
        router.push(`/chats/${store?.userId}`);
    };

    const handleReportClick = () => {
        dispatch(
            showGenericModal(
                <TargetReporter targetType="product" targetId={id} />
            )
        );
    };

    return (
        <div className="w-fit">
            <Icon
                onClick={toggleDropdown}
                className="icon ml-2 -mt-1 500:-mt-2"
                toolName="options"
            >
                <MenuAlt4Icon />
            </Icon>

            <Dropdown show={showDropdown} toggleDropdown={toggleDropdown}>
                {isMyProduct && (
                    <React.Fragment>
                        {!hasBeenSold && (
                            <DropdownItem
                                action="update"
                                onClick={() =>
                                    router.push("/set-product/?mode=update")
                                }
                            >
                                update product
                            </DropdownItem>
                        )}

                        <DropdownItem action="delete" onClick={handleDeletion}>
                            delete product
                        </DropdownItem>
                    </React.Fragment>
                )}

                {!isMyProduct && (
                    <React.Fragment>
                        <DropdownItem
                            action="report"
                            onClick={handleReportClick}
                        >
                            report product
                        </DropdownItem>

                        <DropdownItem
                            action="chat"
                            textAsIs
                            onClick={handleChatClick}
                        >
                            Chat with Seller
                        </DropdownItem>
                    </React.Fragment>
                )}
            </Dropdown>
        </div>
    );
};

export default ProductMenu;
