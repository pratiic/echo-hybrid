import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
    PlusIcon,
    XIcon,
    PencilAltIcon,
    CheckIcon,
} from "@heroicons/react/outline";

import { fetcher } from "../lib/fetcher";
import { closeModal, showGenericModal } from "../redux/slices/modal-slice";
import { setAlert } from "../redux/slices/alerts-slice";
import { updateActiveProduct } from "../redux/slices/products-slice";
import { capitalizeFirstLetter } from "../lib/strings";
import { getVariantStr } from "../lib/stock";

import InputGroup from "./input-group";
import Button from "./button";
import VariationsSetter from "./variations-setter";

const StockSetter = ({
    productId,
    stockType,
    variations = [],
    currentStock,
}) => {
    const [quantity, setQuantity] = useState(1);
    const [variants, setVariants] = useState(
        currentStock ? currentStock.variants || [] : []
    );
    const [activeVariant, setActiveVariant] = useState(null);
    const [activeOptions, setActiveOptions] = useState(
        variations?.map((variation) => {
            return {
                label: variation.label,
                value: variation.options[0],
            };
        })
    );
    const [settingStock, setSettingStock] = useState(false);
    const [error, setError] = useState("");

    const dispatch = useDispatch();

    useEffect(() => {
        if (stockType === "varied" && variations.length === 0) {
            dispatch(
                showGenericModal(<VariationsSetter productId={productId} />)
            );
            dispatch(
                setAlert({
                    message: "you need to set product variations first",
                    type: "info",
                })
            );
        }
    }, [stockType, variations]);

    useEffect(() => {
        // if creating, the initial quantity is always 1
        if (!currentStock) {
            setQuantity(1);
        } else {
            if (stockType === "flat") {
                setQuantity(currentStock.quantity);
            } else {
                setQuantity(activeVariant?.quantity || 1);
            }
        }
    }, [activeVariant, currentStock]);

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        setSettingStock(true);
        setError("");

        try {
            let dataToSend = null;

            if (stockType === "flat") {
                dataToSend = { quantity };
            } else {
                dataToSend = { variants };
            }

            const data = await fetcher(
                `stocks/${productId}`,
                "POST",
                dataToSend
            );

            dispatch(updateActiveProduct({ stock: data.stock }));
            dispatch(
                setAlert({
                    message: `product stock has been ${
                        currentStock ? "updated" : "set"
                    }`,
                })
            );
            dispatch(closeModal());

            if (!currentStock) {
                // send a notification to all subscribers of the shop
                try {
                    const product = data.stock.product;
                    for (
                        let i = 0;
                        i < product.shop.subscriptions.length;
                        i++
                    ) {
                        fetcher("notifications", "POST", {
                            text: `${
                                product.shop.name
                            } added a new product - ${capitalizeFirstLetter(
                                product.name
                            )}`,
                            destinationId: product.shop.subscriptions[i].userId,
                            linkTo: `/products/${product.id}`,
                        });
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setSettingStock(false);
        }
    };

    const handleOptionChange = (option, label) => {
        setActiveOptions(
            activeOptions.map((activeOption) => {
                if (activeOption.label === label) {
                    return { ...activeOption, value: option };
                }

                return activeOption;
            })
        );
    };

    const renderVariedStockSetter = () => {
        return (
            <div>
                <div className="flex items-center flex-wrap">
                    {variations.map((variation) => {
                        return (
                            <div
                                className="mr-5 last:mr-0"
                                key={variation.label}
                            >
                                <label className="capitalize dark-light">
                                    {variation.label}
                                </label>
                                <InputGroup
                                    view="select"
                                    value={
                                        activeVariant
                                            ? activeVariant[variation.label]
                                            : activeOptions[variation.label]
                                    }
                                    options={variation.options.map((option) => {
                                        return {
                                            label: option,
                                            value: option,
                                        };
                                    })}
                                    onChange={(option) =>
                                        handleOptionChange(
                                            option,
                                            variation.label
                                        )
                                    }
                                />
                            </div>
                        );
                    })}
                </div>

                <div className="flex items-center">
                    <div>
                        <label className="dark-light">Quantity</label>
                        {renderQuantitySetter()}
                    </div>

                    {activeVariant ? (
                        <CheckIcon
                            className="icon ml-5"
                            onClick={handleTickClick}
                        />
                    ) : (
                        <PlusIcon
                            className="icon ml-5"
                            onClick={handlePlusClick}
                        />
                    )}
                </div>
            </div>
        );
    };

    const handlePlusClick = () => {
        let variant = {};
        setActiveVariant(null);

        variations.forEach((variation, index) => {
            variant[variation["label"]] = activeOptions[index]["value"];
        });

        const variantStr = getVariantStr(variant);
        const allVariantStrs = variants.map((variant) => {
            const arrangedVariant = {};

            variations.forEach((variation, index) => {
                const label = variation["label"];

                arrangedVariant[label] = variant[label];
            });

            return getVariantStr(arrangedVariant);
        });

        // add a new variant
        if (allVariantStrs.indexOf(variantStr) === -1) {
            variant.quantity = quantity;
            setVariants([...variants, variant]);
        }

        // for existing variant
        if (allVariantStrs.indexOf(variantStr) !== -1) {
            const variantIndex = allVariantStrs.indexOf(variantStr);

            setVariants(
                variants.map((variant, index) => {
                    if (variantIndex === index) {
                        return { ...variant, quantity };
                    }

                    return variant;
                })
            );
        }
    };

    const renderVariants = () => {
        if (variants.length === 0) {
            return;
        }

        const variantLabels = Object.keys(variants[0]);

        return (
            <div>
                {variants.map((variant, index) => {
                    if (parseInt(variant.quantity) === 0) {
                        return null;
                    }

                    return (
                        <div
                            className={`flex flex-wrap items-center justify-between mb-3 border-b px-1 min-w-[275px] ${
                                variant.id === activeVariant?.id && currentStock
                                    ? "text-blue-three"
                                    : "dark-light"
                            }`}
                            key={index}
                        >
                            {variantLabels.map((variantLabel, index) => {
                                // do not show the id of a variant
                                if (variantLabel !== "id") {
                                    return (
                                        <span
                                            className="uppercase text-sm mr-2"
                                            key={index}
                                        >
                                            {variant[variantLabel]}
                                        </span>
                                    );
                                }
                            })}
                            {/* if updating stock, show edit icon, otherwise show delete icon */}
                            {currentStock ? (
                                <PencilAltIcon
                                    className="icon-small"
                                    onClick={() => handleUpdateClick(index)}
                                />
                            ) : (
                                <XIcon
                                    className="icon-small"
                                    onClick={() => handleDeleteClick(index)}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const handleDeleteClick = (index) => {
        setVariants(variants.filter((variant, i) => i !== index));
    };

    const renderQuantitySetter = () => {
        return (
            <InputGroup
                view="number"
                value={quantity}
                min={currentStock ? 0 : 1}
                onChange={setQuantity}
            />
        );
    };

    const handleUpdateClick = (index) => {
        const variantToUpdate = variants[index];
        const filteredVariants = variants.filter((variant, i) => i !== index);
        setVariants([variantToUpdate, ...filteredVariants]);
        setActiveVariant(variantToUpdate);
    };

    const handleTickClick = () => {
        // update the active variant
        setVariants(
            variants.map((variant, index) => {
                if (index === 0) {
                    return { ...variant, quantity };
                }

                return variant;
            })
        );
        setActiveVariant(null);
    };

    return (
        <div className="max-w-[350px] px-3">
            <h3 className="heading-generic-modal">
                {currentStock ? "Update" : "Set"} product stock
            </h3>

            {renderVariants()}

            <form onSubmit={handleFormSubmit}>
                <div className="-mb-5 pb-5">
                    {stockType === "flat" ? (
                        <React.Fragment>
                            <label className="block mb-1 black-white">
                                Quantity
                            </label>
                            {renderQuantitySetter()}
                        </React.Fragment>
                    ) : (
                        renderVariedStockSetter()
                    )}
                </div>

                {error && <p className="error mb-3">{error}</p>}

                <Button loading={settingStock} full>
                    {settingStock
                        ? currentStock
                            ? "updating"
                            : "setting"
                        : currentStock
                        ? "update"
                        : "set"}{" "}
                    stock
                </Button>
            </form>
        </div>
    );
};

export default StockSetter;
