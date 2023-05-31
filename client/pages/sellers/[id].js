import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { IdentificationIcon, ShoppingCartIcon } from "@heroicons/react/outline";

import { capitalizeAll, capitalizeFirstLetter } from "../../lib/strings";
import { fetcher } from "../../lib/fetcher";
import useSocket from "../../hooks/use-socket";

import OptionsToggle from "../../components/options-toggle";
import PageHeader from "../../components/page-header";
import SellerDetails from "../../components/seller-details";
import SellerProducts from "../../components/seller-products";
import SellerMenu from "../../components/seller-menu";
import Human from "../../components/human";

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
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [sellerName, setSellerName] = useState(""); // IND -> seller's name, BUS -> business' name
    const [notFound, setNotFound] = useState(false);

    const { authUser } = useSelector((state) => state.auth);
    const router = useRouter();
    const socket = useSocket();

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
                    : capitalizeAll(
                          `${storeDetails?.user?.firstName} ${storeDetails?.user?.lastName}`
                      )
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

    return (
        <section>
            <Head>
                <title>{sellerName}</title>
            </Head>

            <PageHeader heading={sellerName} hasBackArrow>
                {isMyStore && (
                    <SellerMenu
                        storeId={storeDetails?.id}
                        storeType={storeDetails?.storeType}
                    />
                )}
            </PageHeader>

            <div className="mb-5 -mt-1">
                <OptionsToggle
                    options={options}
                    rounded={false}
                    active={activeOption}
                    onClick={handleOptionClick}
                />
            </div>

            {activeOption === "details" && (
                <SellerDetails {...{ ...storeDetails, isMyStore }} />
            )}
            {activeOption === "products" && <SellerProducts />}
        </section>
    );
};

export default SellerPage;
