import React from "react";
import { useDispatch } from "react-redux";
import { InformationCircleIcon } from "@heroicons/react/outline";

import { updateActiveProduct } from "../../redux/slices/products-slice";
import { capitalizeFirstLetter, addCommas } from "../../lib/strings";
import { setAlert } from "../../redux/slices/alerts-slice";

import ChatButton from "../chat-button";
import Rating from "../rating";
import Gallery from "../gallery";
import ProductControl from "../product-control";
import Icon from "../icon";
import Tag from "../tag";

const PrimaryInfo = ({
    id,
    name,
    price,
    per,
    images,
    description,
    rating,
    toggleSecondaryInfo,
    isMyProduct,
    isSecondHand,
    hasBeenSold,
}) => {
    const dispatch = useDispatch();

    const handleImageDeletion = (images) => {
        dispatch(updateActiveProduct({ images }));
        dispatch(setAlert({ message: "product image has been deleted" }));
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

                <div className="max-w-[350px]">
                    {/* product name */}
                    <h2 className="text-lg 650:text-xl 750:text-[1.4rem] font-semibold mb-1 black-white leading-tight">
                        {capitalizeFirstLetter(name)}
                    </h2>

                    {/* product rating */}
                    {!isSecondHand && (
                        <div className="mb-1">
                            <Rating rating={rating} small onlyStars />
                        </div>
                    )}

                    {/* product state info */}
                    <div
                        className={`flex items-center space-x-3 mb-2 ${isSecondHand &&
                            "-mt-1"}`}
                    >
                        <Tag
                            text={isSecondHand ? "second hand" : "brand new"}
                        />
                        {isMyProduct && <Tag text="my product" />}
                        {hasBeenSold && <Tag text="sold out" />}
                    </div>

                    {/* product price  */}
                    <h3 className="flex items-center mb-1">
                        <span className="text-blue-three font-semibold text-lg 650:text-xl">
                            Rs. {addCommas(price)}
                        </span>{" "}
                        {per && (
                            <span className="dark-light ml-2">(per {per})</span>
                        )}
                    </h3>

                    {/* product description  */}
                    {description && (
                        <p className="whitespace-pre-wrap dark-light mb-3">
                            {capitalizeFirstLetter(description)}
                        </p>
                    )}

                    <div className="flex text-sm border border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-ten w-fit rounded-full 1200:hidden mb-3 px-1">
                        <Icon
                            toolName="more details"
                            onClick={toggleSecondaryInfo}
                        >
                            <InformationCircleIcon className="icon" />
                        </Icon>

                        <ChatButton
                            small
                            isDisabled={isMyProduct ? true : false}
                        />
                    </div>

                    {/* control for second hand products */}
                    {isSecondHand && !isMyProduct && !hasBeenSold && (
                        <ProductControl isSecondHand={true} productId={id} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default PrimaryInfo;
