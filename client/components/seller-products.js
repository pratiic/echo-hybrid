import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { PlusIcon } from "@heroicons/react/outline";
import { useSelector } from "react-redux";

import { fetcher } from "../lib/fetcher";
import { getFilterMap } from "../lib/filter";
import { capitalizeFirstLetter } from "../lib/strings";

import FilterTrigger from "./filter-trigger";
import SearchBar from "./search-bar";
import ContentList from "./content-list";
import Icon from "./icon";

const SellerProducts = ({ sellerId, sellerType, isMyStore }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [noMoreData, setNoMoreData] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [query, setQuery] = useState("");

    const { sellerFilter } = useSelector((state) => state.filter);
    const {
        activeFilter,
        locationFilter,
        sortingType: sortBy,
        orderType: sortType,
    } = useSelector((state) => state.filter.sellerFilter);
    const { authUser } = useSelector((state) => state.auth);
    const router = useRouter();
    const PAGE_SIZE = 15;

    useEffect(() => {
        setQuery(router.query.query ? router.query.query : "");
    }, [router]);

    useEffect(() => {
        getSellerProducts();
    }, [activeFilter, locationFilter, sortBy, sortType, query, page]);

    const getSellerProducts = async () => {
        if (page === 1) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        setNoMoreData(false);

        try {
            const data = await fetcher(
                `products/?storeId=${sellerId}&filter=${
                    activeFilter === "location" ? locationFilter : activeFilter
                }&sortBy=${sortBy}&sortType=${sortType}&query=${query}&page=${page}`
            );

            setTotalCount(data.totalCount);

            if (page === 1) {
                setProducts(data.products);
            } else {
                setProducts([...products, ...data.products]);
            }

            if (data.products.length < PAGE_SIZE) {
                setNoMoreData(true);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const incrementPageNumber = () => {
        setPage(page + 1);
    };

    return (
        <section>
            <div className="flex items-center mb-8">
                <FilterTrigger
                    isGlobal={false}
                    sellerType={sellerType}
                    isMyStore={isMyStore}
                />

                {sellerId === authUser?.store?.id && (
                    <Icon
                        toolName="add product"
                        onClick={() => router.push("/set-product")}
                    >
                        <PlusIcon className="icon ml-2" />
                    </Icon>
                )}
            </div>

            <SearchBar
                show={true}
                placeholder="Search products..."
                resultsCount={totalCount}
                contentType="product"
                value={query}
                searching={loading}
                className="mb-5 -mt-3"
                clearSearch={() => {
                    setQuery("");
                    if (router.query.query) {
                        router.query.query = "";
                        router.push(router);
                    }
                }}
            />

            {!query && (
                <div className="-mt-2 mb-4 text-sm ml-1 dark-light">
                    <span>
                        {capitalizeFirstLetter(
                            getFilterMap(locationFilter)[
                                sellerFilter.activeFilter
                            ]
                        )}{" "}
                        -
                    </span>
                    <span className="font-semibold"> {totalCount}</span>
                </div>
            )}

            <ContentList
                list={products}
                loadingMsg={loading && "Loading products..."}
                emptyMsg="No products found in this category and filter type"
                error={error}
                human="no-items"
                incrementPageNumber={
                    products.length >= PAGE_SIZE &&
                    !noMoreData &&
                    incrementPageNumber
                }
                loadingMore={loadingMore}
            />
        </section>
    );
};

export default SellerProducts;
