import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import {
    addSellerOrder,
    resetPageSize,
    setError,
    setLoading,
    setLoadingMore,
    setNeedToFetch,
    setNoMoreData,
    setOrders,
    setPage,
    setTotalCount,
    updateOrder,
} from "../redux/slices/orders-slice";
// import useAudio from "../hooks/use-audio-realtime";
import { fetcher } from "../lib/fetcher";
import useSocket from "../hooks/use-socket";

const Order = () => {
    const { authUser } = useSelector((state) => state.auth);
    const {
        userOrders,
        sellerOrders,
        userPage,
        sellerPage,
        userQuery,
        sellerQuery,
        addedOrdersCount,
        PAGE_SIZE,
    } = useSelector((state) => state.orders);

    const socket = useSocket();
    const dispatch = useDispatch();
    const { needToFetch, soundCounter } = useSelector((state) => state.orders);
    // const [play] = useAudio("order", soundCounter);

    useEffect(() => {
        socket.on("order", (order) => {
            if (order.store.userId === authUser?.id) {
                dispatch(addSellerOrder({ sellerOrder: order }));
            }
        });

        socket.on("order-cancel", (orderInfo) => {
            const { id, status, sellerId } = orderInfo;

            if (sellerId === authUser?.id) {
                dispatch(
                    updateOrder({ id, type: "seller", updateInfo: { status } })
                );
            }
        });

        socket.on("order-confirm", (orderInfo) => {
            console.log(orderInfo);
            handleOrderControl(orderInfo);
        });

        socket.on("order-reject", (orderInfo) => {
            handleOrderControl(orderInfo);
        });

        socket.on("order-package", (orderInfo) => {
            handleOrderControl(orderInfo);
        });

        socket.on("order-completion-request", (orderInfo) => {
            handleOrderCompletion(orderInfo);
        });

        socket.on("order-completion-accept", (orderInfo) => {
            handleOrderCompletion(orderInfo);
        });

        socket.on("order-completion-reject", (orderInfo) => {
            handleOrderCompletion(orderInfo);
        });
    }, [authUser]);

    useEffect(() => {
        dispatch(setNeedToFetch({ needToFetch: true, type: "user" }));
    }, [userPage]);

    useEffect(() => {
        dispatch(setNeedToFetch({ needToFetch: true, type: "seller" }));
    }, [sellerPage]);

    useEffect(() => {
        dispatch(setPage({ page: 1, type: "user" }));
        dispatch(
            setNeedToFetch({
                needToFetch: true,
                type: "user",
            })
        );
    }, [userQuery]);

    useEffect(() => {
        dispatch(setPage({ page: 1, type: "seller" }));
        dispatch(
            setNeedToFetch({
                needToFetch: true,
                type: "seller",
            })
        );
    }, [sellerQuery]);

    useEffect(() => {
        if (needToFetch["seller"]) {
            getOrders("seller");
        }

        if (needToFetch["user"]) {
            getOrders("user");
        }
    }, [needToFetch, userPage, sellerPage]);

    const getOrders = async (type) => {
        const currentPage = type === "user" ? userPage : sellerPage;
        const query = type === "user" ? userQuery : sellerQuery;

        if (currentPage === 1) {
            dispatch(setLoading({ value: true, type }));
        } else {
            dispatch(setLoadingMore({ value: true, type }));
        }

        dispatch(setNoMoreData({ type, noMoreData: false }));

        try {
            const data = await fetcher(
                `orders/?type=${type}&page=${currentPage}&query=${query}&skip=${addedOrdersCount[type]}`
            );

            if (currentPage === 1) {
                dispatch(setOrders({ orders: data.orders, type }));
            } else {
                dispatch(
                    setOrders({
                        orders: [
                            ...(type === "user" ? userOrders : sellerOrders),
                            ...data.orders,
                        ],
                        type,
                    })
                );
            }

            if (data.orders.length < PAGE_SIZE[type]) {
                dispatch(setNoMoreData({ noMoreData: true, type }));
            }

            if (
                (type === "user" && userPage === 1) ||
                (type === "seller" && sellerPage === 1)
            ) {
                dispatch(setTotalCount({ count: data.totalCount, type }));
            }
            dispatch(resetPageSize(type));
        } catch (error) {
            dispatch(setError({ error: error.message, type }));
        } finally {
            dispatch(setLoading({ value: false, type }));
            dispatch(setLoadingMore({ loadingMore: false, type }));
        }
    };

    const handleOrderControl = (orderInfo) => {
        console.log(orderInfo);

        const { id, status, originId } = orderInfo;

        if (originId === authUser?.id) {
            dispatch(updateOrder({ id, type: "user", updateInfo: { status } }));
        }
    };

    const handleOrderCompletion = (orderInfo) => {
        const { id, originId, updateInfo } = orderInfo;

        dispatch(
            updateOrder({
                id,
                type: originId === authUser?.id ? "user" : "seller",
                updateInfo,
            })
        );
    };

    return <></>;
};

export default Order;
