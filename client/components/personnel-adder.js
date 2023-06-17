import { useState } from "react";
import { useDispatch } from "react-redux";

import { fetcher } from "../lib/fetcher";
import { addDeliveryPersonnel } from "../redux/slices/delivery-slice";
import { setAlert } from "../redux/slices/alerts-slice";
import { closeModal } from "../redux/slices/modal-slice";

import InputGroup from "./input-group";
import Button from "./button";

const PersonnelAdder = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [repeatedPassword, setRepeatedPassword] = useState("");
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState("");

    const dispatch = useDispatch();

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        if (password !== repeatedPassword) {
            return setError("passwords do not match");
        }

        setAdding(true);
        setError("");

        try {
            const data = await fetcher("delivery/personnel", "POST", {
                firstName,
                lastName,
                email,
                phone,
                password,
            });

            dispatch(addDeliveryPersonnel(data.user));
            dispatch(
                setAlert({ message: "delivery personnel has been added" })
            );
            dispatch(closeModal());
        } catch (error) {
            setError(error.message);
        } finally {
            setAdding(false);
        }
    };

    return (
        <form className="w-[300px] px-1 pb-1" onSubmit={handleFormSubmit}>
            <h3 className="modal-title mb-3">Add delivery personnel</h3>

            <InputGroup
                label="first name"
                placeholder="min 3 chars, max 15 chars"
                value={firstName}
                onChange={setFirstName}
            />

            <InputGroup
                label="last name"
                placeholder="min 3 chars, max 15 chars"
                value={lastName}
                onChange={setLastName}
            />

            <InputGroup label="email" value={email} onChange={setEmail} />

            <InputGroup
                placeholder="10-digit phone"
                label="phone"
                value={phone}
                onChange={setPhone}
            />

            <InputGroup
                label="password"
                placeholder="min 7 chars"
                value={password}
                type="password"
                onChange={setPassword}
            />

            <InputGroup
                label="repeat password"
                value={repeatedPassword}
                type="password"
                onChange={setRepeatedPassword}
            />

            {error && (
                <p className="bg-red-200 text-red-500 first-letter:capitalize px-2 py-1.5 rounded mb-4">
                    {error}
                </p>
            )}

            <Button disabled={adding}>
                {adding ? "adding" : "add"} personnel
            </Button>
        </form>
    );
};

export default PersonnelAdder;
