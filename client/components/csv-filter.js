import React, { useState } from "react";

import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { closeModal } from "../redux/slices/modal-slice";
import { fetcher } from "../lib/fetcher";
import { setAlert, setErrorAlert } from "../redux/slices/alerts-slice";
import { capitalizeFirstLetter } from "../lib/strings";
import { monthToNumberMap, numberToMonthMapFull } from "../lib/date-time";

import OptionsToggle from "./options-toggle";
import Button from "./button";

const CsvFilter = () => {
    const [activeFilter, setActiveFilter] = useState("month");
    const [activeMonth, setActiveMonth] = useState(
        numberToMonthMapFull[new Date().getMonth()]
    );
    const [activeYear, setActiveYear] = useState("2023");
    const [downloading, setDownloading] = useState(false);

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

    const transactionType = router.query.show === "user" ? "user" : "seller";

    const handleButtonClick = async () => {
        setDownloading(true);
        try {
            const data = await fetcher(
                `transactions/csv/?type=${transactionType}&display=${activeFilter}&year=${activeYear}&month=${monthToNumberMap[activeMonth]}`,
                "GET",
                {},
                "blob"
            );

            const fileName = `${
                transactionType === "user" ? "purchase" : "sales"
            }-history-${
                activeFilter === "all"
                    ? "all"
                    : activeFilter === "year"
                    ? activeYear
                    : `${activeMonth}-${activeYear}`
            }.csv`;

            const blob = new Blob([data], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            dispatch(closeModal());
        } catch (error) {
            if (error.statusCode === 400) {
                return dispatch(
                    setAlert({
                        type: "info",
                        message:
                            "there are no transactions to generate csv for",
                    })
                );
            }

            dispatch(setErrorAlert(error.message));
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="space-y-3 w-[300px]">
            <h2 className="modal-title">Download options</h2>

            <div className="w-fit">
                <OptionsToggle
                    options={filterOptions}
                    active={activeFilter}
                    type="dropdown"
                    dropdownHasShadow={false}
                    forModal
                    onClick={(filter) => setActiveFilter(filter)}
                />
            </div>

            {activeFilter !== "all" && (
                <div className="flex space-x-5">
                    {activeFilter === "month" && (
                        <div>
                            <span className="options-toggle-label">Month</span>
                            <OptionsToggle
                                options={monthOptions}
                                active={activeMonth}
                                type="dropdown"
                                dropdownHasShadow={false}
                                forModal
                                onClick={(month) => setActiveMonth(month)}
                            />
                        </div>
                    )}

                    <div>
                        <h2 className="options-toggle-label">Year</h2>
                        <OptionsToggle
                            options={yearOptions}
                            active={activeYear}
                            type="dropdown"
                            dropdownHasShadow={false}
                            forModal
                            onClick={(year) => setActiveYear(year)}
                        />
                    </div>
                </div>
            )}

            <div className="pt-1">
                <p className="status-smaller text-sm text-left mb-2">
                    {activeFilter === "all"
                        ? "download all transaction history"
                        : activeFilter === "month"
                        ? `download transactions from ${capitalizeFirstLetter(
                              activeMonth
                          )} of year ${activeYear}`
                        : `download transactions from year ${activeYear}`}
                </p>

                <Button full onClick={handleButtonClick} loading={downloading}>
                    {downloading ? "Downloading" : "Download"}
                </Button>
            </div>
        </div>
    );
};

export default CsvFilter;
