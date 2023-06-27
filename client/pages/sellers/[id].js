import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { IdentificationIcon, ShoppingCartIcon } from "@heroicons/react/outline";

import { capitalizeAll } from "../../lib/strings";
import { fetcher } from "../../lib/fetcher";
import useSocket from "../../hooks/use-socket";
import { resetSellerFilterOptions } from "../../redux/slices/filter-slice";

import OptionsToggle from "../../components/options-toggle";
import PageHeader from "../../components/page-header";
import SellerDetails from "../../components/seller-details";
import SellerProducts from "../../components/seller-products";
import SellerMenu from "../../components/seller-menu";
import Human from "../../components/human";
import InfoBanner from "../../components/info-banner";

const SellerPage = () => {
    const [options, setOptions] = useState([
        {
            name: "details",
            icon: <IdentificationIcon className="icon-no-bg" />,
        },
        {
            name: "products",
            icon: <ShoppingCartIcon className="icon-no-bg" />,
        },
    ]);
    const [activeOption, setActiveOption] = useState(options[0].name);
    const [storeDetails, setStoreDetails] = useState("");
    const [isMyStore, setIsMyStore] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [sellerName, setSellerName] = useState(""); // IND -> seller's name, BUS -> business' name
    const [notFound, setNotFound] = useState(false);

    const { authUser } = useSelector((state) => state.auth);
    const router = useRouter();
    const socket = useSocket();
    const dispatch = useDispatch();

    useEffect(() => {
        if (router?.query?.id) {
            getStoreDetails();
        }
    }, [router]);

    useEffect(() => {
        setSellerName(
            capitalizeAll(
                storeDetails?.storeType === "BUS"
                    ? storeDetails?.business?.name
                    : capitalizeAll(storeDetails?.user?.fullName)
            )
        );
    }, [storeDetails]);

    useEffect(() => {
        if (storeDetails?.user?.id === authUser?.id) {
            setIsMyStore(true);
        } else {
            setIsMyStore(false);
        }
    }, [authUser, storeDetails]);

    useEffect(() => {
        socket.on("seller-delete", (id) => {
            if (storeDetails?.id === id) {
                setNotFound(true);
                setErrorMsg("deleted");
            }
        });
    }, [storeDetails]);

    useEffect(() => {
        socket.on("rating", (ratingInfo) => {
            const { rating, ratingNum } = ratingInfo;

            if (rating.storeId === storeDetails?.id) {
                updateStore({
                    rating: ratingNum,
                    ratings: [...storeDetails?.ratings, rating],
                });
            }
        });

        socket.on("rating-delete", (ratingInfo) => {
            const { id, ratingNum, targetId } = ratingInfo;

            if (targetId === storeDetails?.id) {
                updateStore({
                    rating: ratingNum,
                    ratings: storeDetails?.ratings?.filter(
                        (rating) => rating.id !== id
                    ),
                });
            }
        });
    }, [storeDetails]);

    useEffect(() => {
        return () => {
            dispatch(resetSellerFilterOptions());
        };
    }, []);

    const getStoreDetails = async () => {
        const storeId = router?.query.id;
        setLoadingDetails(true);

        try {
            const data = await fetcher(`stores/${storeId}`);
            setStoreDetails(data.store);
        } catch (error) {
            if (error.statusCode === 404) {
                setNotFound(true);
            }

            setErrorMsg(error.message);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleOptionClick = (option) => {
        setActiveOption(option);
    };

    const updateStore = (updateInfo) => {
        setStoreDetails({ ...storeDetails, ...updateInfo });
    };

    if (loadingDetails) {
        return <p className="status">Loading seller details...</p>;
    }

    if (notFound) {
        return (
            <Human name="not-found" message={errorMsg} contentType="seller" />
        );
    }

    if (errorMsg) {
        return <p className="status">{errorMsg}</p>;
    }

    if (storeDetails?.suspension && !authUser?.isAdmin && !isMyStore) {
        return (
            <Human
                name="suspended"
                message="this seller has been suspended and will be accessible once they
                get reinstated"
            />
        );
    }

    return (
        <section>
            <Head>
                <title>{sellerName}</title>
            </Head>

            <PageHeader heading={sellerName} hasBackArrow>
                <SellerMenu
                    isMyStore={isMyStore}
                    storeId={storeDetails?.id}
                    storeType={storeDetails?.storeType}
                />
            </PageHeader>

            {storeDetails?.suspension && (
                <InfoBanner className="mb-7">
                    <p>
                        This seller has been suspended and is only accessible to
                        us and the seller themselves.
                    </p>
                    <p className="font-semibold">
                        The suspension will be lifted if or when we deem
                        appropriate.
                    </p>
                </InfoBanner>
            )}

            <div className="mb-5 -mt-1">
                <OptionsToggle
                    options={options}
                    rounded={false}
                    active={activeOption}
                    onClick={handleOptionClick}
                />
            </div>

            {activeOption === "details" && (
                <SellerDetails
                    {...{ ...storeDetails, isMyStore, updateStore }}
                />
            )}

            {activeOption === "products" && (
                <SellerProducts
                    sellerId={storeDetails?.id}
                    sellerType={storeDetails?.storeType}
                    isMyStore={isMyStore}
                />
            )}
        </section>
    );
};

export default SellerPage;
