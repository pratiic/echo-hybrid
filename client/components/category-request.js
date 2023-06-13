import { useState } from "react";
import {
    UserIcon,
    CalendarIcon,
    MenuAlt4Icon,
    CheckCircleIcon,
    XCircleIcon,
} from "@heroicons/react/outline";
import { useDispatch } from "react-redux";

import { getDate, getHowLongAgo } from "../lib/date-time";
import {
    closeModal,
    showConfirmationModal,
    showLoadingModal,
} from "../redux/slices/modal-slice";
import { fetcher } from "../lib/fetcher";
import { deleteCategoryRequest } from "../redux/slices/categories-slice";
import { setAlert, setErrorAlert } from "../redux/slices/alerts-slice";

import IconInfo from "./icon-info";
import Icon from "./icon";
import Dropdown from "./dropdown";
import DropdownItem from "./dropdown-item";

const CategoryRequest = ({ id, name, user, createdAt }) => {
    const [showDropdown, setShowDropdown] = useState(false);

    const dispatch = useDispatch();

    const toggleDropdown = (event) => {
        event.stopPropagation();

        setShowDropdown(!showDropdown);
    };

    const controlCategoryRequest = (action) => {
        dispatch(
            showConfirmationModal({
                title: `category request ${
                    action === "accept" ? "acceptance" : "rejection"
                }`,
                message: `are you sure you want to ${action} this category request ?`,
                handler: async () => {
                    try {
                        dispatch(
                            showLoadingModal(
                                `${action}ing the category request...`
                            )
                        );

                        await fetcher(
                            `categories/requests/?name=${name}&action=${action}`,
                            "PATCH"
                        );

                        // send notification to the user who requested the category
                        fetcher("notifications", "POST", {
                            text: `the category that you requested - ${name} - has been ${action}ed`,
                            destinationId: user?.id,
                        });

                        dispatch(deleteCategoryRequest(name));
                        dispatch(
                            setAlert({
                                message: `the category request has been ${action}ed`,
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
        <div className="dark-light border border-faint rounded px-3 pt-2 pb-5 relative">
            {/* category name */}
            <h4 className="font-semibold capitalize mb-2 tracking-wide text-blue-four">
                {name}
            </h4>

            <div className="text-sm space-y-2 mb-3">
                <IconInfo icon={<UserIcon className="icon-no-bg" />} capitalize>
                    {user?.fullName}
                </IconInfo>

                <IconInfo icon={<CalendarIcon className="icon-no-bg" />}>
                    {getHowLongAgo(createdAt)} ago on {getDate(createdAt)}
                </IconInfo>
            </div>

            <div className="absolute -bottom-1 right-0">
                <Icon toolName="options" onClick={toggleDropdown}>
                    <MenuAlt4Icon className="icon icon-small" />
                </Icon>

                <Dropdown show={showDropdown} toggleDropdown={toggleDropdown}>
                    <DropdownItem
                        icon={<CheckCircleIcon className="icon-no-bg" />}
                        onClick={() => controlCategoryRequest("accept")}
                    >
                        accept request
                    </DropdownItem>
                    <DropdownItem
                        icon={<XCircleIcon className="icon-no-bg" />}
                        onClick={() => controlCategoryRequest("reject")}
                    >
                        reject request
                    </DropdownItem>
                </Dropdown>
            </div>
        </div>
    );
};

export default CategoryRequest;
