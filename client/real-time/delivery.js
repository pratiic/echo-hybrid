import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { fetcher } from "../lib/fetcher";
import {
    addDelivery,
    deleteDelivery,
    resetPageSize,
    setDeliveries,
    setProp as setDeliveryProp,
} from "../redux/slices/delivery-slice";
import useSocket from "../hooks/use-socket";

const Delivery = () => {
    const {
        pending,
        completed,
        needToFetch,
        pendingPage,
        completedPage,
        loading,
        loadingMore,
        pendingQuery,
        completedQuery,
        addedCount,
        PAGE_SIZE,
    } = useSelector((state) => state.delivery);

    const dispatch = useDispatch();
    const socket = useSocket();

    useEffect(() => {
        if (needToFetch["pending"]) {
            fetchDeliveries("pending");
        }

        if (needToFetch["completed"]) {
            fetchDeliveries("completed");
        }
    }, [needToFetch]);

    useEffect(() => {
        setProp("pending", "needToFetch", true);
    }, [pendingPage]);

    useEffect(() => {
        setProp("completed", "needToFetch", true);
    }, [completedPage]);

    useEffect(() => {
        setProp("pending", "needToFetch", true);
    }, [pendingQuery]);

    useEffect(() => {
        setProp("completed", "needToFetch", true);
    }, [completedQuery]);

    useEffect(() => {
        socket.on("delivery-completion", (deliveryInfo) => {
            dispatch(
                deleteDelivery({ type: "pending", id: deliveryInfo.order.id })
            );
            dispatch(
                addDelivery({ type: "completed", delivery: deliveryInfo })
            );
        });

        socket.on("delivery-request", (orderInfo) => {
            dispatch(addDelivery({ type: "pending", delivery: orderInfo }));
        });
    }, []);

    const setProp = (type, prop, value) => {
        dispatch(
            setDeliveryProp({
                type,
                prop,
                value,
            })
        );
    };

    const fetchDeliveries = async (type) => {
        const currentPage = type === "pending" ? pendingPage : completedPage;
        const query = type === "pending" ? pendingQuery : completedQuery;

        if (loading[type] || loadingMore[type]) {
            return;
        }

        setProp(type, currentPage === 1 ? "loading" : "loadingMore", true);
        setProp(type, "noMoreData", false);

        try {
            const urlMap = {
                pending: `orders/?type=delivery&page=${pendingPage}&query=${pendingQuery}&skip=${addedCount["pending"]}`,
                completed: `delivery/?page=${completedPage}&query=${completedQuery}&skip=${addedCount["completed"]}`,
            };

            const data = await fetcher(urlMap[type]);
            const deliveries =
                type === "pending" ? data.orders : data.deliveries; // pending deliveries are still orders

            dispatch(
                setDeliveries({
                    type,
                    deliveries:
                        currentPage === 1
                            ? deliveries
                            : [
                                  ...(type === "pending" ? pending : completed),
                                  ...deliveries,
                              ],
                })
            );

            if (deliveries.length < PAGE_SIZE[type]) {
                setProp(type, "noMoreData", true);
            }
            if (currentPage === 1) {
                setProp(type, "totalCount", data.totalCount);
            }
            dispatch(resetPageSize(type));
        } catch (error) {
            setProp(type, "error", error.message);
        } finally {
            setProp(type, "loading", false);
            setProp(type, "loadingMore", false);
        }
    };

    const fetchCompletedDeliveries = async () => {
        setProp("completed", "loading", true);

        try {
            const data = await fetcher("delivery");

            dispatch(
                setDeliveries({
                    type: "completed",
                    deliveries: data.deliveries,
                })
            );
            setProp("completed", "totalCount", data.totalCount);
        } catch (error) {
            setProp("completed", "error", error.message);
        } finally {
            setProp("completed", "loading", false);
        }
    };

    return <></>;
};

export default Delivery;
