import React from "react";
import {
  CalendarIcon,
  LocationMarkerIcon,
  ShoppingBagIcon,
} from "@heroicons/react/outline";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";

import { getAddress } from "../lib/address";
import { getDate, getHowLongAgo } from "../lib/date-time";
import { addCommas, capitalizeAll } from "../lib/strings";
import { getSubtotal } from "../lib/order";

import InfoUnit from "./info-unit";
import IconInfo from "./icon-info";
import UserPreview from "./user-preview";

const OrderRest = ({
  id,
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
  const { authUser } = useSelector((state) => state.auth);

  const router = useRouter();

  const handleSellerClick = (event) => {
    event.stopPropagation();

    router.push(`/sellers/${store?.id}`);
  };

  return (
    <div>
      {/* other details */}
      <div className="mb-3">
        {/* buyer info */}
        {(isSellerItem || authUser?.isDeliveryPersonnel) && (
          <UserPreview
            user={user}
            title={itemType === "order" ? "order by" : "purchased by"}
          />
        )}

        <div className="space-y-1">
          {/* seller info */}
          {(isUserItem || authUser?.isDeliveryPersonnel) && (
            <IconInfo icon={<ShoppingBagIcon className="icon-no-bg" />}>
              {!store?.user?.id ? (
                <span className="dark-light italic text-sm">
                  seller deleted
                </span>
              ) : (
                <span
                  className="text-blue-three cursor-pointer text-sm"
                  onClick={handleSellerClick}
                >
                  {capitalizeAll(
                    store?.storeType === "IND"
                      ? capitalizeAll(store?.user?.fullName)
                      : store?.business?.name
                  )}
                </span>
              )}
            </IconInfo>
          )}

          {/* delivery address */}
          {isDelivered && (isSellerItem || authUser?.isDeliveryPersonnel) && (
            <IconInfo icon={<LocationMarkerIcon className="icon-no-bg" />}>
              <span className="text-sm whitespace-pre">
                {getAddress(address, true)}
              </span>
            </IconInfo>
          )}

          <IconInfo icon={<CalendarIcon className="icon-no-bg text-sm" />}>
            <span className="text-sm">
              {getHowLongAgo(createdAt, true)} ago on {getDate(createdAt)}
            </span>
          </IconInfo>
        </div>
      </div>

      {/* order id, price and delivery details */}
      <div>
        <div className="flex flex-wrap mb-2">
          <InfoUnit label="order Id" value={id} />

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
            <InfoUnit label="delivery charge" value={deliveryCharge} />
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
