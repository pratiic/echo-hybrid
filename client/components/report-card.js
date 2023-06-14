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
import { openGallery } from "../redux/slices/gallery-slice";

const ReportCard = ({
    id,
    cause,
    targetType,
    product,
    store,
    user,
    review,
    creator,
    createdAt,
}) => {
    const [showDropdown, setShowDropdown] = useState(false);

    const router = useRouter();
    const dispatch = useDispatch();

    const toggleDropdown = (event) => {
        event.stopPropagation();

        setShowDropdown(!showDropdown);
    };

    const handleChatClick = (event) => {
        event.stopPropagation();

        router.push(`/chats/${creator?.id}`);
    };

    const handleReportDeletion = (event) => {
        event.stopPropagation();

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

    const handleReviewImageClick = (event) => {
        event.stopPropagation();

        dispatch(openGallery({ images: [review?.image] }));
    };

    const handleReviewDeletion = () => {
        dispatch(
            showConfirmationModal({
                title: "review deletion",
                message:
                    "deleting this review means that the cause of the report was indeed valid. The creator of this review will be notified. Continue ?",
                handler: async () => {
                    dispatch(showLoadingModal("deleting the review..."));

                    try {
                        await fetcher(`reviews/${review?.id}`, "DELETE", {
                            cause,
                        });

                        dispatch(deleteReport(id));
                        dispatch(
                            setAlert({ message: "the review has been deleted" })
                        );

                        // send notification to the creator of the review
                        fetcher("notifications", "POST", {
                            text: `The review you posted ${
                                review?.productId ? "on product" : "of seller"
                            } with id ${
                                review?.productId
                                    ? review?.productId
                                    : review?.storeId
                            } was deleted by us, check your email for further details`,
                            destinationId: review?.userId,
                        });
                    } catch (error) {
                        dispatch(setErrorAlert(error.message));
                    } finally {
                        dispatch(closeModal());
                    }
                },
            })
        );
    };

    const handleReportClick = () => {
        const redirectUrl = product
            ? `/products/${product?.id}`
            : `/sellers/${store?.id}`;
        router.push(redirectUrl);
    };

    return (
        <div
            className="border border-faint rounded px-3 pt-1 pb-2 cursor-pointer h-fit"
            onClick={handleReportClick}
        >
            <div className="flex items-center justify-between">
                {/* report type */}
                <h4 className="text-lg text-blue-four font-semibold capitalize">
                    {targetType === "store" ? "seller" : targetType} report
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
                            onClick={handleReportDeletion}
                        >
                            delete report
                        </DropdownItem>

                        {targetType === "review" && (
                            <DropdownItem
                                action="delete"
                                onClick={handleReviewDeletion}
                            >
                                delete review
                            </DropdownItem>
                        )}

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

            <div className="dark-light text-sm">
                <InfoUnit
                    label={`${
                        targetType === "store" ? "seller" : targetType
                    } Id`}
                    value={
                        product
                            ? product.id
                            : store
                            ? store.id
                            : user
                            ? user.id
                            : review?.id
                    }
                    textBlue={false}
                    direction="row"
                />

                {targetType === "review" && (
                    <InfoUnit
                        label="review user Id"
                        value={review?.userId}
                        textBlue={false}
                        direction="row"
                    />
                )}

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

                <div className="px-1 py-[5px] space-y-1">
                    <span>Cause / Ground</span>

                    <p className="font-semibold whitespace-pre-wrap">
                        {capitalizeFirstLetter(cause)}
                    </p>
                </div>

                {targetType === "review" && (
                    <div className="dark-light px-1 py-[5px] border-t border-faint w-fit">
                        <div className="space-y-1">
                            <span>Review content</span>
                            <p className="whitespace-pre-wrap font-semibold">
                                {capitalizeFirstLetter(review?.text)}
                            </p>
                        </div>

                        {review?.image && (
                            <div className="mt-2">
                                <img
                                    src={review?.image}
                                    className="image max-w-[100px] max-h-[100px] rounded"
                                    onClick={handleReviewImageClick}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportCard;
