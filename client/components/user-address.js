import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";

import { provinceOptions, districtOptions } from "../lib/address";
import { clearErrors, displayError } from "../lib/validation";
import { fetcher } from "../lib/fetcher";
import { updateAuthUser } from "../redux/slices/auth-slice";
import { setAlert } from "../redux/slices/alerts-slice";

import Form from "./form";
import InputGroup from "./input-group";
import Button from "./button";

const UserAddress = () => {
    const [province, setProvince] = useState("");
    const [city, setCity] = useState("");
    const [area, setArea] = useState("");
    const [description, setDescription] = useState("");
    const [provinceError, setProvinceError] = useState("");
    const [cityError, setCityError] = useState("");
    const [areaError, setAreaError] = useState("");
    const [descriptionError, setDescriptionError] = useState("");

    const [updating, setUpdating] = useState(false);

    const { authUser } = useSelector((state) => state.auth);

    const dispatch = useDispatch();
    const router = useRouter();

    useEffect(() => {
        const address = authUser?.address;

        setProvince(address?.province || "bagmati");
        setCity(address?.city || "");
        setArea(address?.area || "");
        setDescription(address?.description || "");
    }, [authUser]);

    useEffect(() => {
        if (
            province === "bagmati" &&
            !districtOptions.find((option) => option.value === city)
        ) {
            setCity("kathmandu");
        }
    }, [province, city]);

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        setUpdating(true);
        clearErrors([
            setProvinceError,
            setCityError,
            setAreaError,
            setDescriptionError,
        ]);

        try {
            const data = await fetcher("addresses/user", "POST", {
                province,
                city,
                area,
                description,
            });

            dispatch(
                updateAuthUser({
                    address: data.address,
                })
            );
            dispatch(setAlert({ message: "address updated successfully" }));

            const { redirect, prevRedirect } = router.query;
            let redirectUrl = "";

            if (redirect) {
                redirectUrl += `/${router.query.redirect}`;
            }

            if (prevRedirect) {
                redirectUrl += `/?redirect=${prevRedirect}`;
            }

            if (redirectUrl) {
                router.push(redirectUrl);
            }
        } catch (error) {
            displayError(
                error.message,
                ["province", "city", "area", "description"],
                [
                    setProvinceError,
                    setCityError,
                    setAreaError,
                    setDescriptionError,
                ]
            );
        } finally {
            setUpdating(false);
        }
    };

    return (
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
                view="textarea"
                showRequired={false}
                maxChars={100}
                onChange={setDescription}
            />

            <Button loading={updating} full>
                {updating ? "updating" : "update"} address
            </Button>
        </Form>
    );
};

export default UserAddress;
