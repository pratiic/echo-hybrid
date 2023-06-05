import { useState } from "react";
import {
    CalendarIcon,
    LocationMarkerIcon,
    MenuAlt4Icon,
} from "@heroicons/react/outline";
import { BsThreeDots } from "react-icons/bs";
import { useDispatch } from "react-redux";

import { getDate, getHowLongAgo } from "../lib/date-time";
import { getAddress } from "../lib/address";
import { addCommas } from "../lib/strings";
import { getSubtotal } from "../lib/order";
import { fetcher } from "../lib/fetcher";
import { setAlert, setErrorAlert } from "../redux/slices/alerts-slice";
import { deleteDelivery } from "../redux/slices/delivery-slice";

import IconInfo from "./icon-info";
import InfoUnit from "./info-unit";
import Dropdown from "./dropdown";
import DropdownItem from "./dropdown-item";
import OrderHead from "./order-head";
import UserPreview from "./user-preview";
import {
    closeModal,
    showConfirmationModal,
    showLoadingModal,
} from "../redux/slices/modal-slice";

const DeliveryCard = ({ id, order, madeBy, deletedFor, createdAt }) => {
    const [showDropdown, setShowDropdown] = useState(false);

    const dispatch = useDispatch();

    const toggleDropdown = (event) => {
        event.stopPropagation();

        setShowDropdown(!showDropdown);
    };

    const handleDeleteClick = () => {
        dispatch(
            showConfirmationModal({
                title: "delivery deletion",
                message:
                    "this delivery will be deleted for you but will exist for the rest of the delivery personnel. Continue ?",
                handler: async () => {
                    dispatch(showLoadingModal("delete the delivery..."));

                    try {
                        await fetcher(`delivery/${id}`, "DELETE");

                        dispatch(deleteDelivery({ type: "completed", id }));
                        dispatch(
                            setAlert({
                                message:
                                    "the delivery has been deleted for you",
                            })
                        );
                    } catch (error) {
                        console.log(error);
                        dispatch(setErrorAlert(error.message));
                    } finally {
                        dispatch(closeModal());
                    }
                },
            })
        );
    };

    return (
        <div className="card-transparent relative">
            <div>
                <OrderHead
                    product={order?.product}
                    quantity={order?.quantity}
                    variant={order?.variant}
                />

                <div className="mt-3">
                    <div className="flex flex-wrap">
                        <InfoUnit label="Order Id" value={order?.id} />

                        <InfoUnit
                            label="unit price"
                            value={addCommas(order?.unitPrice)}
                            hasMoney={true}
                        />

                        <InfoUnit
                            label="delivery charge"
                            value={order?.deliveryCharge}
                        />

                        <InfoUnit
                            label="subtotal"
                            hasMoney={true}
                            value={getSubtotal(
                                order?.unitPrice,
                                order?.quantity,
                                order?.deliveryCharge
                            )}
                        />
                    </div>
                </div>
            </div>

            <div>
                <UserPreview user={madeBy} title="delivered by" />

                <div className="space-y-1 mb-3">
                    {/* delivery date and time */}
                    <IconInfo
                        icon={<CalendarIcon className="icon-no-bg" />}
                        className="text-sm"
                    >
                        <span>
                            {getHowLongAgo(createdAt, true)} ago on{" "}
                            {getDate(createdAt)}{" "}
                        </span>
                    </IconInfo>

                    <IconInfo
                        icon={<LocationMarkerIcon className="icon-no-bg" />}
                        className="text-sm"
                    >
                        <span className="whitespace-pre">
                            {getAddress(order?.consumerAddress, true)}
                        </span>
                    </IconInfo>
                </div>
            </div>

            {/* dropdown */}
            <div className="absolute right-0 -bottom-1">
                <MenuAlt4Icon className="icon" onClick={toggleDropdown} />

                <Dropdown show={showDropdown} toggleDropdown={toggleDropdown}>
                    <DropdownItem action="delete" onClick={handleDeleteClick}>
                        delete delivery
                    </DropdownItem>
                </Dropdown>
            </div>
        </div>
    );
};

export default DeliveryCard;
