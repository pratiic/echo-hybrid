import React, { useState } from "react";
import { PlusIcon, XIcon } from "@heroicons/react/outline";
import { useDispatch } from "react-redux";

import { fetcher } from "../lib/fetcher";
import { removeDuplicates } from "../lib/array";
import { closeModal, showGenericModal } from "../redux/slices/modal-slice";
import { setAlert } from "../redux/slices/alerts-slice";
import { updateActiveProduct } from "../redux/slices/products-slice";

import InputGroup from "./input-group";
import Form from "./form";
import Button from "./button";
import Icon from "./icon";
import StockSetter from "./stock-setter";

const VariationsSetter = ({ productId }) => {
    const [label, setLabel] = useState("");
    const [options, setOptions] = useState("");
    const [variations, setVariations] = useState([]);
    const [settingTypes, setSettingTypes] = useState(false);
    const [error, setError] = useState("");

    const dispatch = useDispatch();

    const handlePlusClick = () => {
        setError("");

        if (!label || !options) {
            return setError("both label and options are required");
        }

        // duplicate labels are not allowed
        if (variations.find((variation) => variation.label === label)) {
            return setError(`label ${label} already exists`);
        }

        setVariations([
            ...variations,
            { label, options: removeDuplicates(options.trim().split(",")) },
        ]);
        setLabel("");
        setOptions("");
    };

    const handleDeleteClick = (index) => {
        setVariations(variations.filter((variation, i) => i !== index));
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSettingTypes(true);

        try {
            const data = await fetcher(
                `product-variations/${productId}`,
                "POST",
                {
                    variations,
                }
            );

            dispatch(updateActiveProduct({ variations: data.variations }));
            dispatch(setAlert({ message: "variations have been set" }));
            dispatch(
                showGenericModal(
                    <StockSetter
                        productId={productId}
                        stockType="varied"
                        variations={data.variations}
                    />
                )
            );
        } catch (error) {
            setError(error.message);
        } finally {
            setSettingTypes(false);
        }
    };

    return (
        <div className="max-w-[350px]">
            <h3 className="heading-generic-modal">Set product variations</h3>

            <div className="mb-5">
                {variations.map((variation, index) => {
                    return (
                        <div
                            className="flex flex-wrap items-center justify-between mb-3 border-b"
                            key={index}
                        >
                            <span className="capitalize black-white mr-3">
                                {variation.label}
                            </span>

                            <span
                                className="dark-light mr-3 uppercase text-sm"
                                key="option"
                            >
                                {variation.options.map((option, index) => {
                                    return `${option}${
                                        index === variation.options.length - 1
                                            ? ""
                                            : ", "
                                    }`;
                                })}
                            </span>

                            <XIcon
                                className="icon-small"
                                onClick={() => handleDeleteClick(index)}
                            />
                        </div>
                    );
                })}
            </div>

            <Form small onSubmit={handleFormSubmit}>
                <div className="input-pair">
                    <InputGroup
                        label="label"
                        placeholder="e.g. color"
                        value={label}
                        onChange={setLabel}
                    />
                    <InputGroup
                        label="options"
                        placeholder="e.g. red, blue"
                        value={options}
                        onChange={setOptions}
                    />
                </div>

                {error && (
                    <div className="mb-1 -mt-2">
                        {" "}
                        <span className="error">{error}</span>{" "}
                    </div>
                )}

                <Icon onClick={handlePlusClick} className="mb-5 w-fit mx-auto">
                    <PlusIcon className="icon" />
                </Icon>

                <Button full loading={settingTypes}>
                    {settingTypes ? "setting" : "set"} variations
                </Button>
            </Form>
        </div>
    );
};

export default VariationsSetter;
