import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useDispatch, useSelector } from "react-redux";

import { clearErrors, displayError } from "../../lib/validation";
import { generateFormData } from "../../lib/form-data";
import { setAlert } from "../../redux/slices/alerts-slice";
import { updateAuthUser } from "../../redux/slices/auth-slice";
import { fetcher } from "../../lib/fetcher";

import Button from "../button";
import Form from "../form";
import InputGroup from "../input-group";
import FileSelector from "../file-selector";

const BusinessDetails = ({ business, handleCancellation }) => {
    const [name, setName] = useState("");
    const [nameError, setNameError] = useState("");
    const [ownerName, setOwnerName] = useState("");
    const [ownerNameError, setOwnerNameError] = useState("");
    const [PAN, setPAN] = useState("");
    const [PANError, setPANError] = useState("");
    const [phone, setPhone] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [regImage, setRegImage] = useState(null);
    const [regImageError, setRegImageError] = useState("");
    const [registering, setRegistering] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [fieldsDisabled, setFieldsDisabled] = useState(false);

    const { selectedFiles } = useSelector((state) => state.files);
    const { authUser } = useSelector((state) => state.auth);

    const router = useRouter();
    const dispatch = useDispatch();

    useEffect(() => {
        if (business) {
            setFieldsDisabled(true);

            if (business.isVerified) {
                router.push("/set-product");
            } else if (business.address) {
                // business has already been registered and address has already been set
                router.push("/business-registration/?view=pending");
            } else {
                // business has been already registered
                const { name, ownerName, PAN, phone } = business;
                setName(name);
                setOwnerName(ownerName);
                setPAN(PAN);
                setPhone(phone);
            }
        }
    }, [business]);

    useEffect(() => {
        if (selectedFiles.length > 0) {
            setRegImage(selectedFiles[0]);
        }
    }, [selectedFiles]);

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        // business registered, address not set and not updating -> simply route to the address set page
        if (business) {
            return router.push("/business-registration/?view=address");
        }

        clearErrors([
            setNameError,
            setOwnerNameError,
            setPANError,
            setPhoneError,
            setRegImageError,
        ]);
        setRegistering(true);

        try {
            const formData = generateFormData({ name, ownerName, PAN, phone });

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
            dispatch(setAlert({ message: "business details have been set" }));

            router.push("/business-registration/?view=address");
        } catch (error) {
            if (error.message.toLowerCase() === "file too large") {
                return setRegImageError(error.message);
            }

            displayError(
                error.message,
                [
                    "name",
                    "ownerName",
                    "PAN",
                    "phone",
                    "business registration certificate",
                ],
                [
                    setNameError,
                    setOwnerNameError,
                    setPANError,
                    setPhoneError,
                    setRegImageError,
                ]
            );
        } finally {
            setRegistering(false);
        }
    };

    return (
        <section>
            <Head>
                <title>Register business | provide details</title>
            </Head>

            <Form onSubmit={handleFormSubmit}>
                <InputGroup
                    label="name"
                    value={name}
                    error={nameError}
                    placeholder="legal business name"
                    disabled={fieldsDisabled}
                    onChange={setName}
                />

                <InputGroup
                    label="owner name"
                    value={ownerName}
                    error={ownerNameError}
                    placeholder="legal business owner"
                    disabled={fieldsDisabled}
                    onChange={setOwnerName}
                />

                <InputGroup
                    label="PAN"
                    value={PAN}
                    error={PANError}
                    placeholder="permanent account number"
                    disabled={fieldsDisabled}
                    onChange={setPAN}
                />

                <InputGroup
                    label="phone"
                    value={phone}
                    error={phoneError}
                    placeholder="landline or mobile"
                    disabled={fieldsDisabled}
                    onChange={setPhone}
                />

                <div className="mt-3">
                    <FileSelector
                        prevSrc={business?.regImage}
                        error={regImageError}
                        label="Business Registration Certificate"
                        isRequired={true}
                        disabled={fieldsDisabled}
                    />
                </div>

                <div className="flex items-center justify-between">
                    {business && (
                        <Button
                            type="tertiary"
                            rounded={false}
                            onClick={handleCancellation}
                        >
                            cancel reigstration
                        </Button>
                    )}
                    <Button
                        loading={registering || fetching}
                        full={!business}
                        rounded={false}
                    >
                        Continue
                    </Button>
                </div>
            </Form>
        </section>
    );
};

export default BusinessDetails;
