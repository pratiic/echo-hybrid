import React from "react";
import { capitalizeFirstLetter } from "../lib/strings";

import ProductControl from "./product-control";

const OrderHead = ({ product, variant, quantity }) => {
    return (
        <div className="flex">
            <div>
                {/* product image */}
                <img
                    src={product?.images[0]}
                    className="image w-[9rem] rounded"
                />
            </div>

            {/* product details */}
            <div className="ml-5 w-fit max-w-[200px]">
                <h3 className="text-lg 450:text-xl leading-tight font-semibold black-white">
                    {capitalizeFirstLetter(product?.name)}
                </h3>

                {variant && (
                    <div>
                        {Object.keys(variant).map((key, i) => {
                            if (key !== "id" && key !== "quantity") {
                                return (
                                    <p key={i}>
                                        <span className="dark-light">
                                            {key}
                                        </span>

                                        <span className="uppercase text-blue-three font-semibold text-sm ml-1">
                                            {variant[key]}
                                        </span>
                                    </p>
                                );
                            }
                        })}
                    </div>
                )}

                {!product.isSecondHand && (
                    <p className="black-white">x {quantity}</p>
                )}

                {product.isSecondHand && (
                    <React.Fragment>
                        <div className="bg-gray-100 w-fit rounded-full dark-light px-2 py-[3px] text-xs mt-2 capitalize">
                            second hand
                        </div>

                        <ProductControl
                            productId={product?.id}
                            canAddToCart={false}
                            product={product}
                            className="mt-5"
                        />
                    </React.Fragment>
                )}
            </div>
        </div>
    );
};

export default OrderHead;
