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
    setLoading,
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
        error,
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
        if (needToFetch) {
            fetchSellers();
        }
    }, [needToFetch]);

    const fetchSellers = async () => {
        dispatch(setLoading(true));

        try {
            const data = await fetcher(
                `stores/?filter=${
                    activeFilter === "location"
                        ? activeLocationType
                        : activeFilter
                }`
            );

            dispatch(setSellers(data.stores));
            dispatch(setTotalCount(data.totalCount));
        } catch (error) {
            dispatch(setError(error.message));
        } finally {
            dispatch(setLoading(false));
        }
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
            />
        </section>
    );
};

export default Sellers;
