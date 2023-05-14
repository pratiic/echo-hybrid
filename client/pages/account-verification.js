import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

import PageHeader from "../components/page-header";
import InfoBanner from "../components/info-banner";
import InputGroup from "../components/input-group";
import Button from "../components/button";
import { capitalizeFirstLetter } from "../lib/strings";
import { fetcher } from "../lib/fetcher";

const AccountVerification = () => {
  const [code, setCode] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requesting, setRequesting] = useState(false);

  const { authUser } = useSelector((state) => state.auth);

  const router = useRouter();

  useEffect(() => {
    if (authUser?.verified) {
      router.push("/products");
    }
  }, [authUser]);

  const verifyAccount = async (event) => {
    event.preventDefault();

    setVerifying(true);
    setVerificationError("");

    try {
      await fetcher(`accounts/verification/?code=${code}`, "POST");

      console.log("verified");
    } catch (error) {
      console.log(error.message);
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
      router.push("/products");
    } catch (error) {
      console.log(error);
      setRequestError(error.message);
    } finally {
      setRequesting(false);
    }
  };

  return (
    <section>
      <PageHeader heading="Verify your account" hasBackArrow />

      <InfoBanner>
        <span className="font-semibold">
          You cannot access any part of this application before your account is
          verified.{" "}
        </span>
        Enter the code that you have received in the email associated with your
        account.{" "}
        <span className="font-semibold">
          Check your spam folder too. Also note that the code expires after 1
          hour.
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
          {verifying ? "Verifying" : "Verify"} code
        </Button>
      </form>

      <div className="mt-5">
        <p className="mb-1 dark-light">
          Do not have a code or the code is expired?
        </p>
        <Button type="tertiary" onClick={requestCode} loading={requesting}>
          {requesting ? "Requesting" : "Request"} Code
        </Button>
        <span className="error">{capitalizeFirstLetter(requestError)}</span>
      </div>
    </section>
  );
};

export default AccountVerification;