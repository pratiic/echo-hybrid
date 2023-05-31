import { useState, useEffect } from "react";
import { MenuAlt4Icon } from "@heroicons/react/outline";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";

import {
    closeModal,
    showConfirmationModal,
    showLoadingModal,
} from "../redux/slices/modal-slice";
import { fetcher } from "../lib/fetcher";
import { setAlert, setErrorAlert } from "../redux/slices/alerts-slice";

import Icon from "./icon";
import Dropdown from "./dropdown";
import DropdownItem from "./dropdown-item";
import { updateAuthUser } from "../redux/slices/auth-slice";

const SellerMenu = ({ storeId, storeType }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [deletionTitle, setDeletionTitle] = useState("");

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

    return (
        <div className="relative">
            <Icon className="icon" onClick={toggleDropdown}>
                <MenuAlt4Icon />
            </Icon>

            <Dropdown show={showDropdown} toggleDropdown={toggleDropdown}>
                {/* <DropdownItem action="update" onClick={onUpdateClick}>
                    update shop
                </DropdownItem> */}
                <DropdownItem action="delete" onClick={onDeleteClick}>
                    delete seller profile
                </DropdownItem>
            </Dropdown>
        </div>
    );
};

export default SellerMenu;
