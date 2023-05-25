import React from "react";

import { capitalizeFirstLetter } from "../lib/strings";
import {
    XCircleIcon,
    CheckCircleIcon,
    CashIcon,
    ExclamationCircleIcon,
} from "@heroicons/react/outline";
import { checkDelivery } from "../lib/delivery";

const DeliveryInfo = ({ consumerAddr, sellerAddr, deliveryCharge }) => {
    let deliveryType = checkDelivery(consumerAddr, sellerAddr) ? "yes" : "no"; // boolean to string

    if (!consumerAddr) {
        deliveryType = "unknown";
    }

    const deliveryMap = {
        no: {
            message: "delivery not available",
            icon: <XCircleIcon className="icon-no-bg" />,
        },
        yes: {
            message: "delivery available",
            icon: <CheckCircleIcon className="icon-no-bg" />,
        },
        unknown: {
            message: "set address for delivery info",
            icon: <ExclamationCircleIcon className="icon-no-bg" />,
        },
    };

    return (
        <div className="dark-light">
            <p className="flex items-center ">
                <span className="mr-1">{deliveryMap[deliveryType].icon}</span>

                <span>
                    {capitalizeFirstLetter(deliveryMap[deliveryType].message)}
                </span>
            </p>

            {deliveryType === "yes" && (
                <p className="flex items-center mt-2 -mb-[4px] leading-tight">
                    <div>
                        <CashIcon className="icon-no-bg mr-1" />
                    </div>

                    <span className="font-semibold">
                        <span className="font-normal dark-light ">
                            Delivery charge{" "}
                            <span className="font-semibold">
                                Rs. {deliveryCharge}
                            </span>
                        </span>
                    </span>
                </p>
            )}
        </div>
    );
};

export default DeliveryInfo;
