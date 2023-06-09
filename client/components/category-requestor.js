import { useState } from "react";
import { useDispatch } from "react-redux";

import { fetcher } from "../lib/fetcher";
import { closeModal } from "../redux/slices/modal-slice";
import { setAlert } from "../redux/slices/alerts-slice";

import InputGroup from "./input-group";
import Button from "./button";

const CategoryRequestor = () => {
    const [categoryName, setCategoryName] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [requesting, setRequesting] = useState(false);

    const dispatch = useDispatch();

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        setRequesting(true);
        setErrorMsg("");

        try {
            await fetcher(`categories/requests/?name=${categoryName}`, "POST");

            dispatch(closeModal());
            dispatch(setAlert({ message: "the category has been requested" }));
        } catch (error) {
            setErrorMsg(error.message);
        } finally {
            setRequesting(false);
        }
    };

    return (
        <form onSubmit={handleFormSubmit}>
            <h3 className="modal-title mb-2">Request new category</h3>

            <p className="dark-light max-w-[350px] mb-3">
                Once the admin accepts or rejects the category you request, you
                will receive a notification.
            </p>

            <InputGroup
                placeholder="Category name"
                className="mb-4"
                error={errorMsg}
                onChange={setCategoryName}
            />

            <Button loading={requesting}>
                {requesting ? "requesting" : "request"} category
            </Button>
        </form>
    );
};

export default CategoryRequestor;
