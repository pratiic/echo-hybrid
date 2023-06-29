import { useState } from "react";
import { useDispatch } from "react-redux";

import { fetcher } from "../lib/fetcher";
import { closeModal } from "../redux/slices/modal-slice";
import { setAlert } from "../redux/slices/alerts-slice";
import { deleteCategoryRequest } from "../redux/slices/categories-slice";

import InputGroup from "./input-group";
import Button from "./button";

const CategoryAdder = () => {
    const [categoryName, setCategoryName] = useState("");
    const [error, setError] = useState("");
    const [adding, setAdding] = useState(false);

    const dispatch = useDispatch();

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        setAdding(true);

        try {
            await fetcher("categories", "POST", {
                categories: [
                    {
                        name: categoryName,
                    },
                ],
            });

            dispatch(setAlert({ message: "the category has been added" }));
            // delete a category request if it has the same name as the one that got added
            dispatch(deleteCategoryRequest(categoryName));
            dispatch(closeModal());
        } catch (error) {
            if (error.message.includes("categories[0].name cannot be empty")) {
                return setError("category name cannot be empty");
            }

            if (
                error.message.includes(
                    "one or more of the provided categories already exist"
                )
            ) {
                return setError("this category already exists");
            }

            setError(error.message);
        } finally {
            setAdding(false);
        }
    };

    return (
        <form className="w-[300px]" onSubmit={handleFormSubmit}>
            <h3 className="modal-title mb-2">Add a category</h3>

            <InputGroup
                label="category name"
                value={categoryName}
                error={error}
                className="mb-5"
                onChange={setCategoryName}
            />

            <Button loading={adding}>Continue</Button>
        </form>
    );
};

export default CategoryAdder;
