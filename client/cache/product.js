import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
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
        query,
        loading,
        loadingMore,
        category,
        PAGE_SIZE,
    } = useSelector((state) => state.products);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setPage(1));
        dispatch(setFetchCounter(fetchCounter + 1));
    }, [activeFilter, locationFilter, sortBy, sortType, category, query]);

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
            const data = await fetcher(
                `products/?filter=${
                    activeFilter === "location" ? locationFilter : activeFilter
                }&sortBy=${sortBy}&sortType=${sortType}&category=${category}&query=${query}&page=${page}`
            );

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
