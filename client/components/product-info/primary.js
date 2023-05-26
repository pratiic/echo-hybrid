import React from "react";
import { useDispatch } from "react-redux";
import { InformationCircleIcon } from "@heroicons/react/outline";

import { updateActiveProduct } from "../../redux/slices/products-slice";
import { capitalizeFirstLetter, addCommas } from "../../lib/strings";

import ChatButton from "../chat-button";
import Rating from "../rating";
import Gallery from "../gallery";
import ProductControl from "../product-control";
import Icon from "../icon";
import Tag from "../tag";

const PrimaryInfo = ({
    id,
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
                    {!isSecondHand && (
                        <Rating rating={rating} small onlyStars />
                    )}

                    {/* product state info */}
                    <div className="mt-3 mb-2">
                        <Tag
                            text={isSecondHand ? "second hand" : "brand new"}
                        />
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

                    <div className="flex text-sm border border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-ten w-fit rounded-full 1200:hidden mb-2 px-1">
                        <Icon
                            toolName="more details"
                            onClick={toggleSecondaryInfo}
                        >
                            <InformationCircleIcon className="icon" />
                        </Icon>

                        {
                            <ChatButton
                                small
                                // isDisabled={isMyProduct ? true : false}
                                isDisabled={true}
                            />
                        }
                    </div>

                    {/* control for second hand products */}
                    {isSecondHand && !isMyProduct && (
                        <ProductControl isSecondHand={true} productId={id} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default PrimaryInfo;
