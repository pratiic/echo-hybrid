import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { IdentificationIcon, ShoppingCartIcon } from "@heroicons/react/outline";

import { capitalizeAll, capitalizeFirstLetter } from "../../lib/strings";
import { fetcher } from "../../lib/fetcher";

import OptionsToggle from "../../components/options-toggle";
import PageHeader from "../../components/page-header";
import SellerDetails from "../../components/seller-details";
import SellerProducts from "../../components/seller-products";

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

    const { authUser } = useSelector((state) => state.auth);

    const router = useRouter();

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

    // useEffect(() => {
    //   if (router.query.show) {
    //     setActiveOption(router.query.show);
    //   } else {
    //     router.push(`/sellers/${router.query.id}`);
    //   }
    // }, [router]);

    useEffect(() => {
        if (storeDetails?.user?.id === authUser?.id) {
            setIsMyStore(true);
        } else {
            setIsMyStore(false);
        }
    }, [authUser]);

    const getStoreDetails = async () => {
        const storeId = router?.query.id;
        setLoadingDetails(true);

        try {
            const data = await fetcher(`stores/${storeId}`);
            setStoreDetails(data.store);
        } catch (error) {
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

    if (errorMsg) {
        return <p className="status">{errorMsg}</p>;
    }

    return (
        <section>
            <Head>
                <title>{sellerName}</title>
            </Head>

            <PageHeader heading={sellerName} hasBackArrow />

            <div className="mb-5 -mt-1">
                <OptionsToggle
                    options={options}
                    rounded={false}
                    active={activeOption}
                    onClick={handleOptionClick}
                />
            </div>

            {activeOption === "details" && <SellerDetails {...storeDetails} />}
            {activeOption === "products" && <SellerProducts />}
        </section>
    );
};

export default SellerPage;
