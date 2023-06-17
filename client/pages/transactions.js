import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Head from "next/head";
import { useRouter } from "next/router";

import { capitalizeFirstLetter } from "../lib/strings";

import PageHeader from "../components/page-header";
import OptionsToggle from "../components/options-toggle";
import TransactionsList from "../components/transactions-list";
import TransactionsFilter from "../components/transactions-filter";

const Transactions = () => {
    const [options, setOptions] = useState([
        { name: "purchase history" },
        { name: "sales history" },
    ]);
    const [activeOption, setActiveOption] = useState("purchase history");
    const [dateLabels, setDateLabels] = useState([]);
    const [displayOption, setDisplayOption] = useState("");

    const { userTransactions, sellerTransactions } = useSelector(
        (state) => state.transactions
    );

    const router = useRouter();

    useEffect(() => {
        if (router.query?.show) {
            const urlMap = {
                user: "purchase history",
                seller: "sales history",
            };

            setActiveOption(urlMap[router.query.show]);
        } else {
            router.push(`/transactions/?show=user`);
        }
    }, [router]);

    const handleActiveOption = (option) => {
        const urlMap = {
            "purchase history": "user",
            "sales history": "seller",
        };

        router.push(`/transactions/?show=${urlMap[option]}`);
    };

    const getOptionMessage = (shortMsg) => {
        if (shortMsg) {
            return activeOption === "purchase history" ? "Purchase" : "Sales";
        }

        return activeOption === "purchase history"
            ? "purchase history"
            : "sales history";
    };

    return (
        <section>
            <Head>
                <title>{capitalizeFirstLetter(getOptionMessage())}</title>
            </Head>

            <PageHeader heading={getOptionMessage(false)} hasBackArrow>
                <TransactionsFilter
                    transactionType={
                        activeOption === "purchase history" ? "user" : "seller"
                    }
                    setDateLabels={setDateLabels}
                    setDisplayOption={setDisplayOption}
                />
            </PageHeader>

            <div className="mb-7 -mt-2">
                <OptionsToggle
                    options={options}
                    active={activeOption}
                    rounded={false}
                    onClick={handleActiveOption}
                />
            </div>

            <TransactionsList
                dateLabels={dateLabels}
                displayOption={displayOption}
                transactionType={
                    activeOption === "purchase history" ? "user" : "seller"
                }
            />
        </section>
    );
};

export default Transactions;
