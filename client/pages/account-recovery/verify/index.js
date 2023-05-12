import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

import Form from "../../../components/form";
import InfoBanner from "../../../components/info-banner";
import InputGroup from "../../../components/input-group";
import Button from "../../../components/button";
import CustomLink from "../../../components/custom-link";
import { displayError, clearErrors } from "../../../lib/validation";
import { fetcher } from "../../../lib/fetcher";

const Verify = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [repeatedPassword, setRepeatedPassword] = useState("");
  const [repeatedPasswordError, setRepeatedPasswordError] = useState("");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [resetting, setResetting] = useState(false);

  const { authUser } = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (authUser) {
      router.back();
    }
  }, [authUser]);

  const handleFormSubmit = async () => {
    setResetting(true);

    clearErrors([
      setEmailError,
      setPasswordError,
      setRepeatedPasswordError,
      setCodeError,
    ]);

    if (password !== repeatedPassword) {
      const msg = "Passwords do not match";
      setPasswordError(msg);
      setRepeatedPasswordError(msg);

      setResetting(false);
      return;
    }

    try {
      await fetcher("accounts/recovery", "PATCH", {
        email,
        password,
        code,
      });

      router.push("/signin");
    } catch (error) {
      console.log(error.message);

      if (
        error.message === "you need to request for an account recovery first"
      ) {
        router.push("/account-recovery/request");
        return;
      }

      displayError(
        error.message,
        ["email", "password", "code"],
        [setEmailError, setPasswordError, setCodeError]
      );
    } finally {
      setResetting(false);
    }
  };

  return (
    <section>
      <Form heading="Recover your account" onSubmit={handleFormSubmit}>
        <div className="mt-4">
          <InfoBanner>
            Check your inbox for the verification code to reset your password.
            Make sure to check the{" "}
            <span className="font-semibold">spam folder</span> as well.
          </InfoBanner>

          <InputGroup
            label="email"
            placeholder="email of your account"
            value={email}
            error={emailError}
            onChange={setEmail}
          />

          <InputGroup
            label="new password"
            placeholder="valid new password"
            value={password}
            error={passwordError}
            type="password"
            onChange={setPassword}
          />

          <InputGroup
            label="confirm new password"
            placeholder="repeat new password"
            value={repeatedPassword}
            error={repeatedPasswordError}
            type="password"
            onChange={setRepeatedPassword}
          />

          <InputGroup
            label="verification code"
            placeholder="8-digit code"
            value={code}
            error={codeError}
            onChange={setCode}
          />

          <CustomLink href="/account-recovery/request" className="link-form">
            <span>Do not have a code or the code is expired?</span>
          </CustomLink>

          <Button loading={resetting}>
            {resetting ? "Resetting" : "Reset"} Password
          </Button>
        </div>
      </Form>
    </section>
  );
};

export default Verify;
