import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    DotsHorizontalIcon,
    LocationMarkerIcon,
    ArrowsExpandIcon,
} from "@heroicons/react/outline";
import { FaCity } from "react-icons/fa";
import Head from "next/head";

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
} from "../../redux/slices/sellers-slice";
import { fetcher } from "../../lib/fetcher";

import PageHeader from "../../components/page-header";
import ContentList from "../../components/content-list";
import OptionsToggle from "../../components/options-toggle";
import SellerFilterInfo from "../../components/filter-info/seller";

const Sellers = () => {
    const dispatch = useDispatch();
    const {
        sellers,
        needToFetch,
        activeFilter,
        activeLocationType,
        loading,
        loadingMore,
        error,
        page,
        fetchCounter,
        noMoreData,
        PAGE_SIZE,
    } = useSelector((state) => state.sellers);
    const { authUser } = useSelector((state) => state.auth);

    const filterOptions = [
        { name: "all", icon: <DotsHorizontalIcon className="icon-no-bg" /> },
        {
            name: "location",
            icon: <LocationMarkerIcon className="icon-no-bg" />,
            disabled: !authUser?.address, // disable if the user has not added their address
        },
    ];
    const locationOptions = [
        { name: "province", icon: <ArrowsExpandIcon className="icon-no-bg" /> },
        { name: "city", icon: <FaCity className="icon-no-bg" /> },
        { name: "area", icon: <LocationMarkerIcon className="icon-no-bg" /> },
    ];

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
                }&page=${page}`
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

    const incrementPageNumber = () => {
        dispatch(setPage(page + 1));
    };

    return (
        <section>
            <Head>
                <title>Explore sellers</title>
            </Head>

            <PageHeader heading="explore sellers" hasBackArrow>
                <div className="flex flex-col 450:flex-row items-end justify-end">
                    <OptionsToggle
                        options={filterOptions}
                        active={activeFilter}
                        type="dropdown"
                        onClick={(filter) => dispatch(setActiveFilter(filter))}
                    />

                    {activeFilter === "location" && (
                        <div className="mt-3 450:mt-0 450:ml-5">
                            <OptionsToggle
                                options={locationOptions}
                                active={activeLocationType}
                                type="dropdown"
                                onClick={(locationType) =>
                                    dispatch(
                                        setActiveLocationType(locationType)
                                    )
                                }
                            />
                        </div>
                    )}
                </div>
            </PageHeader>

            <SellerFilterInfo />

            <ContentList
                list={sellers}
                type="seller"
                loadingMsg={loading && "Loading sellers..."}
                error={error}
                emptyMsg={`There are no shops in this filter option`}
                human="no-items"
                loadingMore={loadingMore}
                incrementPageNumber={
                    sellers.length >= PAGE_SIZE &&
                    !noMoreData &&
                    incrementPageNumber
                }
            />
        </section>
    );
};

export default Sellers;
