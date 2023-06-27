import React, { useState } from "react";

import Button from "./button";
import InputGroup from "./input-group";
// import { useDispatch } from "react-redux";

const CustomWarranty = ({ onSubmit }) => {
  const [customWarranty, setCustomWarranty] = useState("0");
  const [customWarrantyError, setCustomWarrantyError] = useState("");

  const handleButtonClick = () => {
    setCustomWarrantyError("");

    if (customWarranty <= 0) {
      setCustomWarrantyError("please enter a valid number i.e greater than 0");
    } else {
      if (customWarranty % 12 === 0) {
        onSubmit(customWarranty / 12 + "years");
      } else {
        onSubmit(customWarranty + " months");
      }
    }
  };

  return (
    <div className="px-3">
      <h3 className="mb-2 text-xl font-semibold black-white">
        Set custom warranty
      </h3>
      <InputGroup
        label="Warranty In Months"
        view="number"
        value={customWarranty}
        min={0}
        max={15}
        onChange={setCustomWarranty}
      />
      <p className="error -mt-3">{customWarrantyError}</p>
      <p className="dark-light max-w-sm  mb-1">e.g 24 for 2 years</p>
      <Button full onClick={handleButtonClick}>
        Continue
      </Button>
    </div>
  );
};

export default CustomWarranty;
