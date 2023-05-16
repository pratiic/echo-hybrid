import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import FileSelector from "./file-selector";
import Form from "./form";
import InputGroup from "./input-group";
import Button from "./button";
import CustomLink from "./custom-link";
import { fetcher } from "../lib/fetcher";
import { clearErrors, displayError } from "../lib/validation";
import { generateFormData } from "../lib/form-data";
import { updateAuthUser } from "../redux/slices/auth-slice";

const UserDetails = () => {
    const { authUser } = useSelector((state) => state.auth);
    const { selectedFiles } = useSelector((state) => state.files);

    const [firstName, setFirstName] = useState(authUser?.firstName);
    const [lastName, setLastName] = useState(authUser?.lastName);
    const [email, setEmail] = useState(authUser?.email);
    const [avatar, setAvatar] = useState(authUser?.avatar);
    const [firstnameError, setFirstnameError] = useState("");
    const [lastnameError, setLastnameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [avatarError, setAvatarError] = useState("");
    const [updating, setUpdating] = useState(false);

    const dispatch = useDispatch();

    useEffect(() => {
        if (selectedFiles.length > 0) {
            setAvatar(selectedFiles[0]);
        }
    }, [selectedFiles]);

    console.log(authUser);

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        console.log("update");

        setUpdating(true);
        clearErrors([setFirstnameError, setLastnameError, setEmailError]);
        setAvatarError("");

        try {
            const formData = generateFormData({ firstName, lastName, email });

            if (avatar) {
                formData.append("avatar", avatar);
            }

            const data = await fetcher("users", "PATCH", formData);
            const user = data.user;

            dispatch(
                updateAuthUser({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    avatar: user.avatar,
                })
            );
        } catch (error) {
            if (error.message.toLowerCase() === "file too large") {
                return setAvatarError(error.message);
            }

            displayError(
                error.message,
                ["first name", "last name", "email"],
                [setFirstnameError, setLastnameError, setEmailError]
            );
        } finally {
            setUpdating(false);
        }
    };

    const deleteUserAvatar = async () => {
        try {
            const data = await fetcher(`users/avatar`, "DELETE");
            dispatch(updateAuthUser({ avatar: data.avatar }));
        } catch (error) {
            console.log(error.message);
        }
        // dispatch(
        //   showConfirmationModal({
        //     message: "are you sure you want to delete your avatar ?",
        //     handler: async () => {
        //       dispatch(showLoadingModal("deleting your avatar..."));

        //       try {
        //         const data = await fetcher(`users/avatar`, "DELETE");
        //         dispatch(updateAuthUser({ avatar: data.avatar }));
        //         dispatch(
        //           setAlert({
        //             message: "your avatar has been deleted",
        //           })
        //         );
        //       } catch (error) {
        //         dispatch(setErrorAlert(error.message));
        //       } finally {
        //         dispatch(closeModal());
        //       }
        //     },
        //   })
        // );
    };

    return (
        <div className="flex flex-wrap justify-center mx-auto w-full">
            <div className="mr-5">
                <FileSelector
                    prevSrc={authUser?.avatar}
                    error={avatarError}
                    deletionHandler={
                        !authUser?.avatar?.includes("dicebear") &&
                        deleteUserAvatar
                    }
                />
            </div>

            <Form centered={false} onSubmit={handleFormSubmit}>
                <InputGroup
                    label="first name"
                    value={firstName}
                    error={firstnameError}
                    onChange={setFirstName}
                />

                <InputGroup
                    label="last name"
                    value={lastName}
                    error={lastnameError}
                    onChange={setLastName}
                />

                <InputGroup
                    label="email"
                    value={email}
                    error={emailError}
                    showRequired={false}
                    onChange={setEmail}
                    disabled
                />

                <CustomLink href="/reset-password" className="link-form">
                    <span>Reset Password</span>
                </CustomLink>

                <Button loading={updating} full>
                    {updating ? "updating" : "update"} details
                </Button>
            </Form>
        </div>
    );
};

export default UserDetails;
