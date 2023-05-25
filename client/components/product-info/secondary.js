import React from "react";
import {
    CalendarIcon,
    LocationMarkerIcon,
    UserIcon,
} from "@heroicons/react/outline";
import { TbBuildingFactory } from "react-icons/tb";
import { useSelector } from "react-redux";

import { getAddress } from "../../lib/address";
import { getHowLongAgo, getDate } from "../../lib/date-time";
import { capitalizeFirstLetter } from "../../lib/strings";

import IconInfo from "../icon-info";
import ChatButton from "../chat-button";
import DeliveryInfo from "../delivery-info";
import SellerInfo from "../seller-info";

const SecondaryInfo = ({
    name,
    store,
    deliveryCharge,
    madeIn,
    createdAt,
    isSecondHand,
    isMyProduct,
    showName,
}) => {
    const sellerAddress = isSecondHand
        ? store?.user?.address
        : store?.business?.address;
    const { authUser } = useSelector((state) => state.auth);

    return (
        <div className="h-fit max-w-[300px] dark:rounded 1200:dark:bg-gray-800 1200:bg-gray-50 1200:px-5 1200:py-3 ">
            {/* product name when displayed on a modal */}
            {showName && (
                <h3 className="text-2xl black-white mb-3 font-semibold">
                    {capitalizeFirstLetter(name)}
                </h3>
            )}

            <div className="dark-light space-y-3 1200:space-y-2 text-sm">
                {/* seller address */}
                <IconInfo icon={<LocationMarkerIcon className="icon-no-bg" />}>
                    <span>{getAddress(sellerAddress)}</span>
                </IconInfo>

                {/* delivery information */}
                {!isMyProduct && (
                    <DeliveryInfo
                        consumerAddr={authUser?.address}
                        sellerAddr={sellerAddress}
                        deliveryCharge={deliveryCharge}
                    />
                )}

                {/* seller information */}
                <SellerInfo
                    store={store}
                    isSecondHand={isSecondHand}
                    isMyProduct={isMyProduct}
                />

                <IconInfo icon={<TbBuildingFactory className="icon-no-bg" />}>
                    <span>
                        Made in -{" "}
                        {madeIn ? (
                            <span className="capitalize font-semibold">
                                {madeIn}
                            </span>
                        ) : (
                            "not available"
                        )}
                    </span>
                </IconInfo>

                <IconInfo icon={<CalendarIcon className="icon-no-bg" />}>
                    <span>
                        Added {getHowLongAgo(createdAt, true)} ago on{" "}
                        {getDate(createdAt)}
                    </span>
                </IconInfo>
            </div>

            {!isMyProduct && (
                <div className="mt-3 hidden w-fit text-sm 1200:block">
                    {" "}
                    <ChatButton />
                </div>
            )}
        </div>
    );
};

export default SecondaryInfo;
