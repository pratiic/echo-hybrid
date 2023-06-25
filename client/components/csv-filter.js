import React, { useState } from "react";

import OptionsToggle from "./options-toggle";
import Button from "./button";

const CsvFilter = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeMonth, setActiveMonth] = useState("january");

  const filterOptions = [
    {
      name: "all",
    },
    {
      name: "year",
    },
    {
      name: "month",
    },
  ];
  const monthOptions = [
    {
      name: "january",
    },
    {
      name: "february",
    },
    {
      name: "march",
    },
    {
      name: "april",
    },
    {
      name: "may",
    },
    {
      name: "june",
    },
    {
      name: "july",
    },
    {
      name: "august",
    },
    {
      name: "september",
    },
    {
      name: "october",
    },
    {
      name: "november",
    },
    {
      name: "december",
    },
  ];

  const handleButtonClick = () => {
    console.log(activeFilter, activeMonth);
  };

  return (
    <div className="space-y-3 px-3">
      <h3>Select date</h3>
      <div className="flex space-x-5">
        <OptionsToggle
          options={filterOptions}
          active={activeFilter}
          type="dropdown"
          onClick={(filter) => setActiveFilter(filter)}
        />
        {activeFilter === "month" && (
          <OptionsToggle
            options={monthOptions}
            active={activeMonth}
            type="dropdown"
            onClick={(month) => setActiveMonth(month)}
          />
        )}
        {/* {activeFilter === "year" && (
          <OptionsToggle
            options={yearOptions}
            active={activeYear}
            type="dropdown"
            onClick={(year) => setActiveMonth(year)}
          />
        )} */}
      </div>

      <div className="pt-3">
        <Button full onClick={handleButtonClick}>
          Confirm
        </Button>
      </div>
    </div>
  );
};

export default CsvFilter;
