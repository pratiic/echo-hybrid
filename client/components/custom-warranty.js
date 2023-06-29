import React, { useState } from "react";

import Button from "./button";
import InputGroup from "./input-group";

const CustomWarranty = ({ onSubmit }) => {
    const [customWarranty, setCustomWarranty] = useState("0");

    const handleFormSubmit = (event) => {
        event.preventDefault();

        if (customWarranty % 12 === 0) {
            onSubmit(customWarranty / 12 + "years");
        } else {
            onSubmit(customWarranty + " months");
        }
    };

    return (
        <form onSubmit={handleFormSubmit}>
            <h3 className="modal-title mb-3">Set custom warranty</h3>

            <div className="mb-5">
                <InputGroup
                    label="Warranty In Months"
                    view="number"
                    value={customWarranty}
                    min={0}
                    step={1}
                    className="mb-0"
                    onChange={setCustomWarranty}
                />

                <span className="dark-light text-sm inline-block mt-1 ml-1">
                    e.g 24 for 2 years
                </span>
            </div>

            <Button full onClick={handleFormSubmit}>
                Continue
            </Button>
        </form>
    );
};

export default CustomWarranty;
