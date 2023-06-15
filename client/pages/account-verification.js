import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import Head from "next/head";

import { capitalizeFirstLetter } from "../lib/strings";
import { fetcher } from "../lib/fetcher";
import { updateAuthUser } from "../redux/slices/auth-slice";
import { setAlert } from "../redux/slices/alerts-slice";

import PageHeader from "../components/page-header";
import InfoBanner from "../components/info-banner";
import InputGroup from "../components/input-group";
import Button from "../components/button";

const AccountVerification = () => {
    const [code, setCode] = useState("");
    const [verificationError, setVerificationError] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [requestError, setRequestError] = useState("");
    const [requesting, setRequesting] = useState(false);

    const { authUser } = useSelector((state) => state.auth);
    const router = useRouter();
    const dispatch = useDispatch();

    useEffect(() => {
        if (authUser?.isVerified) {
            router.push("/");
        }
    }, [authUser]);

    const verifyAccount = async (event) => {
        event.preventDefault();

        setVerifying(true);
        setVerificationError("");

        try {
            await fetcher(`accounts/verification/?code=${code}`, "POST");

            dispatch(setAlert({ message: "your account has been verified" }));
            dispatch(updateAuthUser({ isVerified: true }));
        } catch (error) {
            setVerificationError(error.message);
        } finally {
            setVerifying(false);
        }
    };

    const requestCode = async () => {
        setRequesting(true);

        if (requesting) {
            return;
        }

        try {
            await fetcher("accounts/verification");

            dispatch(
                setAlert({
                    message: "verification code has been sent to your email",
                })
            );
        } catch (error) {
            setRequestError(error.message);
        } finally {
            setRequesting(false);
        }
    };

    return (
        <section>
            <Head>
                <title>Account verification</title>
            </Head>

            <PageHeader heading="Verify your account" hasBackArrow />

            <InfoBanner>
                <span className="font-semibold">
                    You cannot access any part of this application before your
                    account is verified.{" "}
                </span>
                Enter the code that you have received in the email associated
                with your account.{" "}
                <span className="font-semibold">
                    Check your spam folder too. Also note that the code expires
                    after 1 hour.
                </span>
            </InfoBanner>

            <form className="w-96" onSubmit={verifyAccount}>
                <InputGroup
                    label="verification code"
                    placeholder="8-digit code"
                    value={code}
                    error={verificationError}
                    onChange={setCode}
                />

                <Button laoding={verifying}>
                    {verifying ? "Verifying" : "Verify"} account
                </Button>
            </form>

            <div className="mt-5">
                <p className="mb-1 dark-light">
                    Do not have a code or the code is expired?
                </p>
                <Button
                    type="tertiary"
                    onClick={requestCode}
                    loading={requesting}
                >
                    {requesting ? "Requesting" : "Request"} Code
                </Button>
                <span className="error">
                    {capitalizeFirstLetter(requestError)}
                </span>
            </div>
        </section>
    );
};

export default AccountVerification;
