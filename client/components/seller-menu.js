import React, { useState, useEffect } from "react";
import { MenuAlt4Icon, IdentificationIcon } from "@heroicons/react/outline";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";

import {
    closeModal,
    showConfirmationModal,
    showGenericModal,
    showLoadingModal,
} from "../redux/slices/modal-slice";
import { fetcher } from "../lib/fetcher";
import { setAlert, setErrorAlert } from "../redux/slices/alerts-slice";
import { updateAuthUser } from "../redux/slices/auth-slice";

import Icon from "./icon";
import Dropdown from "./dropdown";
import DropdownItem from "./dropdown-item";
import TargetReporter from "./target-reporter";
import BusinessDetails from "./business-details";

const SellerMenu = ({ storeId, storeType, isMyStore, business }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [deletionTitle, setDeletionTitle] = useState("");

    const { authUser } = useSelector((state) => state.auth);

    const dispatch = useDispatch();
    const router = useRouter();

    useEffect(() => {
        setDeletionTitle(
            storeType === "IND"
                ? "seller profile deletion"
                : "business deletion"
        );
    }, [storeType]);

    const toggleDropdown = (event) => {
        event.stopPropagation();

        setShowDropdown(!showDropdown);
    };

    const onDeleteClick = () => {
        dispatch(
            showConfirmationModal({
                title: deletionTitle,
                message: `All the products you may have posted will be deleted. Are you sure you want to continue ?`,
                handler: async () => {
                    dispatch(
                        showLoadingModal("deleting your seller profile...")
                    );

                    try {
                        await fetcher("stores", "DELETE");

                        dispatch(
                            setAlert({
                                message: "your seller profile has been deleted",
                            })
                        );
                        dispatch(
                            updateAuthUser({
                                store: null,
                            })
                        );
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

    const onReportClick = () => {
        dispatch(
            showGenericModal(
                <TargetReporter targetType="seller" targetId={storeId} />
            )
        );
    };

    const onChatClick = () => {
        router.push(`/chats/${storeId}`);
    };

    const onDetailsClick = () => {
        dispatch(showGenericModal(<BusinessDetails {...business} />));
    };

    return (
        <div className="relative">
            <Icon className="icon" onClick={toggleDropdown}>
                <MenuAlt4Icon />
            </Icon>

            <Dropdown show={showDropdown} toggleDropdown={toggleDropdown}>
                {isMyStore ? (
                    <DropdownItem action="delete" onClick={onDeleteClick}>
                        delete seller profile
                    </DropdownItem>
                ) : (
                    <React.Fragment>
                        <DropdownItem
                            action="chat"
                            textAsIs
                            onClick={onChatClick}
                        >
                            Chat with Seller
                        </DropdownItem>

                        {!(
                            authUser?.isAdmin || authUser?.isDeliveryPersonnel
                        ) && (
                            <DropdownItem
                                action="report"
                                onClick={onReportClick}
                            >
                                report seller
                            </DropdownItem>
                        )}

                        {authUser?.isAdmin && (
                            <DropdownItem
                                icon={
                                    <IdentificationIcon className="icon-no-bg" />
                                }
                                onClick={onDetailsClick}
                            >
                                business details
                            </DropdownItem>
                        )}
                    </React.Fragment>
                )}
            </Dropdown>
        </div>
    );
};

export default SellerMenu;
