import { LocationMarkerIcon } from "@heroicons/react/outline";
import { useRouter } from "next/router";
import { BsImage } from "react-icons/bs";
import { useSelector } from "react-redux";

import { addCommas, capitalizeFirstLetter } from "../lib/strings";
import { getAddress } from "../lib/address";

import Rating from "./rating";
import CustomLink from "./custom-link";

const ContentCard = ({
    id,
    name,
    rating,
    user,
    image,
    images,
    price,
    type,
}) => {
    const router = useRouter();
    const { theme } = useSelector((state) => state.theme);

    const handleContentClick = () => {
        router.push(`/${type === "product" ? "products" : "sellers"}/${id}`);
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
                        src={
                            type === "seller"
                                ? image || `/images/shop-${theme}.png`
                                : images[0]
                        }
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
                        {capitalizeFirstLetter(name)}
                    </h2>

                    {/* product price */}
                    {price && (
                        <p className="mb-1 black-white font-semibold text-sm">
                            Rs. {addCommas(price)}
                        </p>
                    )}

                    <div className="flex items-center">
                        <Rating rating={rating} onlyStars small />
                        <span className="text-xs ml-1">{rating}/5</span>
                    </div>

                    {type === "seller" && (
                        <div className="space-y-1 mt-2">
                            {user?.address && (
                                <h3 className="flex items-center">
                                    <span>
                                        <LocationMarkerIcon className="icon-no-bg-small 500:icon-no-bg mr-1" />
                                    </span>
                                    <span className="text-xs 500:text-sm">
                                        {getAddress(user.address)}
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
