import { useState } from "react";
import { useDispatch } from "react-redux";

import { closeModal } from "../redux/slices/modal-slice";

import InputGroup from "./input-group";
import Button from "./button";

const WarrantySetter = ({ onSet }) => {
    const [months, setMonths] = useState(0);

    const dispatch = useDispatch();

    const handleFormSubmit = (event) => {
        event.preventDefault();

        onSet(parseInt(months) || 0);
        dispatch(closeModal());
    };

    return (
        <form onSubmit={handleFormSubmit}>
            <h3 className="modal-title mb-3">Set custom warranty</h3>

            <div className="mb-5">
                <InputGroup
                    label="warranty in months"
                    placeholder="e.g. 48 for 2 years"
                    value={months}
                    view="number"
                    step={1}
                    min={0}
                    max={1200}
                    className="mb-0"
                    onChange={setMonths}
                />

                <span className="text-sm dark-light inline-block mt-1 ml-1">
                    e.g. 24 for 2 years
                </span>
            </div>

            <Button full>continue</Button>
        </form>
    );
};

export default WarrantySetter;
