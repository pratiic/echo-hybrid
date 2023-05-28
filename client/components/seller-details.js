import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { MdOutlineContactPhone } from "react-icons/md";
import { LocationMarkerIcon, CalendarIcon } from "@heroicons/react/outline";

import { getHowLongAgo, getDate } from "../lib/date-time";

import Image from "../components/image";
import Avatar from "../components/avatar";
import Rating from "../components/rating";
import CommentsContainer from "../components/comments-container";

const SellerDetails = ({ storeDetails, loading, errorMsg }) => {
  const { authUser } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.theme);

  if (loading) {
    return <p className="status">Loading seller details...</p>;
  }

  if (errorMsg) {
    return <p className="status">Seller not found...</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex">
        <Image
          className="rounded image w-full h-full"
          containerClassName="mr-3 450:mr-5 max-w-[8rem] 450:max-w-[10rem] max-h-[8rem] 450:max-h-40 550:max-w-[12rem] 550:max-h-48 550:mr-7"
          src={
            storeDetails?.storeType === "BUS"
              ? `/images/shop-${theme}.png`
              : `${storeDetails?.user?.avatar}`
          }
        />

        <div className="">
          {/* business owner  */}
          {storeDetails?.business && (
            <div className="text-sm mt-1 dark-light">
              <span>Owned by</span>

              <div className="flex items-center mt-2 mb-3">
                <Avatar avatar={storeDetails?.user?.avatar} />
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
            {/* created ago  */}
            <div className="flex items-center dark-light">
              <CalendarIcon className="icon-no-bg" />
              <span className="ml-3">
                {getHowLongAgo(storeDetails?.createdAt, true)} ago on{" "}
                {getDate(storeDetails?.createdAt)}
              </span>
            </div>

            {/* contact details  */}
            <div className="flex items-center dark-light">
              <MdOutlineContactPhone className="icon-no-bg" />
              <span className="ml-3">{storeDetails?.user?.email}</span>
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
                    {storeDetails?.business?.address?.description}
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
                    {storeDetails?.user?.address?.description}
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
