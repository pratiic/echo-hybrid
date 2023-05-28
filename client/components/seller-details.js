import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AiOutlineMail } from "react-icons/ai";
import { LocationMarkerIcon, CalendarIcon } from "@heroicons/react/outline";

import { getHowLongAgo, getDate } from "../lib/date-time";

import Image from "../components/image";
import Avatar from "../components/avatar";
import Rating from "../components/rating";
import CommentsContainer from "../components/comments-container";

const SellerDetails = ({ storeDetails }) => {
    const { authUser } = useSelector((state) => state.auth);
    const { theme } = useSelector((state) => state.theme);

    return (
        <div className="space-y-7 flex flex-col">
            <div className="flex flex-1 850:mb-0">
                {/* seller image -> individual -> avatar, business -> generic image */}
                <Image
                    className="rounded image w-full h-full"
                    containerClassName="mr-3 450:mr-5 max-w-[8rem] 450:max-w-[10rem] max-h-[8rem] 450:max-h-40 550:max-w-[12rem] 550:max-h-48 550:mr-7"
                    src={
                        storeDetails?.storeType === "BUS"
                            ? `/images/shop-${theme}.png`
                            : `${storeDetails?.user?.avatar}`
                    }
                />

                <div className="mr-[6rem]">
                    {/* business owner  */}
                    {storeDetails?.business && (
                        <div className="text-sm mt-1 dark-light">
                            <span>Owned by</span>

                            <div className="flex items-center mt-2 mb-3">
                                <Avatar
                                    avatar={storeDetails?.user?.avatar}
                                    smaller
                                />
                                <div className="ml-3">
                                    <span className="highlight block">
                                        {authUser?.id === storeDetails?.user?.id
                                            ? "me"
                                            : storeDetails?.user?.firstName +
                                              " " +
                                              storeDetails?.user?.lastName}
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
                                Started selling{" "}
                                {getHowLongAgo(storeDetails?.createdAt, true)}{" "}
                                ago on {getDate(storeDetails?.createdAt)}
                            </span>
                        </div>

                        {/* seller email  */}
                        <div className="flex items-center dark-light">
                            <AiOutlineMail className="icon-no-bg" />

                            <span className="ml-3">
                                {storeDetails?.user?.email}
                            </span>
                        </div>

                        {/* address details  */}
                        <div className="flex dark-light">
                            <LocationMarkerIcon className="icon-no-bg" />

                            {storeDetails?.storeType === "BUS" && (
                                <div className="ml-3">
                                    <p>
                                        {storeDetails?.business?.address?.area},{" "}
                                        {storeDetails?.business?.address?.city}
                                    </p>
                                    <p className="-mt-1">
                                        {
                                            storeDetails?.business?.address
                                                ?.description
                                        }
                                    </p>
                                </div>
                            )}

                            {storeDetails?.storeType === "IND" && (
                                <div className="ml-3">
                                    <p>
                                        {storeDetails?.user?.address?.area},{" "}
                                        {storeDetails?.user?.address?.city}
                                    </p>
                                    <p className="-mt-1">
                                        {
                                            storeDetails?.user?.address
                                                ?.description
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <Rating
                    rating={storeDetails?.rating}
                    //  ratings={ratings}
                    //   userCanRate={!isMyShop}
                    //  content={{ id, name }}
                    //  onRate={updateShopInfo}
                />
            </div>

            <CommentsContainer
                contentId={storeDetails?.id}
                contentOwner={storeDetails?.user}
            />
        </div>
    );
};

export default SellerDetails;
