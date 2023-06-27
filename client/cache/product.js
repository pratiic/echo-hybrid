import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    setCategory,
    setError,
    setFetchCounter,
    setLoading,
    setLoadingMore,
    setNeedToFetch,
    setNoMoreData,
    setPage,
    setProducts,
    setTotalCount,
} from "../redux/slices/products-slice";
import { fetcher } from "../lib/fetcher";
import { resetFilterOptions } from "../redux/slices/filter-slice";

const Product = () => {
    const {
        activeFilter,
        locationFilter,
        sortingType: sortBy,
        orderType: sortType,
    } = useSelector((state) => state.filter);
    const {
        products,
        needToFetch,
        page,
        fetchCounter,
        loading,
        loadingMore,
        category,
        query,
        PAGE_SIZE,
    } = useSelector((state) => state.products);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(resetFilterOptions());
        dispatch(setCategory(""));
        dispatch(setFetchCounter(fetchCounter + 1));
    }, [query]);

    useEffect(() => {
        if (activeFilter === "recommended") {
            dispatch(resetFilterOptions());
        }
        dispatch(setFetchCounter(fetchCounter + 1));
    }, [category]);

    useEffect(() => {
        dispatch(setPage(1));
        dispatch(setFetchCounter(fetchCounter + 1));
    }, [activeFilter, locationFilter, sortBy, sortType]);

    useEffect(() => {
        dispatch(setNeedToFetch(true));
    }, [page, fetchCounter]);

    useEffect(() => {
        if (needToFetch) {
            fetchProducts();
        }
    }, [needToFetch]);

    const fetchProducts = async () => {
        if (loading || loadingMore) {
            return;
        }

        dispatch(setNoMoreData(false));

        if (page === 1) {
            dispatch(setLoading(true));
        } else {
            dispatch(setLoadingMore(true));
        }

        try {
            let url = `products/?filter=${
                activeFilter === "location" ? locationFilter : activeFilter
            }&sortBy=${sortBy}&sortType=${sortType}&query=${query}&category=${category}&page=${page}`;

            const data = await fetcher(url);

            if (page === 1) {
                dispatch(setProducts(data.products));
            } else {
                dispatch(setProducts([...products, ...data.products]));

                if (data.products.length < PAGE_SIZE) {
                    dispatch(setNoMoreData(true));
                }
            }

            dispatch(setNeedToFetch(false));
            dispatch(setTotalCount(data.totalCount));
        } catch (error) {
            dispatch(setError(error.message));
            dispatch(setPage(page > 1 ? page - 1 : 1));
        } finally {
            dispatch(setLoading(false));
            dispatch(setLoadingMore(false));
        }
    };

    return <></>;
};

export default Product;
