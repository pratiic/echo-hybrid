// 1. shows the quantity and variations of a product
// 2. allows controlling quantity of different variations
// 3. provides controls to order or add to cart

import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";

import { showGenericModal } from "../redux/slices/modal-slice";

import CountController from "./count-controller";
import ProductControl from "./product-control";
import Button from "./button";
import StockSetter from "./stock-setter";

const StockView = ({ productId, stockType, variations, stock, userCanBuy }) => {
    const [quantity, setQuantity] = useState(1);
    const [activeVariant, setActiveVariant] = useState(
        stock.variants ? stock.variants[0] : null
    );
    const [remainingCount, setRemainingCount] = useState(0);

    const dispatch = useDispatch();

    useEffect(() => {
        if (stockType === "varied") {
            setRemainingCount(parseInt(activeVariant.quantity));
        } else {
            setRemainingCount(parseInt(stock.quantity));
        }
    }, [activeVariant, stockType, stock]);

    useEffect(() => {
        setActiveVariant(stock.variants ? stock.variants[0] : null);
    }, [stock]);

    const changeActiveVariant = (label, option) => {
        const newVariant = { ...activeVariant, [label]: option };
        let newArrangedVariant = {};

        Object.keys(activeVariant).map((key) => {
            newArrangedVariant[key] = newVariant[key];
        });

        let variantStr = getVariantStr(newArrangedVariant);

        const newActiveVariant = stock.variants.find((variant) => {
            const vStr = getVariantStr(variant);

            if (vStr === variantStr) {
                return true;
            }

            return false;
        });

        if (newActiveVariant) {
            setQuantity(1);
            return setActiveVariant(newActiveVariant);
        }

        setActiveVariant({ ...activeVariant, [label]: option, quantity: 0 });
    };

    const renderVariantOptions = (variant) => {
        return (
            <div className="flex flex-wrap uppercase text-sm">
                {variant.options.map((option) => {
                    return (
                        <div
                            className={`px-3 py-[0.35rem] rounded cursor-pointer bg-gray-100 dark:bg-gray-700 box-content  transition-all duration-200 mr-3 mb-3 ${
                                activeVariant[variant?.label] === option
                                    ? "border border-blue-three text-blue-four"
                                    : "dark-light border border-gray-100 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 hover:black-white active:bg-gray-100 dark:active:bg-gray-700 active:dark-light"
                            }`}
                            key={option}
                            onClick={() =>
                                changeActiveVariant(variant.label, option)
                            }
                        >
                            {option}
                        </div>
                    );
                })}
            </div>
        );
    };

    const getVariantStr = (variant) => {
        let variantStr = "";

        Object.keys(variant).forEach((key) => {
            if (key !== "id" && key !== "quantity") {
                variantStr += variant[key];
            }
        });

        return variantStr;
    };

    const getTotalQuantity = () => {
        let totalQuantity = 0;

        stock?.variants?.forEach((variant) => {
            totalQuantity += parseInt(variant.quantity);
        });

        return totalQuantity;
    };

    const renderTotalQuantity = () => {
        if (stockType === "flat") {
            return;
        }

        const totalQuantity = getTotalQuantity();

        return (
            <p className="-mt-4 dark-light text-sm max-w-[200px]">
                {totalQuantity === 0 && getInOrderQuantity(true) === 0
                    ? "Out of stock "
                    : `${totalQuantity || "No"} ${
                          totalQuantity > 1 || totalQuantity === 0
                              ? "items"
                              : "item"
                      } `}
                {getInOrderQuantity(true)
                    ? `(plus ${getInOrderQuantity(true)} in order) `
                    : " "}
                across all variants{" "}
            </p>
        );
    };

    const renderRemainingQuantity = () => {
        return (
            <p className="text-sm mt-2 dark-light mb-5 max-w-[170px]">
                {stockType === "flat" ? (
                    remainingCount === 0 && getInOrderQuantity() === 0 ? (
                        "Out of stock"
                    ) : (
                        `${remainingCount || "No"} ${
                            remainingCount > 1 || remainingCount === 0
                                ? "items"
                                : "item"
                        } ${
                            getInOrderQuantity() > 0
                                ? `(plus ${getInOrderQuantity()} in order)`
                                : ""
                        } remaining`
                    )
                ) : (
                    <React.Fragment>
                        <span className="block mb-1">Remaining</span>
                        <span>
                            {remainingCount === 0 &&
                            getInOrderQuantity() === 0 ? (
                                "Out of stock "
                            ) : (
                                <React.Fragment>
                                    {remainingCount || "No"}
                                    {remainingCount > 1 || remainingCount === 0
                                        ? " items"
                                        : " item"}{" "}
                                    {getInOrderQuantity() > 0
                                        ? `(plus ${getInOrderQuantity()} in order) `
                                        : " "}
                                </React.Fragment>
                            )}
                            in this variant
                        </span>
                    </React.Fragment>
                )}
            </p>
        );
    };

    const getInOrderQuantity = (total) => {
        const inOrder = stock.inOrder || {};

        if (stockType === "flat") {
            return inOrder.total || 0;
        } else {
            let inOrderQuantity = 0;

            if (total) {
                for (let key in inOrder) {
                    inOrderQuantity += inOrder[key];
                }
            } else {
                inOrderQuantity = inOrder[activeVariant?.id] || 0;
            }

            return inOrderQuantity;
        }
    };

    return (
        <div
            className={`flex flex-col ${
                userCanBuy ? "600:flex-row" : "500:flex-row"
            }`}
        >
            {stockType === "varied" && (
                <div
                    className={`mr-0 ${
                        userCanBuy ? "600:mr-7" : "500:mr-7"
                    } w-full ${userCanBuy ? "600:w-[250px]" : "500:w-[250px]"}`}
                >
                    {variations.map((vt) => {
                        return (
                            <div className={vt.label}>
                                <span className="capitalize dark-light block mb-1">
                                    {vt.label}
                                </span>

                                {renderVariantOptions(vt)}
                            </div>
                        );
                    })}
                </div>
            )}

            <div>
                <p className="mb-1 dark-light">Quantity</p>

                {/* increment and decrement quantity */}
                <CountController
                    count={quantity}
                    max={remainingCount}
                    setCount={setQuantity}
                    setZero={remainingCount === 0}
                    userCanBuy={userCanBuy}
                />

                {/* quantity (flat) or quantity of a variation (varied) */}

                {renderRemainingQuantity()}

                {/* total quantity remaining */}
                {renderTotalQuantity()}

                {userCanBuy && remainingCount > 0 && (
                    <ProductControl
                        quantity={quantity}
                        variantId={activeVariant?.id}
                        variant={activeVariant}
                        productId={productId}
                    />
                )}

                {!userCanBuy && (
                    <div className="mt-3">
                        <Button
                            onClick={() =>
                                dispatch(
                                    showGenericModal(
                                        <StockSetter
                                            productId={productId}
                                            stockType={stockType}
                                            variations={variations}
                                            currentStock={stock}
                                        />
                                    )
                                )
                            }
                        >
                            update stock
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StockView;
