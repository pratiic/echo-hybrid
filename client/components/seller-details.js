import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AiOutlineMail } from "react-icons/ai";
import { LocationMarkerIcon, CalendarIcon } from "@heroicons/react/outline";

import { getHowLongAgo, getDate } from "../lib/date-time";
import { getAddress } from "../lib/address";

import Image from "../components/image";
import Avatar from "../components/avatar";
import Rating from "../components/rating";
import CommentsContainer from "../components/comments-container";
import Tag from "../components/tag";
import { capitalizeAll } from "../lib/strings";

const SellerDetails = ({
    id,
    storeType,
    business,
    user,
    createdAt,
    rating,
    ratings,
    isMyStore,
    updateStore,
}) => {
    const { authUser } = useSelector((state) => state.auth);
    const { theme } = useSelector((state) => state.theme);

    let sellerAddress = storeType === "IND" ? user?.address : business?.address;

    return (
        <div className="space-y-7 flex flex-col">
            <div className="flex flex-1 850:mb-0">
                {/* seller image -> individual -> avatar, business -> generic image */}
                <Image
                    className="rounded image w-full h-full"
                    containerClassName="mr-3 450:mr-5 max-w-[8rem] 450:max-w-[10rem] max-h-[8rem] 450:max-h-40 550:max-w-[12rem] 550:max-h-48 550:mr-7"
                    src={
                        storeType === "BUS"
                            ? `/images/shop-${theme}.png`
                            : `${user?.avatar}`
                    }
                />

                <div className="mr-[6rem]">
                    {/* business owner  */}
                    {business && (
                        <div className="text-sm mt-1 dark-light">
                            <span>Owned by</span>

                            <div className="flex items-center mt-2 mb-3">
                                <Avatar avatar={user?.avatar} smaller />
                                <div className="ml-3">
                                    <span className="highlight block">
                                        {capitalizeAll(
                                            authUser?.id === user?.id
                                                ? "me"
                                                : user?.fullName
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="text-sm flex flex-col space-y-2">
                        {/* how long the seller has been selling  */}
                        <div className="flex items-center dark-light">
                            <CalendarIcon className="icon-no-bg" />

                            <span className="ml-3">
                                Started selling {getHowLongAgo(createdAt, true)}{" "}
                                ago on {getDate(createdAt)}
                            </span>
                        </div>

                        {/* seller email  */}
                        <div className="flex items-center dark-light">
                            <AiOutlineMail className="icon-no-bg" />

                            <span className="ml-3">{user?.email}</span>
                        </div>

                        {/* address details  */}
                        <div className="flex items-center dark-light">
                            <LocationMarkerIcon className="icon-no-bg" />

                            <div className="ml-3">
                                <span>{getAddress(sellerAddress)}</span>
                                {sellerAddress?.description && (
                                    <span className="block max-w-[300px]">
                                        ({sellerAddress?.description})
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* seller type */}
                        <div className="flex items-center space-x-3">
                            <Tag
                                text={
                                    storeType === "IND"
                                        ? "individual seller"
                                        : "registered business"
                                }
                            />

                            {isMyStore && <Tag text="my seller profile" />}
                        </div>
                    </div>
                </div>

                <Rating
                    rating={rating}
                    ratings={ratings}
                    userCanRate={!isMyStore}
                    target={{
                        id,
                        name: capitalizeAll(
                            storeType === "IND"
                                ? `${user?.firstName} ${user?.lastName}`
                                : business?.name
                        ),
                    }}
                    isTargetBusiness={storeType === "BUS"}
                    onRate={updateStore}
                />
            </div>

            <CommentsContainer
                contentId={id}
                contentOwner={user}
                isTargetBusiness={storeType === "BUS"}
            />
        </div>
    );
};

export default SellerDetails;
