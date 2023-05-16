import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";

import Form from "./form";
import InputGroup from "./input-group";
import Button from "./button";
import { provinceOptions, districtOptions } from "../lib/address";
import { clearErrors, displayError } from "../lib/validation";
import { fetcher } from "../lib/fetcher";
import { updateAuthUser } from "../redux/slices/auth-slice";

const UserAddress = () => {
    const [province, setProvince] = useState("bagmati");
    const [district, setDistrict] = useState("kathmandu");
    const [city, setCity] = useState("");
    const [area, setArea] = useState("");
    const [description, setDescription] = useState("");
    const [provinceError, setProvinceError] = useState("");
    const [districtError, setDistrictError] = useState("");
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
        setDistrict(address?.district || "kathmandu");
        setCity(address?.city || "");
        setArea(address?.area || "");
        setDescription(address?.description || "");
    }, [authUser]);

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        setUpdating(true);
        clearErrors([
            setProvinceError,
            setDistrictError,
            setCityError,
            setAreaError,
            setDescriptionError,
        ]);

        try {
            // dispatch(showLoadingModal("updating your address..."));

            const data = await fetcher("addresses/user", "POST", {
                province,
                district,
                city,
                area,
                description,
            });

            dispatch(
                updateAuthUser({
                    address: data.address,
                })
            );

            console.log("success");

            // dispatch(setAlert({ message: "address updated successfully" }));
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
                ["province", "district", "city", "area", "description"],
                [
                    setProvinceError,
                    setDistrictError,
                    setCityError,
                    setAreaError,
                    setDescriptionError,
                ]
            );

            console.log(error.message);
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

            {province === "bagmati" && (
                <InputGroup
                    label="district"
                    view="select"
                    options={districtOptions}
                    value={district}
                    error={districtError}
                    onChange={setDistrict}
                />
            )}

            <InputGroup
                label="city"
                placeholder="e.g. kathmandu"
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
                error={descriptionError}
                onChange={setDescription}
                view="textarea"
            />

            <Button loading={updating} full>
                {updating ? "updating" : "update"} address
            </Button>
        </Form>
    );
};

export default UserAddress;
