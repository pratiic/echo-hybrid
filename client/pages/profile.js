import Head from "next/head";
import React, { useEffect, useState } from "react";
import {
    IdentificationIcon,
    LocationMarkerIcon,
} from "@heroicons/react/outline";
import { useRouter } from "next/router";

import PageHeader from "../components/page-header";
import OptionsToggle from "../components/options-toggle";
import UserDetails from "../components/user-details";
import UserAddress from "../components/user-address";

const Profile = () => {
    const [options, setOptions] = useState([
        {
            name: "details",
            icon: <IdentificationIcon className="icon-no-bg" />,
        },
        {
            name: "address",
            icon: <LocationMarkerIcon className="icon-no-bg" />,
        },
    ]);
    const [activeOption, setActiveOption] = useState("");

    const router = useRouter();

    useEffect(() => {
        if (router.query.show) {
            setActiveOption(router.query.show);
        } else {
            router.push("/profile/?show=details");
        }
    }, [router]);

    const handleOptionClick = (option) => {
        router.push(`/profile/?show=${option}`);
    };

    return (
        <section>
            <Head>Your Profile | {activeOption}</Head>

            <PageHeader heading="Your profile" hasBackArrow />

            <div className="pb-7 600:pb-9">
                <OptionsToggle
                    options={options}
                    active={activeOption}
                    centered
                    onClick={handleOptionClick}
                />
            </div>

            <div className="flex flex-col justify-center items-center">
                {activeOption === "details" && <UserDetails />}
                {activeOption === "address" && <UserAddress />}
            </div>
        </section>
    );
};

export default Profile;
