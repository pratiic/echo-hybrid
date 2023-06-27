import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
    setActiveFilter,
    setActiveLocationType,
    setError,
    setFetchCounter,
    setLoading,
    setLoadingMore,
    setNeedToFetch,
    setNoMoreData,
    setPage,
    setSellers,
    setTotalCount,
} from "../redux/slices/sellers-slice";
import { fetcher } from "../lib/fetcher";

const Seller = () => {
    const dispatch = useDispatch();
    const {
        sellers,
        needToFetch,
        activeFilter,
        activeLocationType,
        loading,
        loadingMore,
        page,
        fetchCounter,
        query,
        PAGE_SIZE,
    } = useSelector((state) => state.sellers);

    useEffect(() => {
        dispatch(setActiveFilter("all"));
        dispatch(setActiveLocationType("province"));
        dispatch(setFetchCounter(fetchCounter + 1));
    }, [query]);

    useEffect(() => {
        dispatch(setPage(1));
        dispatch(setFetchCounter(fetchCounter + 1));
    }, [activeFilter, activeLocationType]);

    useEffect(() => {
        dispatch(setNeedToFetch(true));
    }, [page, fetchCounter]);

    useEffect(() => {
        if (needToFetch) {
            fetchSellers();
        }
    }, [needToFetch]);

    const fetchSellers = async () => {
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
                `stores/?filter=${
                    activeFilter === "location"
                        ? activeLocationType
                        : activeFilter
                }&page=${page}&query=${query}`
            );

            if (page === 1) {
                dispatch(setSellers(data.stores));
            } else {
                dispatch(setSellers([...sellers, ...data.stores]));

                if (data.stores.length < PAGE_SIZE) {
                    dispatch(setNoMoreData(true));
                }
            }

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

export default Seller;
