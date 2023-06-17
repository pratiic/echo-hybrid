import { useState } from "react";
import {
    CalendarIcon,
    LocationMarkerIcon,
    MailIcon,
    MenuAlt4Icon,
    UserIcon,
    PhoneIcon,
} from "@heroicons/react/outline";
import { MdOutlineDeliveryDining } from "react-icons/md";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";

import { getAddress } from "../lib/address";
import { getDate, getHowLongAgo } from "../lib/date-time";
import {
    closeModal,
    showConfirmationModal,
    showLoadingModal,
} from "../redux/slices/modal-slice";
import { fetcher } from "../lib/fetcher";
import { deleteDeliveryPersonnel } from "../redux/slices/delivery-slice";
import { setAlert, setErrorAlert } from "../redux/slices/alerts-slice";

import IconInfo from "./icon-info";
import Icon from "./icon";
import Dropdown from "./dropdown";
import DropdownItem from "./dropdown-item";
import Tag from "./tag";

const PersonnelCard = ({
    id,
    fullName,
    avatar,
    phone,
    address,
    deliveriesCount,
    isVerified,
    suspension,
    createdAt,
}) => {
    const [showDropdown, setShowDropdown] = useState(false);

    const router = useRouter();
    const dispatch = useDispatch();

    const toggleDropdown = (event) => {
        event.stopPropagation();

        setShowDropdown(!showDropdown);
    };

    const handleChatClick = () => {
        router.push(`/chats/${id}`);
    };

    const handlePersonnelRemoval = () => {
        dispatch(
            showConfirmationModal({
                title: "delivery personnel deletion",
                message:
                    "are you sure that you want to remove this user from the delivery team ?",
                handler: async () => {
                    dispatch(showLoadingModal());

                    try {
                        await fetcher(`delivery/personnel/${id}`, "DELETE");

                        dispatch(deleteDeliveryPersonnel(id));
                        dispatch(
                            setAlert({
                                message: "delivery personnel has been deleted",
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
        <div className="flex relative space-x-5 border-b border-faint pb-5 mb-5 max-w-[500px]">
            <img
                src={avatar}
                className="image max-w-[100px] max-h-[100px] rounded"
            />

            <div className="-mt-1">
                <h3 className="capitalize text-lg font-semibold dark-light mb-1 text-blue-four">
                    {fullName}
                </h3>

                <div className="absolute right-0 -top-2">
                    <Icon toolName="options" onClick={toggleDropdown}>
                        <MenuAlt4Icon className="icon" />
                    </Icon>

                    <Dropdown
                        show={showDropdown}
                        toggleDropdown={toggleDropdown}
                    >
                        <DropdownItem action="chat" onClick={handleChatClick}>
                            chat now
                        </DropdownItem>
                        <DropdownItem
                            action="delete"
                            onClick={handlePersonnelRemoval}
                        >
                            remove personnel
                        </DropdownItem>
                    </Dropdown>
                </div>

                <div className="dark-light text-sm space-y-1">
                    <IconInfo icon={<UserIcon className="icon-no-bg" />}>
                        <span>User Id - {id}</span>
                    </IconInfo>

                    <IconInfo
                        icon={<LocationMarkerIcon className="icon-no-bg" />}
                    >
                        <span className={`address ${address ? "" : "italic"}`}>
                            {address
                                ? getAddress(address, true)
                                : "address not set"}
                        </span>
                    </IconInfo>

                    <IconInfo icon={<PhoneIcon className="icon-no-bg" />}>
                        <span>{phone}</span>
                    </IconInfo>

                    <IconInfo icon={<CalendarIcon className="icon-no-bg" />}>
                        <span>
                            Added {getHowLongAgo(createdAt, true)} ago on{" "}
                            {getDate(createdAt)}
                        </span>
                    </IconInfo>

                    <IconInfo
                        icon={
                            <MdOutlineDeliveryDining className="icon-no-bg" />
                        }
                    >
                        <span className="font-semibold">
                            Total deliveries - {deliveriesCount || 0}
                        </span>
                    </IconInfo>
                </div>

                {(!isVerified || suspension) && (
                    <div className="flex space-x-5 mt-1">
                        {!isVerified && <Tag text="not verified" />}

                        {suspension && <Tag text="suspended" />}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PersonnelCard;
