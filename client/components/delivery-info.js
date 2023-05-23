import React from "react";

import { capitalizeFirstLetter } from "../lib/strings";
import {
    XCircleIcon,
    CheckCircleIcon,
    CashIcon,
} from "@heroicons/react/outline";
import { checkDelivery } from "../lib/delivery";

const DeliveryInfo = ({ consumerAddr, sellerAddr, deliveryCharge }) => {
    const deliveryType = checkDelivery(consumerAddr, sellerAddr) ? "yes" : "no"; // boolean to string

    const deliveryMap = {
        no: {
            message: "delivery not available",
            icon: <XCircleIcon className="icon-no-bg" />,
        },
        yes: {
            message: "delivery available",
            icon: <CheckCircleIcon className="icon-no-bg" />,
        },
    };

    return (
        <div className="dark-light">
            <p className="flex items-center ">
                <span className="mr-1">{deliveryMap[deliveryType].icon}</span>

                {!consumerAddr ? (
                    <span className="italic">
                        Set address for delivery info
                    </span>
                ) : (
                    capitalizeFirstLetter(deliveryMap[deliveryType].message)
                )}
            </p>

            {deliveryType !== "no" && (
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
