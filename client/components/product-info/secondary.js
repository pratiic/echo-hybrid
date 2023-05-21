import React from "react";
import {
  CalendarIcon,
  LocationMarkerIcon,
  UserIcon,
} from "@heroicons/react/outline";
import { TbBuildingFactory } from "react-icons/tb";

import { getAddress } from "../../lib/address";
import { capitalizeFirstLetter } from "../../lib/strings";
import { getHowLongAgo, getDate } from "../../lib/date-time";

import IconInfo from "../icon-info";
import ChatButton from "../chat-button";

const SecondaryInfo = ({
  store,
  deliveryCharge,
  madeIn,
  createdAt,
  isMyProduct,
}) => {
  const userAddress = store?.user?.address;

  return (
    <div className="h-fit max-w-[300px] dark:rounded 1200:dark:bg-gray-800 1200:bg-gray-50 1200:px-5 1200:py-3 ">
      <div className="dark-light space-y-3 1200:space-y-2 text-sm">
        <IconInfo icon={<LocationMarkerIcon className="icon-no-bg" />}>
          <span>{getAddress(userAddress)}</span>
        </IconInfo>

        <IconInfo icon={<UserIcon className="icon-no-bg" />}>
          <span className="flex items-center">
            <span className="capitalize">
              {isMyProduct
                ? "me"
                : store?.user?.firstName + "" + store?.user?.lastName}
            </span>

            {/* <CustomLink
              href={`/shops/${shop?.id}`}
              className="ml-1 rounded"
              onClick={() => dispatch(closeModal())}
            >
              <span className="link font-semibold">
                {capitalizeFirstLetter(shop?.name)}
              </span>
            </CustomLink> */}
          </span>
        </IconInfo>

        <IconInfo icon={<TbBuildingFactory className="icon-no-bg" />}>
          <span>
            Made in -{" "}
            {madeIn ? (
              <span className="capitalize font-semibold">{madeIn}</span>
            ) : (
              "not available"
            )}
          </span>
        </IconInfo>

        <IconInfo icon={<CalendarIcon className="icon-no-bg" />}>
          <span>
            Added {getHowLongAgo(createdAt, true)} ago on {getDate(createdAt)}
          </span>
        </IconInfo>

        {isMyProduct && (
          <div className="mt-4 hidden w-fit mx-auto 1200:block">
            {" "}
            <ChatButton />
          </div>
        )}
      </div>
    </div>
  );
};

export default SecondaryInfo;
