import { useState } from "react";
import { useDispatch } from "react-redux";
import { MenuAlt4Icon } from "@heroicons/react/outline";
import { useRouter } from "next/router";

import { getAddress } from "../lib/address";
import { getDate, getHowLongAgo } from "../lib/date-time";
import { openGallery } from "../redux/slices/gallery-slice";
import {
    closeModal,
    showConfirmationModal,
    showGenericModal,
    showLoadingModal,
} from "../redux/slices/modal-slice";
import { fetcher } from "../lib/fetcher";
import { setAlert, setErrorAlert } from "../redux/slices/alerts-slice";
import { deleteRequest } from "../redux/slices/businesses-slice";

import InfoUnit from "./info-unit";
import Button from "./button";
import InputGroup from "./input-group";
import Icon from "./icon";
import Dropdown from "./dropdown";
import DropdownItem from "./dropdown-item";

const BusinessRequest = (props) => {
    const [infoUnits, setInfoUnits] = useState(
        ["owner", "phone", "PAN", "address", "request made", "request Id"].map(
            (label) => {
                return {
                    label,
                    value:
                        label === "owner"
                            ? props.store?.user?.fullName
                            : label === "address"
                            ? getAddress(props.address, true)
                            : label === "request made"
                            ? `${getHowLongAgo(
                                  props.address?.createdAt,
                                  true
                              )} ago on ${getDate(props.address?.createdAt)}`
                            : label === "request Id"
                            ? props.id
                            : props[label],
                    direction: "row",
                    textBlue: false,
                    capitalize: label === "owner",
                };
            }
        )
    );
    const [showDropdown, setShowDropdown] = useState(false);

    const dispatch = useDispatch();
    const router = useRouter();

    const handleImageClick = () => {
        dispatch(openGallery({ images: [props.regImage] }));
    };

    const handleAction = (action) => {
        dispatch(
            showConfirmationModal({
                title: `Business ${
                    action === "accept" ? "verification" : "rejection"
                }`,
                message:
                    action === "accept"
                        ? "once you verify this business request, the owner of this business will be able to sell products on Echo. Do you want to continue ?"
                        : "once you reject this business request, the request, as well as seller profile will be deleted. Do you want to continue ?",
                handler: () => {
                    if (action === "reject") {
                        // reason for rejection
                        return dispatch(
                            showGenericModal(
                                <RejectionCause
                                    onCause={(cause) => onCause(action, cause)}
                                />
                            )
                        );
                    }

                    controlBusinessRegistration(action);
                },
            })
        );
    };

    const onCause = (action, cause) => {
        controlBusinessRegistration(action, cause);
    };

    const controlBusinessRegistration = async (action, cause) => {
        dispatch(
            showLoadingModal(
                action === "accept"
                    ? "verifying the business..."
                    : "rejecting the business..."
            )
        );

        try {
            await fetcher(
                `businesses/registration/${props.id}/?action=${action}`,
                "PATCH",
                { cause }
            );

            dispatch(deleteRequest(props.id));
            dispatch(
                setAlert({
                    message: `the business has been ${
                        action === "accept" ? "verified" : "rejected"
                    }`,
                })
            );

            // send notification to the seller
            fetcher("notifications", "POST", {
                text:
                    action === "accept"
                        ? `your business registration request has been verified, so you can start selling products now`
                        : "your business registration request has been rejected, check your email for the further details",
                destinationId: props.store?.user?.id,
                linkTo:
                    action === "accept" ? `/sellers/${props.store?.id}` : "",
            });
        } catch (error) {
            dispatch(setErrorAlert(error.message));
        } finally {
            dispatch(closeModal());
        }
    };

    const toggleDropdown = (event) => {
        event.stopPropagation();

        setShowDropdown(!showDropdown);
    };

    const handleChatClick = () => {
        router.push(`/chats/${props.store?.user?.id}`);
    };

    return (
        <div className="border border-faint px-4 pt-2 pb-3 rounded w-fit relative">
            {/* business name */}
            <h3 className="text-lg font-semibold capitalize text-blue-four mb-1">
                {props.name}
            </h3>

            <div className="flex space-x-3 mb-5">
                <div>
                    {infoUnits.map((infoUnit) => {
                        return <InfoUnit {...infoUnit} key={infoUnit.label} />;
                    })}
                </div>

                {/* registration certificate */}
                <img
                    src={props.regImage}
                    className="image max-w-[150px] max-h-[150px] cursor-pointer"
                    onClick={handleImageClick}
                />
            </div>

            {/* business controls */}
            <div className="flex space-x-5">
                <Button onClick={() => handleAction("accept")}>verify</Button>
                <Button type="tertiary" onClick={() => handleAction("reject")}>
                    reject
                </Button>
            </div>

            {/* business request dropdown */}
            <div className="absolute bottom-0 right-1">
                <Icon toolName="options" onClick={toggleDropdown}>
                    <MenuAlt4Icon className="icon" />
                </Icon>

                <Dropdown show={showDropdown} toggleDropdown={toggleDropdown}>
                    <DropdownItem
                        action="chat"
                        textAsIs
                        onClick={handleChatClick}
                    >
                        Chat with Owner
                    </DropdownItem>
                </Dropdown>
            </div>
        </div>
    );
};

function RejectionCause({ onCause }) {
    const [cause, setCause] = useState("");

    const handleFormSubmit = (event) => {
        event.preventDefault();

        onCause(cause);
    };

    return (
        <form className="max-w-[350px]" onSubmit={handleFormSubmit}>
            <h3 className="modal-title mb-1">Rejection cause</h3>

            <p className="dark-light mb-3">
                Please provide the reason for rejecting this request.
            </p>

            <InputGroup
                placeholder="min 20 chars, max 150 chars"
                view="textarea"
                minChars={20}
                maxChars={150}
                value={cause}
                onChange={setCause}
            />

            <Button>continue</Button>
        </form>
    );
}

export default BusinessRequest;
