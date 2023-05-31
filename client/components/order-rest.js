import React from "react";
import {
    CalendarIcon,
    LocationMarkerIcon,
    ShoppingBagIcon,
} from "@heroicons/react/outline";

import { getAddress } from "../lib/address";
import { getDate, getHowLongAgo } from "../lib/date-time";
import { addCommas, capitalizeAll } from "../lib/strings";
import { getSubtotal } from "../lib/order";

import Avatar from "./avatar";
import InfoUnit from "./info-unit";
import IconInfo from "./icon-info";

const OrderRest = ({
    isSellerItem,
    isUserItem,
    user,
    store,
    address,
    isDelivered,
    deliveryCharge,
    unitPrice,
    quantity,
    createdAt,
    itemType = "order",
}) => {
    // information such as address, user, date of an order
    return (
        <div>
            {/* other details */}
            <div className="mb-3">
                {isSellerItem && (
                    <div className="flex items-center mb-3">
                        <Avatar avatar={user.avatar} smaller />

                        <div className="flex flex-col ml-2">
                            <span className="text-sm">
                                {itemType === "order"
                                    ? "order by"
                                    : "purchased by"}
                            </span>
                            <span className="black-white capitalize">
                                {user?.firstName} {user?.lastName}
                            </span>
                            <span className="text-sm">{user.email}</span>
                        </div>
                    </div>
                )}

                <div className="space-y-1">
                    {isUserItem && (
                        <IconInfo
                            icon={<ShoppingBagIcon className="icon-no-bg" />}
                        >
                            {!store?.userId ? (
                                <span className="dark-light italic text-sm">
                                    seller deleted
                                </span>
                            ) : (
                                <span className="text-blue-three cursor-pointer text-sm">
                                    {capitalizeAll(
                                        store?.storeType === "IND"
                                            ? `${store?.user?.firstName} ${store?.user?.lastName}`
                                            : store?.business?.name
                                    )}
                                </span>
                            )}
                        </IconInfo>
                    )}

                    {isSellerItem && isDelivered && (
                        <IconInfo
                            icon={<LocationMarkerIcon className="icon-no-bg" />}
                        >
                            <span className="text-sm">
                                {getAddress(address)}
                            </span>
                        </IconInfo>
                    )}

                    <IconInfo
                        icon={<CalendarIcon className="icon-no-bg text-sm" />}
                    >
                        <span className="text-sm">
                            {getHowLongAgo(createdAt, true)} ago on{" "}
                            {getDate(createdAt)}
                        </span>
                    </IconInfo>
                </div>
            </div>

            {/* price and delivery details */}
            <div>
                <div className="flex flex-wrap mb-2">
                    <InfoUnit
                        label="unit price"
                        value={addCommas(unitPrice)}
                        hasMoney={true}
                    />

                    <InfoUnit
                        label="delivery"
                        value={isDelivered ? "available" : "not available"}
                    />

                    {isDelivered && (
                        <InfoUnit
                            label="delivery charge"
                            value={deliveryCharge}
                        />
                    )}
                </div>

                <InfoUnit
                    label="subtotal"
                    hasMoney={true}
                    value={getSubtotal(unitPrice, quantity, deliveryCharge)}
                    highlight
                />
            </div>
        </div>
    );
};

export default OrderRest;
