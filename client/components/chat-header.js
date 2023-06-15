import React, { useState } from "react";
import { useRouter } from "next/router";
import { ArrowLeftIcon } from "@heroicons/react/solid";
import { MenuAlt4Icon } from "@heroicons/react/outline";
import { useSelector, useDispatch } from "react-redux";

import { toggleDeleteMode } from "../redux/slices/chat-slice";
import { capitalizeAll } from "../lib/strings";

import Avatar from "./avatar";
import Dropdown from "./dropdown";
import DropdownItem from "./dropdown-item";
import Switch from "./switch";
import Icon from "./icon";
import Tag from "./tag";

const ChatHeader = ({ user }) => {
    const [showDropdown, setShowDropdown] = useState(false);

    const router = useRouter();
    const { deleteMode } = useSelector((state) => state.chat);
    const dispatch = useDispatch();

    const toggleDropdown = (event) => {
        event.stopPropagation();

        setShowDropdown(!showDropdown);
    };

    return (
        <div className="flex items-center h-[40px] justify-between">
            <div className="flex items-center">
                {/* back arrow */}
                <Icon className="mr-2 -ml-2" onClick={() => router.back()}>
                    <ArrowLeftIcon className="icon" />
                </Icon>

                {/* chat user avatar */}
                <Avatar avatar={user?.avatar} small />

                {/* chat user name and email */}
                <div className="flex items-center space-x-3">
                    <div className="flex flex-col ml-3 leading-tight">
                        <span className="capitalize black-white">
                            {capitalizeAll(user?.fullName)}
                        </span>

                        <span className="text-sm dark-light">
                            {user?.email}
                        </span>
                    </div>

                    {user?.isDeliveryPersonnel && <Tag text="delivery" />}

                    {user?.isAdmin && <Tag text="admin" />}
                </div>
            </div>

            <div className="flex items-center">
                <Icon onClick={toggleDropdown}>
                    <MenuAlt4Icon className="icon" />
                </Icon>

                <Dropdown show={showDropdown} toggleDropdown={toggleDropdown}>
                    <DropdownItem hasAction={false}>
                        <Switch
                            switchedOn={deleteMode}
                            label="delete mode"
                            onToggle={() => dispatch(toggleDeleteMode())}
                        />
                    </DropdownItem>
                </Dropdown>
            </div>
        </div>
    );
};

export default ChatHeader;
