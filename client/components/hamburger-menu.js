import React from "react";
import { CgMenu } from "react-icons/cg";
import { XIcon } from "@heroicons/react/outline";
import { useDispatch, useSelector } from "react-redux";

import Icon from "./icon";
import { setSidebar } from "../redux/slices/sidebar-slice";

const HamburgerMenu = () => {
    const { showSidebar } = useSelector((state) => state.sidebar);

    const dispatch = useDispatch();

    const handleHamburgerClick = () => {
        dispatch(setSidebar(!showSidebar));
    };

    return (
        <Icon
            className="mr-1 500:mr-2 -ml-2 1000:hidden "
            onClick={handleHamburgerClick}
        >
            {!showSidebar && <CgMenu className="icon" />}
            {showSidebar && <XIcon className="icon" />}
        </Icon>
    );
};

export default HamburgerMenu;
