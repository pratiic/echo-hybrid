import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useDispatch } from "react-redux";

import { provinceOptions, districtOptions } from "../../lib/address";
import { clearErrors, displayError } from "../../lib/validation";
import { fetcher } from "../../lib/fetcher";
import { setAlert } from "../../redux/slices/alerts-slice";

import Form from "../form";
import InputGroup from "../input-group";
import Button from "../button";

const BusinessAddress = ({ address }) => {
    const [province, setProvince] = useState("bagmati");
    const [provinceError, setProvinceError] = useState("");
    const [city, setCity] = useState("");
    const [cityError, setCityError] = useState("");
    const [area, setArea] = useState("");
    const [areaError, setAreaError] = useState("");
    const [description, setDescription] = useState("");
    const [descriptionError, setDescriptionError] = useState("");
    const [requesting, setRequesting] = useState(false);

    const router = useRouter();
    const dispatch = useDispatch();

    useEffect(() => {
        setCity(province === "bagmati" ? "kathmandu" : "");
    }, [province]);

    const handleBackClick = (event) => {
        event.preventDefault();

        router.push("/business-registration/?view=details");
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        setRequesting(true);
        clearErrors([
            setProvinceError,
            setCityError,
            setAreaError,
            setDescriptionError,
        ]);

        try {
            await fetcher("addresses/business", "POST", {
                province,
                city,
                area,
                description,
            });

            dispatch(setAlert({ message: "business address has been set" }));
            router.push("/business-registration/?view=pending");
        } catch (error) {
            displayError(
                error.message,
                ["province", "district", "city", "area", "description"],
                [
                    setProvinceError,
                    setCityError,
                    setAreaError,
                    setDescriptionError,
                ]
            );
        } finally {
            setRequesting(false);
        }
    };

    return (
        <section>
            <Form onSubmit={handleFormSubmit}>
                <InputGroup
                    label="province"
                    view="select"
                    options={provinceOptions}
                    value={province}
                    error={provinceError}
                    onChange={setProvince}
                />

                <InputGroup
                    label="city"
                    view={province === "bagmati" ? "select" : "input"}
                    options={districtOptions}
                    value={city}
                    error={cityError}
                    onChange={setCity}
                />

                <InputGroup
                    label="area"
                    placeholder="e.g. koteshwor"
                    value={area}
                    error={areaError}
                    onChange={setArea}
                />

                <InputGroup
                    label="description"
                    value={description}
                    placeholder="max 100 chars"
                    error={descriptionError}
                    onChange={setDescription}
                    view="textarea"
                />

                {/* change style later */}
                <div className="flex items-center justify-between">
                    <Button
                        type="tertiary"
                        rounded={false}
                        onClick={handleBackClick}
                    >
                        go back
                    </Button>

                    <Button loading={requesting} rounded={false}>
                        {requesting ? "setting" : "set"} address
                    </Button>
                </div>
            </Form>
        </section>
    );
};

export default BusinessAddress;
