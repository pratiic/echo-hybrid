import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { setDisplayPeriod as setDisplayPeriodRedux } from "../redux/slices/transactions-slice";
import { numberToMonthMapFull } from "../lib/date-time";

import OptionsToggle from "./options-toggle";

const TransactionsFilter = ({
    transactionType,
    setDateLabels,
    setDisplayOption,
}) => {
    const [options, setOptions] = useState([]);
    const [activeOption, setActiveOption] = useState("all");
    const [startDate, setStartDate] = useState(null);
    const [displayPeriod, setDisplayPeriod] = useState("all");

    const { authUser } = useSelector((state) => state.auth);
    const { userDisplayPeriod, sellerDisplayPeriod } = useSelector(
        (state) => state.transactions
    );

    const dispatch = useDispatch();

    useEffect(() => {
        setDisplayPeriod(
            transactionType === "user" ? userDisplayPeriod : sellerDisplayPeriod
        );
    }, [userDisplayPeriod, sellerDisplayPeriod, transactionType]);

    useEffect(() => {
        setActiveOption(displayPeriod);
        setDisplayOption(displayPeriod);
    }, [displayPeriod]);

    useEffect(() => {
        if (transactionType === "user") {
            setStartDate(authUser?.createdAt);
        } else {
            setStartDate(authUser?.store?.createdAt);
        }
    }, [authUser, transactionType]);

    useEffect(() => {
        if (startDate) {
            const periods = ["all"];
            const date = new Date(startDate);
            const startYear = date.getFullYear();
            const startMonth = date.getMonth();
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth();
            let i = startYear;

            while (i <= currentYear) {
                let j,
                    period = "",
                    endMonth;

                if (i === startYear) {
                    j = startMonth;
                } else {
                    j = 0;
                }

                if (i === currentYear) {
                    endMonth = currentMonth;
                } else {
                    endMonth = 11;
                }

                while (j <= endMonth) {
                    period = `${numberToMonthMapFull[j]}, ${i}`;
                    periods.push(period);
                    j += 1;
                }

                i += 1;
            }

            const options = periods.map((period) => {
                return { name: period };
            });
            setOptions(options);
            setDateLabels(
                options.slice(1).map((option) => {
                    return option.name;
                })
            );
        }
    }, [startDate]);

    const handleOptionSelect = (option) => {
        dispatch(
            setDisplayPeriodRedux({ type: transactionType, period: option })
        );
    };

    return (
        <OptionsToggle
            options={options}
            active={activeOption}
            onClick={handleOptionSelect}
            type="dropdown"
        />
    );
};

export default TransactionsFilter;
