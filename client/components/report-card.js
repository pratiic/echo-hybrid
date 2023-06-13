import { useState, useEffect } from "react";
import { MenuAlt4Icon } from "@heroicons/react/outline";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";

import { getDate, getHowLongAgo } from "../lib/date-time";
import { capitalizeFirstLetter } from "../lib/strings";

import InfoUnit from "./info-unit";
import Dropdown from "./dropdown";
import DropdownItem from "./dropdown-item";
import Icon from "./icon";
import {
    closeModal,
    showConfirmationModal,
    showLoadingModal,
} from "../redux/slices/modal-slice";
import { fetcher } from "../lib/fetcher";
import { setAlert, setErrorAlert } from "../redux/slices/alerts-slice";
import { deleteReport } from "../redux/slices/reports-slice";

const ReportCard = ({
    id,
    cause,
    product,
    store,
    user,
    creator,
    createdAt,
}) => {
    const [targetType, setTargetType] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

    const router = useRouter();
    const dispatch = useDispatch();

    useEffect(() => {
        setTargetType(product ? "product" : store ? "seller" : "user");
    }, [product, store]);

    const toggleDropdown = (event) => {
        event.stopPropagation();

        setShowDropdown(!showDropdown);
    };

    const handleChatClick = () => {
        router.push(`/chats/${creator?.id}`);
    };

    const handleDeleteClick = () => {
        dispatch(
            showConfirmationModal({
                title: "report deletion",
                message: "are you sure you want to delete this report ?",
                handler: async () => {
                    dispatch(showLoadingModal("deleting the report..."));

                    try {
                        await fetcher(`reports/${id}`, "DELETE");

                        dispatch(deleteReport(id));
                        dispatch(
                            setAlert({ message: "the report has been deleted" })
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
        <div className="border border-faint rounded px-3 pt-1 pb-2 cursor-pointer">
            <div className="flex items-center justify-between">
                {/* report type */}
                <h4 className="text-lg text-blue-four font-semibold capitalize">
                    {targetType} report
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
                            action="delete"
                            onClick={handleDeleteClick}
                        >
                            delete report
                        </DropdownItem>

                        <DropdownItem
                            action="chat"
                            textAsIs
                            onClick={handleChatClick}
                        >
                            Chat with{" "}
                            {capitalizeFirstLetter(creator?.firstName)}
                        </DropdownItem>
                    </Dropdown>
                </div>
            </div>

            <div>
                <InfoUnit
                    label={`${targetType} Id`}
                    value={product ? product.id : store ? store.id : user?.id}
                    textBlue={false}
                    direction="row"
                />

                <InfoUnit
                    label={"made by"}
                    value={creator?.fullName}
                    textBlue={false}
                    direction="row"
                    capitalize
                />

                <InfoUnit
                    label={"reported"}
                    value={`${getHowLongAgo(createdAt)} ago on ${getDate(
                        createdAt
                    )}`}
                    textBlue={false}
                    direction="row"
                />

                <div className="dark-light text-sm px-1 py-[5px] space-y-1">
                    <span>Cause / Ground</span>

                    <p className="font-semibold whitespace-pre-wrap">
                        {capitalizeFirstLetter(cause)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ReportCard;
