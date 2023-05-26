import React, { useState, useEffect } from "react";

import { districtOptions, provinceOptions } from "../lib/address";
import { capitalizeFirstLetter } from "../lib/strings";

import InputGroup from "./input-group";

const AddressSetter = ({
    title = "delivery address",
    note,
    onAddressChange,
}) => {
    const [province, setProvince] = useState("bagmati");
    const [city, setCity] = useState("");
    const [area, setArea] = useState("");
    const [description, setDescription] = useState("");
    const [deliveryAddressSelf, setDeliveryAddressSelf] = useState(true);

    useEffect(() => {
        if (!deliveryAddressSelf) {
            setProvince("bagmati");
            setCity("");
            setArea("");
            setDescription("");
        }
    }, [deliveryAddressSelf]);

    useEffect(() => {
        onAddressChange(
            {
                province,
                city: city || province === "bagmati" ? "kathmandu" : "",
                area,
                description,
            },
            deliveryAddressSelf
        );
    }, [province, city, area, deliveryAddressSelf]);

    const handleAddressOptionChange = () => {
        setDeliveryAddressSelf(!deliveryAddressSelf);
    };

    return (
        <div className="">
            <h5 className="black-white font-semibold mb-1 leading-tight">
                {capitalizeFirstLetter(title)}

                {note && (
                    <span className="ml-1 dark-light font-normal">
                        ({note})
                    </span>
                )}
            </h5>

            <div>
                {/* address option */}
                <div className="flex items-center">
                    <input
                        id="delivery address"
                        type="checkbox"
                        value="self"
                        checked={deliveryAddressSelf}
                        onChange={handleAddressOptionChange}
                    />
                    <label
                        for="delivery address"
                        className="ml-2 text-sm dark-light"
                    >
                        My address
                    </label>
                </div>

                {/* custom address */}
                {!deliveryAddressSelf && (
                    <div className="mt-2 w-[20rem]">
                        <InputGroup
                            label="province"
                            view="select"
                            options={provinceOptions}
                            value={province}
                            onChange={setProvince}
                        />
                        <InputGroup
                            label="city"
                            view={province === "bagmati" ? "select" : "input"}
                            options={districtOptions}
                            value={city}
                            onChange={setCity}
                        />
                        <InputGroup
                            label="area"
                            placeholder="e.g. koteshwor"
                            value={area}
                            onChange={setArea}
                        />
                        <InputGroup
                            label="description"
                            value={description}
                            placeholder="max 100 chars"
                            onChange={setDescription}
                            view="textarea"
                            showRequired={false}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddressSetter;
