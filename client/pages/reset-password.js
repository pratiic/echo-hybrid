import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";

import { fetcher } from "../lib/fetcher";
import { setAlert } from "../redux/slices/alerts-slice";
import { updateAuthUser } from "../redux/slices/auth-slice";
import { closeModal, showLoadingModal } from "../redux/slices/modal-slice";

import Button from "../components/button";
import Form from "../components/form";
import InputGroup from "../components/input-group";

const ResetPassword = () => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [repeatedPassword, setRepeatedPassword] = useState("");
    const [resetting, setResetting] = useState(false);

    const dispatch = useDispatch();
    const router = useRouter();

    const displayError = (errorMsg) => {
        dispatch(setAlert({ message: errorMsg, type: "error" }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== repeatedPassword) {
            displayError("passwords do not match");
            return;
        }

        setResetting(true);

        try {
            dispatch(showLoadingModal("resetting your password..."));

            const data = await fetcher("users/password", "PATCH", {
                newPassword: repeatedPassword,
                currentPassword,
            });

            const newPassword = data.password;

            dispatch(updateAuthUser({ password: newPassword }));
            dispatch(setAlert({ message: "your password has been updated" }));
            router.back();
        } catch (error) {
            console.log(error);

            displayError(
                error.message === "password is incorrect"
                    ? "your current password is incorrect"
                    : error.message
            );
        } finally {
            setResetting(false);
            dispatch(closeModal());
        }
    };

    return (
        <Form
            heading="Reset your password"
            hasBackArrow
            onSubmit={handleFormSubmit}
        >
            <InputGroup
                label="current password"
                placeholder="current password"
                value={currentPassword}
                onChange={setCurrentPassword}
                type="password"
            />
            <InputGroup
                label="new password"
                placeholder="new valid password"
                value={newPassword}
                onChange={setNewPassword}
                type="password"
            />
            <InputGroup
                label="repeat new password"
                value={repeatedPassword}
                onChange={setRepeatedPassword}
                type="password"
            />
            <Button full loading={resetting}>
                {resetting ? "resetting" : "reset"} password
            </Button>
        </Form>
    );
};

export default ResetPassword;
