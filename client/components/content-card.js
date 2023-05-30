import { LocationMarkerIcon } from "@heroicons/react/outline";
import { useRouter } from "next/router";
import { BsImage } from "react-icons/bs";
import { useSelector } from "react-redux";

import {
    addCommas,
    capitalizeAll,
    capitalizeFirstLetter,
} from "../lib/strings";
import { getAddress } from "../lib/address";

import Rating from "./rating";
import CustomLink from "./custom-link";

const ContentCard = ({
    type,
    id, // c -> both product and seller
    rating, // c
    name, // p -> product
    images, // p
    price, // p
    user, // s -> seller
    business, // s
    storeType, // s
}) => {
    const router = useRouter();
    const { theme } = useSelector((state) => state.theme);

    const handleContentClick = () => {
        router.push(`/${type === "product" ? "products" : "sellers"}/${id}`);
    };

    const getContentName = () => {
        if (type === "product") {
            return name;
        }

        // type -> seller
        return storeType === "IND"
            ? `${user?.firstName} ${user?.lastName}`
            : business?.name;
    };

    const getSellerAddress = () => {
        return getAddress(
            storeType === "IND" ? user?.address : business?.address
        );
    };

    const getImageSrc = () => {
        if (type === "product") {
            return images[0];
        }

        return storeType === "IND" ? user?.avatar : `/images/shop-${theme}.png`;
    };

    return (
        <CustomLink
            href={`/${type === "product" ? "products" : "sellers"}/${id}`}
            className="rounded"
            widthFit={false}
        >
            <div
                className="rounded cursor-pointer h-fit dark-light hover:scale-103 hover:shadow-lg hover:shadow-gray-two transition-all duration-300 active:scale-100 active:shadow-none dark:shadow-t-black"
                onClick={handleContentClick}
            >
                <div className="min-h-[9rem] relative rounded-t">
                    {/* show icon until the image is loaded */}
                    <BsImage className="image-placeholder" />
                    <img
                        src={getImageSrc()}
                        alt={name}
                        className="rounded-t min-h-[9rem] max-h-[12rem] w-full image relative"
                    />
                </div>

                {/* content details */}
                <div className="px-2 500:px-3 py-1 500:py-2 h-fit text-sm bg-gray-three rounded-b dark:bg-gray-eight">
                    {/* content name */}
                    <h2
                        className={`text-base 600:text-[1.15rem] black-white leading-tight ${
                            type === "shop" ? "mb-2" : "mb-1"
                        } `}
                    >
                        {capitalizeAll(getContentName())}
                    </h2>

                    {/* product price */}
                    {type === "product" && (
                        <p className="mb-1 black-white font-semibold text-sm">
                            Rs. {addCommas(price)}
                        </p>
                    )}

                    <div className="flex items-center">
                        <Rating rating={rating} onlyStars small />
                        <span className="text-xs ml-1">{rating}/5</span>
                    </div>

                    {type === "seller" && (
                        // seller address
                        <div className="space-y-1 mt-2">
                            {user?.address && (
                                <h3 className="flex items-center">
                                    <span>
                                        <LocationMarkerIcon className="icon-no-bg-small 500:icon-no-bg mr-1" />
                                    </span>
                                    <span className="text-xs 500:text-sm">
                                        {getSellerAddress()}
                                    </span>
                                </h3>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </CustomLink>
    );
};

export default ContentCard;
