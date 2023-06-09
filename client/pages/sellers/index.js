import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    DotsHorizontalIcon,
    LocationMarkerIcon,
    ArrowsExpandIcon,
    UserIcon,
} from "@heroicons/react/outline";
import { FaCity } from "react-icons/fa";
import { AiOutlineShop } from "react-icons/ai";
import Head from "next/head";
import { useRouter } from "next/router";

import {
    setActiveFilter,
    setActiveLocationType,
    setPage,
    setQuery,
} from "../../redux/slices/sellers-slice";

import PageHeader from "../../components/page-header";
import ContentList from "../../components/content-list";
import OptionsToggle from "../../components/options-toggle";
import SellerFilterInfo from "../../components/filter-info/seller";
import SearchBar from "../../components/search-bar";

const Sellers = () => {
    const [showSearchBar, setShowSearchBar] = useState(false);
    const dispatch = useDispatch();
    const {
        sellers,
        activeFilter,
        activeLocationType,
        loading,
        loadingMore,
        error,
        page,
        query,
        noMoreData,
        totalCount,
        PAGE_SIZE,
    } = useSelector((state) => state.sellers);
    const { authUser } = useSelector((state) => state.auth);
    const router = useRouter();

    const filterOptions = [
        { name: "all", icon: <DotsHorizontalIcon className="icon-no-bg" /> },
        {
            name: "individual",
            icon: <UserIcon className="icon-no-bg" />,
        },
        {
            name: "business",
            icon: <AiOutlineShop className="icon-no-bg" />,
        },
        {
            name: "location",
            icon: <LocationMarkerIcon className="icon-no-bg" />,
            disabled:
                !authUser?.address ||
                authUser?.isAdmin ||
                authUser?.isDeliveryPersonnel, // disable if the user has not added their address
        },
    ];
    const locationOptions = [
        { name: "province", icon: <ArrowsExpandIcon className="icon-no-bg" /> },
        { name: "city", icon: <FaCity className="icon-no-bg" /> },
        { name: "area", icon: <LocationMarkerIcon className="icon-no-bg" /> },
    ];

    useEffect(() => {
        dispatch(setQuery(router.query.query || ""));

        if (router.query.query) {
            setShowSearchBar(true);
        }
    }, [router]);

    const incrementPageNumber = () => {
        dispatch(setPage(page + 1));
    };

    const toggleSearchBar = () => {
        setShowSearchBar(!showSearchBar);
        router.query.query = "";
        router.push(router);
    };

    return (
        <section>
            <Head>
                <title>Explore sellers</title>
            </Head>

            <PageHeader
                heading="explore sellers"
                hasBackArrow
                onSearchClick={toggleSearchBar}
                activeSearch={showSearchBar}
            >
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

            {!showSearchBar && <SellerFilterInfo />}

            <SearchBar
                show={showSearchBar}
                placeholder="Search sellers..."
                resultsCount={totalCount}
                value={query}
                searching={loading}
                className="mb-5 -mt-2"
            />

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
