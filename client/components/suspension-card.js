import { useState } from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { MenuAlt4Icon } from "@heroicons/react/outline";

import { getDate, getHowLongAgo } from "../lib/date-time";
import { capitalizeFirstLetter } from "../lib/strings";
import {
    closeModal,
    showConfirmationModal,
    showLoadingModal,
} from "../redux/slices/modal-slice";
import { fetcher } from "../lib/fetcher";
import { setAlert, setErrorAlert } from "../redux/slices/alerts-slice";
import { deleteSuspension } from "../redux/slices/suspensions-slice";
import { updateDeliveryPersonnel } from "../redux/slices/delivery-slice";

import InfoUnit from "./info-unit";
import Icon from "./icon";
import Dropdown from "./dropdown";
import DropdownItem from "./dropdown-item";
import { getNotificationData } from "../lib/suspension";

const SuspensionCard = ({
    id,
    cause,
    targetType,
    product,
    store,
    user,
    createdAt,
}) => {
    const [showDropdown, setShowDropdown] = useState(false);

    const router = useRouter();
    const dispatch = useDispatch();
    const targetTypeMap = {
        product: "product",
        store: "seller",
        user: "user",
    };

    const toggleDropdown = (event) => {
        event.stopPropagation();

        setShowDropdown(!showDropdown);
    };

    const handleSuspensionClick = (event) => {
        if (user) {
            // user suspension leads nowhere
            return;
        }

        const redirectUrl = product
            ? `/products/${product.id}`
            : `/sellers/${store?.id}`;
        router.push(redirectUrl);
    };

    const handleReinstateClick = (event) => {
        event.stopPropagation();

        dispatch(
            showConfirmationModal({
                title: `reinstate ${targetTypeMap[targetType]}`,
                message: `are you sure that this ${targetTypeMap[targetType]} should no longer be suspended ?`,
                handler: async () => {
                    dispatch(showLoadingModal());

                    try {
                        await fetcher(
                            `suspensions/${targetType}/${
                                product
                                    ? product.id
                                    : store
                                    ? store.id
                                    : user?.id
                            }/?action=reinstate`,
                            "POST"
                        );

                        // if a delivery personnel was reinstated, update them
                        if (targetType === "user") {
                            dispatch(
                                updateDeliveryPersonnel({
                                    id: user?.id,
                                    updateInfo: {
                                        suspension: null,
                                    },
                                })
                            );
                        }

                        dispatch(
                            setAlert({
                                message: `the ${targetTypeMap[targetType]} has been reinstated`,
                            })
                        );

                        if (targetType !== "user") {
                            // send a notification to the affected user
                            fetcher(
                                "notifications",
                                "POST",
                                getNotificationData(
                                    "reinstate",
                                    targetType === "store"
                                        ? "seller"
                                        : targetType,
                                    targetType === "product"
                                        ? product?.id
                                        : store?.id,
                                    product,
                                    store
                                )
                            );
                        }

                        dispatch(deleteSuspension(id));
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
        <div
            className="dark-light border border-faint px-3 py-1 rounded cursor-pointer h-fit"
            onClick={handleSuspensionClick}
        >
            <div className="flex items-center justify-between">
                <h4 className="text-lg text-blue-four font-semibold capitalize">
                    {targetTypeMap[targetType]} suspension
                </h4>

                <div className="relative w-fit -mr-2">
                    <Icon toolName="options" onClick={toggleDropdown}>
                        <MenuAlt4Icon className="icon" />
                    </Icon>

                    <Dropdown
                        show={showDropdown}
                        toggleDropdown={toggleDropdown}
                    >
                        <DropdownItem
                            action="chat"
                            onClick={handleReinstateClick}
                        >
                            reinstate{" "}
                            {product ? "product" : store ? "seller" : "user"}
                        </DropdownItem>
                    </Dropdown>
                </div>
            </div>

            <div className="text-sm">
                <InfoUnit
                    label={`${targetTypeMap[targetType]} Id`}
                    value={product ? product?.id : store ? store?.id : user?.id}
                    textBlue={false}
                    direction="row"
                />

                <InfoUnit
                    label="suspended"
                    value={`${getHowLongAgo(createdAt)} ago on ${getDate(
                        createdAt
                    )}`}
                    textBlue={false}
                    direction="row"
                />

                <div className="px-1 py-[5px] space-y-1">
                    <span>Cause / Ground</span>

                    <p className="font-semibold whitespace-pre-wrap">
                        {capitalizeFirstLetter(cause)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SuspensionCard;
