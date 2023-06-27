import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";

import { generateFormData } from "../../lib/form-data";
import { setAlert } from "../../redux/slices/alerts-slice";
import { updateAuthUser } from "../../redux/slices/auth-slice";
import { fetcher } from "../../lib/fetcher";
import { districtOptions, provinceOptions } from "../../lib/address";

import Button from "../button";
import InputGroup from "../input-group";
import FileSelector from "../file-selector";
import Form from "../form";
import ErrorBanner from "../error-banner";

const BusinessDetails = ({ business }) => {
    const [name, setName] = useState("");
    const [PAN, setPAN] = useState("");
    const [phone, setPhone] = useState("");
    const [regImage, setRegImage] = useState(null);
    const [province, setProvince] = useState("bagmati");
    const [city, setCity] = useState("");
    const [area, setArea] = useState("");
    const [description, setDescription] = useState("");
    const [registering, setRegistering] = useState(false);
    const [error, setError] = useState("");

    const { selectedFiles } = useSelector((state) => state.files);
    const { authUser } = useSelector((state) => state.auth);

    const router = useRouter();
    const dispatch = useDispatch();

    useEffect(() => {
        if (business) {
            if (business.isVerified) {
                router.push("/set-product");
            } else {
                router.push("/business-registration/?view=pending");
            }
        }
    }, [business]);

    useEffect(() => {
        if (selectedFiles.length > 0) {
            setRegImage(selectedFiles[0]);
        }
    }, [selectedFiles]);

    useEffect(() => {
        setCity(province === "bagmati" ? "kathmandu" : "");
    }, [province]);

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        setRegistering(true);
        setError("");

        try {
            const formData = generateFormData({
                name,
                PAN,
                phone,
                province,
                city,
                area,
                description,
            });

            if (regImage) {
                formData.append("image", regImage);
            }

            const data = await fetcher("businesses", "POST", formData);

            dispatch(
                updateAuthUser({
                    store: {
                        ...authUser?.store,
                        business: {
                            id: data.business.id,
                            isVerified: data.business.isVerified,
                        },
                    },
                })
            );
            dispatch(setAlert({ message: "business has been registered" }));

            router.push("/business-registration/?view=pending");
        } catch (error) {
            setError(error.message);
        } finally {
            setRegistering(false);
        }
    };

    return (
        <form
            className="-mt-1 pb-5 w-fit 800:mx-auto"
            onSubmit={handleFormSubmit}
        >
            <div className="flex flex-col 800:flex-row 800:space-x-12">
                <div className="w-[20rem]">
                    <h2 className="form-subheading">Business Details</h2>

                    <InputGroup
                        label="name"
                        value={name}
                        placeholder="legal business name"
                        onChange={setName}
                    />

                    <InputGroup
                        label="PAN"
                        value={PAN}
                        placeholder="permanent account number"
                        onChange={setPAN}
                    />

                    <InputGroup
                        label="phone"
                        value={phone}
                        placeholder="landline or mobile"
                        onChange={setPhone}
                    />

                    <div className="mt-3">
                        <FileSelector
                            prevSrc={business?.regImage}
                            label="Business Registration Certificate"
                            isRequired={true}
                        />
                    </div>
                </div>

                <div className="w-[20rem]">
                    <h2 className="form-subheading">Business Address</h2>

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
                    />
                </div>
            </div>

            <div className="w-[20rem]">
                {error && (
                    <div className="mb-5">
                        <ErrorBanner>{error}</ErrorBanner>
                    </div>
                )}

                <Button
                    loading={registering}
                    rounded={false}
                    className="w-full"
                >
                    {registering ? "registering" : "register"} business
                </Button>
            </div>
        </form>
    );
};

export default BusinessDetails;
