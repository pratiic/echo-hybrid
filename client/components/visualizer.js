import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from "chart.js";
import { useSelector } from "react-redux";

import { getMonthlyTotals } from "../lib/history";
import { months } from "../lib/date-time";
import { capitalizeFirstLetter } from "../lib/strings";

import OptionsToggle from "./options-toggle";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export const options = {
    responsive: true,
    plugins: {
        legend: {
            position: "bottom",
        },
    },
    borderColor: "rgba(0, 0, 0, 0.5)",
};

const Visualizer = ({ dataItems, labels }) => {
    const [years, setYears] = useState([]);
    const [activeYear, setActiveYear] = useState(null);

    const { theme } = useSelector((state) => state.theme);

    useEffect(() => {
        if (years.length > 0) {
            setActiveYear(years[0].name);
        }
    }, [years]);

    useEffect(() => {
        const years = [];

        labels.forEach((label) => {
            const year = label.split(", ")[1];

            if (!years.find((yr) => yr.name === year)) {
                years.push({ name: year });
            }
        });

        // sort the years in a descending order
        for (let i = 0; i < years.length; i++) {
            for (let j = 0; j < years.length - i - 1; j++) {
                const currentYear = parseInt(years[j].name);
                const nextYear = parseInt(years[j + 1].name);

                if (currentYear < nextYear) {
                    const temp = years[j];
                    years[j] = years[j + 1];
                    years[j + 1] = temp;
                }
            }
        }

        setYears(years);
    }, [labels]);

    const data = {
        labels: months.map((month) => capitalizeFirstLetter(month)),
        datasets: [
            {
                label: "Transactions",
                data: getMonthlyTotals(dataItems, labels, activeYear),
                backgroundColor:
                    theme === "light" ? "rgba(28, 155, 239, 0.7)" : "#428AD2",
            },
        ],
    };

    return (
        <div className="max-w-[700px]">
            <div className="w-fit mb-5">
                <OptionsToggle
                    options={years}
                    active={activeYear}
                    type="dropdown"
                    onClick={(option) => setActiveYear(option)}
                />
            </div>

            <Bar options={options} data={data} />
        </div>
    );
};

export default Visualizer;
