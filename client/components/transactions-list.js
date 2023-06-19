import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { fetcher } from "../lib/fetcher";

import {
    singularOrPlural,
    capitalizeFirstLetter,
    addCommas,
} from "../lib/strings";
import { getSubtotal } from "../lib/order";
import {
    setQuery as setQueryRedux,
    acknowledgeTransactions as acknowledgeTransactionsRedux,
    setPage,
} from "../redux/slices/transactions-slice";

import ContentList from "./content-list";
import GenericSearch from "./generic-search";
import Visualizer from "./visualizer";

const TransactionsList = ({ dateLabels, displayOption, transactionType }) => {
    const [displayPeriod, setDisplayPeriod] = useState("all");

    const {
        userTransactions,
        sellerTransactions,
        loading,
        loadingMore,
        error,
        userDisplayPeriod,
        sellerDisplayPeriod,
        userQuery,
        sellerQuery,
        userPage,
        sellerPage,
        noMoreData,
        totalCount,
        addedTransactionsCount,
        PAGE_SIZE,
    } = useSelector((state) => state.transactions);
    const { authUser } = useSelector((state) => state.auth);

    const dispatch = useDispatch();
    const router = useRouter();

    useEffect(() => {
        if (
            transactionType === "seller" &&
            areUnknowledgedTransactions(sellerTransactions)
        ) {
            acknowledgeTransactions();
        }
    }, [transactionType, sellerTransactions]);

    useEffect(() => {
        if (transactionType === "user") {
            setDisplayPeriod(userDisplayPeriod);
        } else {
            setDisplayPeriod(sellerDisplayPeriod);
        }
    }, [userDisplayPeriod, sellerDisplayPeriod, transactionType]);

    const incrementPageNumber = (transactionType) => {
        dispatch(
            setPage({
                page:
                    transactionType === "user" ? userPage + 1 : sellerPage + 1,
                type: transactionType,
            })
        );
    };

    const getPageNumberIncrementer = (transactionType) => {
        if (transactionType === "user") {
            if (
                userTransactions.length >= PAGE_SIZE[transactionType] &&
                !noMoreData["user"]
            ) {
                return () => {
                    incrementPageNumber("user");
                };
            }
        } else {
            if (
                sellerTransactions.length >= PAGE_SIZE[transactionType] &&
                !noMoreData["seller"]
            ) {
                return () => {
                    incrementPageNumber("seller");
                };
            }
        }
    };

    const getTransactionMessage = () => {
        const query = transactionType === "user" ? userQuery : sellerQuery;

        if (query) {
            return (
                <p className="history-message">
                    <span className="font-semibold">
                        {totalCount[transactionType]}
                    </span>{" "}
                    {singularOrPlural(
                        transactionType === "user"
                            ? userTransactions
                            : sellerTransactions,
                        "transaction",
                        "transactions"
                    )}{" "}
                    found
                </p>
            );
        }

        if (
            (transactionType === "user" && userTransactions.length === 0) ||
            (transactionType === "seller" && sellerTransactions.length === 0)
        ) {
            return null;
        }

        return (
            <p className="history-message">
                You {displayPeriod === "all" && "have"}{" "}
                {transactionType === "user" ? "purchased" : "sold"}{" "}
                <span className="font-semibold">
                    {totalCount[transactionType] +
                        addedTransactionsCount[transactionType]}
                </span>{" "}
                {singularOrPlural(
                    transactionType === "user"
                        ? userTransactions
                        : sellerTransactions,
                    "product",
                    "products"
                )}
                {displayPeriod !== "all" && (
                    <React.Fragment>
                        in
                        <span className="font-semibold">
                            {capitalizeFirstLetter(displayPeriod)}
                        </span>
                    </React.Fragment>
                )}
            </p>
        );
    };

    const renderGenericSearch = (searchValue) => {
        if (
            (transactionType === "user" &&
                userTransactions.length === 0 &&
                !userQuery) ||
            (transactionType === "seller" &&
                sellerTransactions.length === 0 &&
                !sellerQuery)
        ) {
            return null;
        }

        return (
            <GenericSearch
                show="true"
                placeholder={"Product name..."}
                value={searchValue}
                onSubmit={(query) =>
                    dispatch(setQueryRedux({ type: transactionType, query }))
                }
                clearSearch={() =>
                    dispatch(
                        setQueryRedux({ type: transactionType, query: "" })
                    )
                }
            />
        );
    };

    const getTotalAmount = (transactions) => {
        const query = transactionType === "user" ? userQuery : sellerQuery;

        if (transactions.length === 0 || query) {
            return;
        }

        let totalAmount = 0;

        transactions.forEach((transaction) => {
            const { deliveryCharge, unitPrice, quantity } = transaction.order;
            totalAmount += getSubtotal(
                unitPrice,
                quantity,
                deliveryCharge,
                false
            );
        });

        return (
            <div className="w-fit mt-3 ml-3 750:mt-0 750:ml-auto">
                <span className="dark-light">Total Amount</span>
                <h4 className="text-xl text-blue-three font-semibold">
                    Rs. {addCommas(totalAmount.toFixed(2))}
                </h4>
            </div>
        );
    };

    const acknowledgeTransactions = async () => {
        try {
            await fetcher(`transactions/?type=${transactionType}`, "PATCH");

            dispatch(
                acknowledgeTransactionsRedux({
                    type: transactionType,
                })
            );
        } catch (error) {
            console.log(error);
        }
    };

    const areUnknowledgedTransactions = (transactions) => {
        return transactions.find((transaction) => !transaction.isAcknowledged);
    };

    const renderChart = () => {
        if (
            userQuery ||
            sellerQuery ||
            displayOption !== "all" ||
            (transactionType === "user" && userTransactions.length === 0) ||
            (transactionType === "seller" && sellerTransactions.length === 0)
        ) {
            return;
        }

        return (
            <div className="pb-5">
                <Visualizer
                    dataItems={
                        transactionType === "user"
                            ? userTransactions
                            : sellerTransactions
                    }
                    labels={dateLabels}
                />
            </div>
        );
    };

    return (
        <div
            className={`-mt-4 ${((transactionType === "user" &&
                userTransactions.length > 0) ||
                (transactionType === "seller" &&
                    sellerTransactions.length > 0)) &&
                !userQuery &&
                !sellerQuery &&
                "750:w-fit"}`}
        >
            {getTransactionMessage()}

            <div className="flex flex-col 750:flex-row mb-4">
                {renderGenericSearch(
                    transactionType === "user" ? userQuery : sellerQuery
                )}

                {getTotalAmount(
                    transactionType === "user"
                        ? userTransactions
                        : sellerTransactions
                )}
            </div>

            {renderChart()}

            <ContentList
                list={
                    transactionType === "user"
                        ? userTransactions
                        : sellerTransactions
                }
                type="transaction"
                loadingMsg={
                    loading[transactionType] && `loading transactions...`
                }
                error={error[transactionType]}
                emptyMsg="No transactions found"
                human="no-history-girl"
                loadingMore={loadingMore[transactionType]}
                incrementPageNumber={getPageNumberIncrementer(transactionType)}
            />
        </div>
    );
};

export default TransactionsList;
