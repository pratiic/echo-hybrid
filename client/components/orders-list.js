import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";

import { fetcher } from "../lib/fetcher";
import {
    acknowledgeOrders,
    setPage,
    setQuery,
} from "../redux/slices/orders-slice";
import { singularOrPlural } from "../lib/strings";

import ContentList from "./content-list";
import GenericSearch from "./generic-search";

const OrdersList = ({ orderType }) => {
    const {
        userOrders,
        sellerOrders,
        loading,
        loadingMore,
        error,
        userPage,
        sellerPage,
        noMoreData,
        totalCount,
        userQuery,
        sellerQuery,
        addedOrdersCount,
        PAGE_SIZE,
    } = useSelector((state) => state.orders);
    const dispatch = useDispatch();
    const router = useRouter();

    useEffect(() => {
        if (
            router?.query?.show === "seller" &&
            sellerOrders.find((order) => !order.isAcknowledged)
        ) {
            acknowledgeSellerOrders();
        }
    }, [sellerOrders, router]);

    const acknowledgeSellerOrders = async () => {
        try {
            await fetcher("orders/acknowledge", "PATCH");
            dispatch(acknowledgeOrders());
        } catch (error) {
            console.log(error);
        }
    };

    const getOrderMessage = (totalCount) => {
        const query = orderType === "user" ? userQuery : sellerQuery;

        if (query) {
            return (
                <p className="history-message">
                    <span className="font-semibold">
                        {orderType === "user"
                            ? totalCount["user"]
                            : totalCount["seller"]}{" "}
                    </span>
                    {singularOrPlural(
                        orderType === "user" ? userOrders : sellerOrders,
                        "order",
                        "orders"
                    )}{" "}
                    found
                </p>
            );
        }

        if (
            (orderType === "user" && userOrders.length === 0) ||
            (orderType === "seller" && sellerOrders.length === 0)
        ) {
            return null;
        }

        return (
            <p className="history-message">
                {orderType === "user" ? "You have placed " : "You have "}
                <span className="font-semibold">
                    {orderType === "user"
                        ? totalCount["user"] + addedOrdersCount["user"]
                        : totalCount["seller"] + addedOrdersCount["seller"]}
                </span>
                {orderType === "user"
                    ? ` ${userOrders.length > 1 ? "orders" : "order"}`
                    : ` ${
                          sellerOrders.length > 1
                              ? "order requests"
                              : "order request"
                      }`}
            </p>
        );
    };

    const renderGenericSearch = () => {
        if (
            (orderType === "user" && userOrders.length === 0 && !userQuery) ||
            (orderType === "seller" &&
                sellerOrders.length === 0 &&
                !sellerQuery)
        ) {
            return;
        }

        return (
            <div className="mb-5">
                <GenericSearch
                    show={true}
                    placeholder="Product name or order Id..."
                    value={orderType === "user" ? userQuery : sellerQuery}
                    onSubmit={(query) =>
                        dispatch(setQuery({ type: orderType, query }))
                    }
                    clearSearch={() =>
                        dispatch(setQuery({ type: orderType, query: "" }))
                    }
                />
            </div>
        );
    };

    const incrementPageNumber = (orderType) => {
        dispatch(
            setPage({
                page: orderType === "user" ? userPage + 1 : sellerPage + 1,
                type: orderType,
            })
        );
    };

    const getPageNumberIncrementer = (orderType) => {
        if (orderType === "user") {
            if (
                userOrders.length >= PAGE_SIZE[orderType] &&
                !noMoreData["user"]
            ) {
                return () => {
                    incrementPageNumber("user");
                };
            }
        } else {
            if (
                sellerOrders.length >= PAGE_SIZE[orderType] &&
                !noMoreData["seller"]
            ) {
                return () => {
                    incrementPageNumber("seller");
                };
            }
        }
    };

    return (
        <div className="-mt-4">
            {getOrderMessage(totalCount)}

            {renderGenericSearch()}

            <ContentList
                type="order"
                list={orderType === "user" ? userOrders : sellerOrders}
                loadingMsg={
                    loading[orderType] &&
                    `Loading ${
                        orderType === "user"
                            ? "your orders..."
                            : "your order requests..."
                    }`
                }
                error={error[orderType]}
                emptyMsg="No orders found"
                human="no-history"
                incrementPageNumber={getPageNumberIncrementer(orderType)}
                loadingMore={loadingMore[orderType]}
            />
        </div>
    );
};

export default OrdersList;
