import React, { useEffect, useState } from "react";
import Head from "next/head";
import {
    IdentificationIcon,
    LocationMarkerIcon,
    MenuAlt4Icon,
} from "@heroicons/react/outline";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { closeModal, showLoadingModal } from "../redux/slices/modal-slice";
import { fetcher } from "../lib/fetcher";
import { setErrorAlert } from "../redux/slices/alerts-slice";

import PageHeader from "../components/page-header";
import OptionsToggle from "../components/options-toggle";
import UserDetails from "../components/user-details";
import UserAddress from "../components/user-address";
import Dropdown from "../components/dropdown";
import DropdownItem from "../components/dropdown-item";
import Icon from "../components/icon";
import { setActiveChat } from "../redux/slices/chat-slice";

const Profile = () => {
    const [activeOption, setActiveOption] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

    const { authUser } = useSelector((state) => state.auth);

    const options = [
        {
            name: "details",
            icon: <IdentificationIcon className="icon-no-bg" />,
        },
        {
            name: "address",
            icon: <LocationMarkerIcon className="icon-no-bg" />,
        },
    ];
    const router = useRouter();
    const dispatch = useDispatch();

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

    const toggleDropdown = (event) => {
        event.stopPropagation();

        setShowDropdown(!showDropdown);
    };

    const handleChatClick = async () => {
        dispatch(showLoadingModal("starting chat..."));

        try {
            const data = await fetcher("chats/direct/admin", "POST");

            const chat = data.chat;
            const chatUser = chat.users.find((user) => authUser.id !== user.id);
            dispatch(
                setActiveChat({
                    id: chat.id,
                    user: chatUser,
                })
            );
            router.push(`/chats/${chatUser.id}`);
        } catch (error) {
            dispatch(setErrorAlert(error.message));
        } finally {
            dispatch(closeModal());
        }
    };

    return (
        <section>
            <Head>
                <title>Your profile | {activeOption}</title>
            </Head>

            <PageHeader heading="Your profile" hasBackArrow>
                <div>
                    <Icon toolName="options" onClick={toggleDropdown}>
                        <MenuAlt4Icon className="icon" />
                    </Icon>

                    <Dropdown
                        show={showDropdown}
                        toggleDropdown={toggleDropdown}
                    >
                        <DropdownItem
                            action="chat"
                            textAsIs
                            onClick={handleChatClick}
                        >
                            Chat with Admin
                        </DropdownItem>
                    </Dropdown>
                </div>
            </PageHeader>

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
