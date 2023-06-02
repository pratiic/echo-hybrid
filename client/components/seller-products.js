import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { BiCategory } from "react-icons/bi";
import { PlusIcon } from "@heroicons/react/outline";
import { useSelector } from "react-redux";

import { fetcher } from "../lib/fetcher";
import { getFilterMap } from "../lib/filter";
import { capitalizeFirstLetter } from "../lib/strings";

import Icon from "./icon";
import FilterTrigger from "./filter-trigger";
import SearchBar from "./search-bar";
import ContentList from "./content-list";

const SellerProducts = ({ sellerId }) => {
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
        getShopProducts();
    }, [page]);

    useEffect(() => {
        setPage(1);
    }, [activeFilter, locationFilter, sortBy, sortType, query]);

    const getShopProducts = async () => {
        if (loading || loadingMore) {
            return;
        }

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
            <div className="flex items-center mb-7">
                {sellerId === authUser?.store?.id && (
                    <Icon
                        className="mr-3"
                        toolName="add product"
                        onClick={() => router.push("/set-product/?mode=create")}
                    >
                        <PlusIcon className="icon" />
                    </Icon>
                )}
                {/* <div className="flex items-center space-x-2 mr-2 500:mr-5">
                </div> */}

                <FilterTrigger isGlobal={false} />
            </div>

            <SearchBar
                show={true}
                placeholder="Search products..."
                resultsCount={totalCount}
                contentType="product"
                className="mb-5 -mt-3"
                value={query}
                clearSearch={() => {
                    setQuery("");
                    if (router.query.query) {
                        router.query.query = "";
                        router.push(router);
                    }
                }}
            />

            {/* count of products */}
            {!query && totalCount > 0 && (
                <div className="-mt-3 mb-3 text-sm ml-1 dark-light">
                    <span>
                        {capitalizeFirstLetter(
                            getFilterMap(locationFilter, sellerFilter, true)[
                                activeFilter
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
