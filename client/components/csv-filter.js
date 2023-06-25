import React, { useState } from "react";

import OptionsToggle from "./options-toggle";
import Button from "./button";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { closeModal } from "../redux/slices/modal-slice";
import { fetcher } from "../lib/fetcher";

const CsvFilter = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeMonth, setActiveMonth] = useState("january");
  const [activeYear, setActiveYear] = useState("2023");

  //   const { authUser } = useSelector((state) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch();

  const filterOptions = [
    {
      name: "all",
    },
    {
      name: "month",
    },
    {
      name: "year",
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
  const yearOptions = [
    {
      name: "2023",
    },
  ];

  const headingStyles = "mb-2 text-xl font-semibold black-white";

  const userType = router.query.show === "user" ? "user" : "seller";

  const handleButtonClick = async () => {
    try {
      const data = await fetcher(
        `transactions/csv/?type=${userType}&displayType=${activeFilter}&year=${activeYear}&month=${activeMonth}`
      );

      console.log(data);
    } catch (error) {
      console.log(error.message);
    } finally {
      dispatch(closeModal());
    }
  };

  return (
    <div className="space-y-3 px-3">
      <h2 className={headingStyles}>Download Type</h2>
      <OptionsToggle
        options={filterOptions}
        active={activeFilter}
        type="dropdown"
        dropdownHasShadow={false}
        onClick={(filter) => setActiveFilter(filter)}
      />

      {activeFilter === "month" && (
        <div className="flex space-x-5">
          <div>
            <h2>Month</h2>
            <OptionsToggle
              options={monthOptions}
              active={activeMonth}
              type="dropdown"
              dropdownHasShadow={false}
              onClick={(month) => setActiveMonth(month)}
            />
          </div>
          <div>
            <h2>Year</h2>
            <OptionsToggle
              options={yearOptions}
              active={activeYear}
              type="dropdown"
              dropdownHasShadow={false}
              onClick={(year) => setActiveYear(year)}
            />
          </div>
        </div>
      )}

      {activeFilter === "year" && (
        <div>
          <h2>Year</h2>
          <OptionsToggle
            options={yearOptions}
            active={activeYear}
            type="dropdown"
            dropdownHasShadow={false}
            onClick={(year) => setActiveYear(year)}
          />
        </div>
      )}

      <div>
        <p className="status">
          {activeFilter === "all"
            ? "download all transaction history"
            : activeFilter === "month"
            ? `download transactions of ${activeMonth} from year ${activeYear}`
            : `download transactions of year ${activeYear}`}
        </p>
        <Button full onClick={handleButtonClick}>
          Download
        </Button>
      </div>
    </div>
  );
};

export default CsvFilter;
