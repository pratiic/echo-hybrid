import { useState } from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { MenuAlt4Icon } from "@heroicons/react/outline";

import { deleteProduct } from "../redux/slices/products-slice";
import { fetcher } from "../lib/fetcher";
import {
    closeModal,
    showConfirmationModal,
    showLoadingModal,
} from "../redux/slices/modal-slice";
import { setActiveProduct } from "../redux/slices/products-slice";
import { setAlert, setErrorAlert } from "../redux/slices/alerts-slice";

import Dropdown from "./dropdown";
import DropdownItem from "./dropdown-item";
import Icon from "./icon";

const ProductMenu = ({ isMyProduct }) => {
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

    if (!isMyProduct) {
        // show menu only to owner
        return null;
    }

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
                <DropdownItem
                    action="update"
                    onClick={() => router.push("/set-product/?mode=update")}
                >
                    update product
                </DropdownItem>
                <DropdownItem action="delete" onClick={handleDeletion}>
                    delete product
                </DropdownItem>
            </Dropdown>
        </div>
    );
};

export default ProductMenu;
