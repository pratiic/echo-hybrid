import React from "react";
import { useDispatch } from "react-redux";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/outline";

import { updateActiveProduct } from "../../redux/slices/products-slice";
import { capitalizeFirstLetter, addCommas } from "../../lib/strings";

import ChatButton from "../chat-button";
import Rating from "../rating";
import Gallery from "../gallery";
import ProductControl from "../product-control";

const PrimaryInfo = ({
    store,
    name,
    price,
    per,
    images,
    description,
    rating,
    brand,
    toggleSecondaryInfo,
    isMyProduct,
    isSecondHand,
}) => {
    const dispatch = useDispatch();

    const handleImageDeletion = (images) => {
        dispatch(updateActiveProduct(images));
        dispatch(setAlert({ message: "product image deleted successfully" }));
    };

    return (
        <div className="text-t-black">
            <div className="flex flex-col-reverse 500:flex-row 500:space-x-4 650:space-x-5 700:space-x-7 1200:mr-5">
                <Gallery
                    images={images}
                    isMyProduct={isMyProduct}
                    onDelete={
                        isMyProduct && images?.length > 1 && handleImageDeletion
                    }
                />

                <div>
                    {/* product name */}
                    <h2 className="text-2xl 500:text-xl 650:text-2xl font-semibold mb-1 dark:text-gray-100 leading-tight">
                        {capitalizeFirstLetter(name)}
                    </h2>

                    {/* product rating */}
                    <Rating rating={rating} small onlyStars />

                    {/* brand info */}
                    <div
                        className={`flex items-center space-x-2 my-2 dark-light`}
                    >
                        <p className="text-xs font-semibold border-r-2 border-gray-300 dark:border-gray-700 pr-2">
                            <span>Brand</span>
                            <span className="black-white">
                                {" "}
                                {!brand
                                    ? "no brand"
                                    : capitalizeFirstLetter(brand)}
                            </span>
                        </p>

                        <p className="flex items-center text-xs font-semibold">
                            <span className="mr-1">Second hand</span>
                            {isSecondHand ? (
                                <CheckCircleIcon className="icon-no-bg" />
                            ) : (
                                <XCircleIcon className="icon-no-bg" />
                            )}
                        </p>
                    </div>

                    {/* product price  */}
                    <h3 className="flex items-center text-xl font-bold mb-2">
                        <span className="text-blue-three">
                            Rs. {addCommas(price)}
                        </span>{" "}
                        {per && (
                            <span className="dark-light font-normal text-base ml-2">
                                (per {per})
                            </span>
                        )}
                    </h3>

                    {/* product description  */}
                    {description && (
                        <p className="whitespace-pre-wrap dark-light mb-3">
                            {capitalizeFirstLetter(description)}
                        </p>
                    )}

                    {/* view secondary info button  */}
                    <div className="flex 1200:hidden mb-2">
                        <button
                            className="text-sm mr-3 text-blue-three w-fit px-2 py-1 border border-gray-200 rounded hover:bg-gray-100 transition-all duration-200 active:bg-gray-200 dark:border-gray-700 dark:hover:bg-gray-800 dark:active:bg-gray-700"
                            onClick={toggleSecondaryInfo}
                        >
                            View More
                        </button>
                        {isMyProduct && <ChatButton />}
                    </div>

                    {/* control for second hand products */}
                    {isSecondHand && !isMyProduct && (
                        <ProductControl isSecondHand={true} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default PrimaryInfo;
