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

const TransactionsList = ({ dateLabels, displayOption }) => {
    const [transactionType, setTransactionType] = useState("");
    const [displayPeriod, setDisplayPeriod] = useState("all");
    const [query, setQuery] = useState("");

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
        if (router.query?.show) {
            setTransactionType(router.query.show);
        }
    }, [router.query]);

    useEffect(() => {
        if (transactionType === "user") {
            if (areUnknowledgedTransactions(userTransactions)) {
                acknowledgeTransactions();
            }
        }

        if (transactionType === "seller") {
            if (areUnknowledgedTransactions(sellerTransactions)) {
                acknowledgeTransactions();
            }
        }
    }, [transactionType, userTransactions, sellerTransactions, authUser]);

    useEffect(() => {
        if (transactionType === "user") {
            setDisplayPeriod(userDisplayPeriod);
        } else {
            setDisplayPeriod(sellerDisplayPeriod);
        }
    }, [userDisplayPeriod, sellerDisplayPeriod, transactionType]);

    useEffect(() => {
        setQuery(transactionType === "user" ? userQuery : sellerQuery);
    }, [userQuery, sellerQuery]);

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
        if (query) {
            return (
                <p className="history-message">
                    <span className="font-semibold">
                        {totalCount[transactionType]}
                    </span>
                    {singularOrPlural(
                        transactionType === "user"
                            ? userTransactions
                            : sellerTransactions
                    )}{" "}
                    found
                </p>
            );
        }

        if (
            (transactionType === "user" && userTransactions.length === 0) ||
            (transactionType === "seller" && sellerTransactions.length === 0)
        ) {
            setTimeout(() => {
                console.log("pratiic");
            }, 1000);
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

    const renderGenericSearch = () => {
        if (
            (transactionType === "user" &&
                userTransactions.length === 0 &&
                !userQuery) ||
            (transactionType === "seller" &&
                sellerTransactions.length === 0 &&
                !sellerQuery)
        ) {
            setTimeout(() => {
                console.log("pratiic");
            }, 1000);
            return null;
        }

        return (
            <GenericSearch
                show="true"
                placeholder={"product name"}
                onSubmit={(query) =>
                    dispatch(setQueryRedux({ type: transactionType, query }))
                }
                clearSearch={dispatch(
                    setQueryRedux({ type: transactionType, query: "" })
                )}
            />
        );
    };

    const getTotalAmount = (transactions) => {
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
        return;

        try {
            await fetcher(`transactions/?type=${transactionType}`, "PATCH");
            dispatch(
                acknowledgeTransactionsRedux({
                    type: transactionType,
                })
            );
        } catch (error) {}
    };

    const areUnknowledgedTransactions = (transactions) => {
        return transactions.find(
            (transaction) =>
                transaction.completedBy !== authUser?.id &&
                !transaction.acknowledge
        );
    };

    return (
        <div
            className={`-mt-4 ${((transactionType === "user" &&
                userTransactions.length > 0) ||
                (transactionType === "seller" &&
                    sellerTransactions.length > 0)) &&
                !query &&
                "750:w-fit"}`}
        >
            {getTransactionMessage()}

            <div className="flex flex-col 750:flex-row mb-4">
                {renderGenericSearch()}
                {getTotalAmount(
                    transactionType === "user"
                        ? userTransactions
                        : sellerTransactions
                )}
            </div>

            <ContentList
                list={
                    transactionType === "user"
                        ? userTransactions
                        : sellerTransactions
                }
                type="transaction"
                loadingMsg={
                    loading[transactionType] && "loading transactions..."
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
