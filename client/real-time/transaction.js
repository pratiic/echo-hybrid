import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import useSocket from "../hooks/use-socket";
import {
    addTransaction,
    resetPageSize,
    setError,
    setLoading,
    setLoadingMore,
    setNoMoreData,
    setPage,
    setTotalCount,
    setTransactions,
    setNeedToFetch,
} from "../redux/slices/transactions-slice";
import { deleteOrder } from "../redux/slices/orders-slice";
import { monthToNumberMap } from "../lib/date-time";
import { fetcher } from "../lib/fetcher";

const Transaction = () => {
    const { authUser } = useSelector((state) => state.auth);
    const {
        userTransactions,
        sellerTransactions,
        needToFetch,
        userPage,
        sellerPage,
        userQuery,
        sellerQuery,
        userDisplayPeriod,
        sellerDisplayPeriod,
        loading,
        loadingMore,
        addedTransactionsCount,
        PAGE_SIZE,
    } = useSelector((state) => state.transactions);

    const socket = useSocket();
    const dispatch = useDispatch();

    useEffect(() => {
        socket.on("new-transaction", (transaction) => {
            const {
                order: {
                    id,
                    originId,
                    store: {
                        user: { id: ownerId },
                    },
                },
            } = transaction;
            const userTransaction = authUser?.id === originId;
            const sellerTransaction = authUser?.id === ownerId;

            if (userTransaction || sellerTransaction) {
                dispatch(
                    addTransaction({
                        transaction,
                        type: userTransaction ? "user" : "seller",
                    })
                );

                dispatch(
                    deleteOrder({
                        type: userTransaction ? "user" : "seller",
                        id,
                    })
                );
            }
        });
    }, [authUser]);

    useEffect(() => {
        dispatch(setNeedToFetch({ needToFetch: true, type: "user" }));
    }, [userPage, userDisplayPeriod]);

    useEffect(() => {
        dispatch(setNeedToFetch({ needToFetch: true, type: "seller" }));
    }, [sellerPage, sellerDisplayPeriod]);

    useEffect(() => {
        dispatch(setPage({ page: 1, type: "user" }));
        dispatch(setNeedToFetch({ needToFetch: true, type: "user" }));
    }, [userQuery, userDisplayPeriod]);

    useEffect(() => {
        dispatch(setPage({ page: 1, type: "seller" }));
        dispatch(setNeedToFetch({ needToFetch: true, type: "seller" }));
    }, [sellerQuery, sellerDisplayPeriod]);

    useEffect(() => {
        if (needToFetch["seller"]) {
            getTransactions("seller", sellerDisplayPeriod);
        }

        if (needToFetch["user"]) {
            getTransactions("user", userDisplayPeriod);
        }
    }, [needToFetch, userPage, sellerPage]);

    const getTransactions = async (type, displayPeriod) => {
        if (loading[type] || loadingMore[type]) {
            return;
        }

        const currentPage = type === "user" ? userPage : sellerPage;
        const query = type === "user" ? userQuery : sellerQuery;

        let createdMonth,
            createdYear,
            url = `transactions/?type=${type}&query=${query}&page=${currentPage}&skip=${addedTransactionsCount[type]}`;

        if (displayPeriod !== "all") {
            displayPeriod = displayPeriod.split(", ");
            createdMonth = monthToNumberMap[displayPeriod[0]];
            createdYear = parseInt(displayPeriod[1]);
            url += `&month=${createdMonth}&year=${createdYear}`;
        }

        if (currentPage === 1) {
            dispatch(setLoading({ value: true, type }));
        } else {
            dispatch(setLoadingMore({ loadingMore: true, type }));
        }

        dispatch(setNoMoreData({ type, noMoreData: false }));

        try {
            const data = await fetcher(url);

            if (currentPage === 1) {
                dispatch(
                    setTransactions({ transactions: data.transactions, type })
                );
            } else {
                dispatch(
                    setTransactions({
                        transactions: [
                            ...(type === "user"
                                ? userTransactions
                                : sellerTransactions),
                            ...data.transactions,
                        ],
                        type,
                    })
                );
            }

            if (data.transactions.length < PAGE_SIZE[type]) {
                dispatch(setNoMoreData({ noMoreData: true, type }));
            }

            dispatch(setTotalCount({ count: data.totalCount, type }));
            dispatch(resetPageSize());
        } catch (error) {
            dispatch(setError({ error: error.message, type }));
        } finally {
            dispatch(setLoading({ value: false, type }));
            dispatch(setLoadingMore({ loadingMore: false, type }));
        }
    };

    return <></>;
};

export default Transaction;
