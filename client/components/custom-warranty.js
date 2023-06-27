import React, { useState } from "react";
import Button from "./button";
import InputGroup from "./input-group";

const CustomWarranty = ({}) => {
  const [customWarranty, setCustomWarranty] = useState("0");

  const handleButtonClick = (event) => {
    console.log("click");
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
        onChange={setCustomWarranty}
        min={0}
      />
      <p className="dark-light max-w-sm -mt-3 mb-1">e.g 24 for 2 years</p>
      <Button full onClick={handleButtonClick}>
        Continue
      </Button>
    </div>
  );
};

export default CustomWarranty;
