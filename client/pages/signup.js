import React, { useEffect, useState } from "react";
import Form from "../components/form";
import Head from "next/head";
import InputGroup from "../components/input-group";
import Button from "../components/button";
import { fetcher } from "../lib/fetcher";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "../redux/slices/auth-slice";
import { displayError } from "../lib/validation";
import { clearErrors } from "../lib/validation";
import { useRouter } from "next/router";
import Header from "../components/header";

const SignUp = () => {
  const [firstName, setfirstName] = useState("");
  const [firstnameError, setfirstnameError] = useState("");
  const [lastName, setlastName] = useState("");
  const [lastnameError, setlastnameError] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [repeatedPassword, setrepeatedPassword] = useState("");
  const [repeatedPasswordError, setRepeatedPasswordError] = useState("");
  const [signingUp, setSigningUp] = useState(false);
  const { authUser } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (authUser) {
      router.push("signin");
    }
  }, [authUser]);

  const handleFormSubmit = async (event) => {
    setSigningUp(true);
    clearErrors([
      setfirstnameError,
      setlastnameError,
      setEmailError,
      setPasswordError,
    ]);

    if (password !== repeatedPassword) {
      const error = "passwords so not match";

      setPasswordError(error);
      setRepeatedPasswordError(error);

      return setSigningUp(false);
    }

    try {
      const data = await fetcher("auth/signup", "POST", {
        firstName,
        lastName,
        email,
        password,
      });

      dispatch(setAuthUser(data.user));
    } catch (error) {
      displayError(
        error.message,
        ["firstName", "lastName", "email", "password"],
        [setfirstnameError, setlastnameError, setEmailError, setPasswordError]
      );
      console.log(error);
    } finally {
      setSigningUp(false);
    }
  };

  return (
    <section>
      <Form
        heading="Create your account"
        subheading="Already have an account?"
        subheadingLink="signin"
        hasBackArrow={false}
        onSubmit={handleFormSubmit}
      >
        <Head>
          <title>Create your account</title>
        </Head>

        <InputGroup
          label="first name"
          placeholder="min 3 chars, max 25"
          value={firstName}
          error={firstnameError}
          onChange={setfirstName}
        />

        <InputGroup
          label="last name"
          placeholder="min 3 chars, max 25 chars"
          value={lastName}
          error={lastnameError}
          onChange={setlastName}
        />

        <InputGroup
          label="email"
          placeholder="a valid email"
          value={email}
          error={emailError}
          onChange={setEmail}
        />

        <InputGroup
          label="password"
          placeholder="min 7 chars"
          value={password}
          error={passwordError}
          type="password"
          onChange={setPassword}
        />

        <InputGroup
          label="repeat password"
          value={repeatedPassword}
          error={repeatedPasswordError}
          type="password"
          onChange={setrepeatedPassword}
        />

        <Button loading={signingUp} full>
          {signingUp ? "signing up" : "sign up"}
        </Button>
      </Form>
    </section>
  );
};

export default SignUp;
