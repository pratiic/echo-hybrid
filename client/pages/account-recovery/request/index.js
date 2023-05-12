import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

import Form from "../../../components/form";
import InputGroup from "../../../components/input-group";
import CustomLink from "../../../components/custom-link";
import Button from "../../../components/button";
import InfoBanner from "../../../components/info-banner";
import { useDispatch, useSelector } from "react-redux";
import { fetcher } from "../../../lib/fetcher";

const Request = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [requesting, setRequesting] = useState(false);

  const { authUser } = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (authUser) {
      router.back();
    }
  }, [authUser]);

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    console.log(email);

    setRequesting(true);
    setError("");

    try {
      await fetcher("accounts/recovery", "POST", {
        email,
      });

      router.push("/account-recovery/verify");
    } catch (error) {
      setError(error.message);
    } finally {
      setRequesting(false);
    }
  };

  return (
    <section>
      <Form heading="Recover your account" onSubmit={handleFormSubmit}>
        <div className="mt-4">
          <InfoBanner>
            Once you provide the email associated with your account, you will
            receive an account recovery code in your inbox.
            <span className="font-semibold">
              The code will expire after 1 hour.
            </span>
          </InfoBanner>

          <InputGroup
            label="email"
            placeholder="enter your email"
            value={email}
            error={error}
            onChange={setEmail}
          />

          <CustomLink href="/account-recovery/verify" className="link-form">
            <span>Already have a code?</span>
          </CustomLink>

          <Button loading={requesting}>
            {requesting ? "Requesting" : "Request"} Code
          </Button>
        </div>
      </Form>
    </section>
  );
};

export default Request;
