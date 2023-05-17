import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Head from "next/head";
import { useRouter } from "next/router";

import { clearErrors, displayError } from "../lib/validation";
import { fetcher } from "../lib/fetcher";
import { setAuthUser } from "../redux/slices/auth-slice";

import Form from "../components/form";
import InputGroup from "../components/input-group";
import CustomLink from "../components/custom-link";
import Button from "../components/button";

const SignIn = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [signingIn, setSigningIn] = useState("");

    const { authUser } = useSelector((state) => state.auth);
    const router = useRouter();
    const dispatch = useDispatch();

    useEffect(() => {
        if (authUser) {
            router.push("/products");
        }
    }, [authUser]);

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        setSigningIn(true);
        clearErrors([setEmailError, setPasswordError]);

        try {
            const data = await fetcher("auth/signin", "POST", {
                email,
                password,
            });

            dispatch(setAuthUser(data.user));
        } catch (error) {
            displayError(
                error.message,
                ["email", "password"],
                [setEmailError, setPasswordError]
            );
        } finally {
            setSigningIn(false);
        }
    };

    return (
        <section>
            <Form
                heading="Sign in to Echo"
                subheading="Don't have an account?"
                subheadingLink="signup"
                hasBackArrow={false}
                onSubmit={handleFormSubmit}
            >
                <Head>
                    <title>Sign in to Echo</title>
                </Head>

                <InputGroup
                    label="email"
                    placeholder="email to your account"
                    value={email}
                    error={emailError}
                    onChange={setEmail}
                    showRequired={false}
                />

                <InputGroup
                    label="password"
                    placeholder="password to your account"
                    value={password}
                    error={passwordError}
                    type="password"
                    showRequired={false}
                    onChange={setPassword}
                />

                <CustomLink
                    href="/account-recovery/request"
                    className="link-form"
                >
                    <span>Forgot your password ?</span>
                </CustomLink>

                <Button loading={signingIn} full>
                    {signingIn ? "signing in" : "sign in"}
                </Button>
            </Form>
        </section>
    );
};

export default SignIn;
