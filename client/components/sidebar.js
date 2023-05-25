import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import {
    UserIcon,
    ShoppingCartIcon,
    LogoutIcon,
    ChatAlt2Icon,
    BellIcon,
    ShoppingBagIcon,
    ClipboardListIcon,
} from "@heroicons/react/outline";
import {
    ShoppingBagIcon as ShoppingBagSolidIcon,
    ChatAlt2Icon as ChatAlt2SolidIcon,
    BellIcon as BellSolidIcon,
    ShoppingCartIcon as ShoppingCartSolidIcon,
    ClipboardListIcon as ClipboardListSolidIcon,
    UserIcon as UserSolidIcon,
    LogoutIcon as LogoutSolidIcon,
} from "@heroicons/react/solid";
import { MdOutlineExplore, MdExplore, MdOutlineHistory } from "react-icons/md";
import { AiOutlineShop, AiFillShop } from "react-icons/ai";
import { HiOutlineCash } from "react-icons/hi";

import { setSidebar } from "../redux/slices/sidebar-slice";
import { showConfirmationModal } from "../redux/slices/modal-slice";
import { signUserOut } from "../redux/slices/auth-slice";

import ThemeToggler from "./theme-toggler";
import SidebarItem from "./sidebar-item";

const Sidebar = () => {
    const { authuser } = useSelector((state) => state.auth);
    const { showSidebar } = useSelector((state) => state.sidebar);

    const [counts, setCounts] = useState({});
    const [notificationsCount, setNotificationsCount] = useState(0);
    const [ordersCount, setOrdersCount] = useState(0);
    const [chatsCount, setChatsCount] = useState(0);
    const [transactionsCount, setTransactionsCount] = useState(0);
    const [cartCount, setCartCount] = useState(0);
    const [activeLink, setActiveLink] = useState("");

    const router = useRouter();
    const dispatch = useDispatch();

    const [links, setLinks] = useState([
        {
            name: "products",
            linkTo: "/products",
            icon: <MdOutlineExplore className="icon-sidebar" />,
        },
        {
            name: "sellers",
            linkTo: "/sellers",
            icon: <AiOutlineShop className="icon-sidebar" />,
            activeIcon: <AiFillShop className="icon-sidebar" />,
        },
        {
            name: "sell products",
            linkTo: "/sell-products",
            icon: <HiOutlineCash className="icon-sidebar" />,
        },
        {
            name: "my sales",
            linkTo: "/my-sales",
            icon: <ShoppingBagIcon className="icon-sidebar" />,
            activeIcon: (
                <ShoppingBagSolidIcon className="icon-sidebar-active" />
            ),
        },
        {
            name: "chats",
            linkTo: "/chats",
            count: 0,
            icon: <ChatAlt2Icon className="icon-sidebar" />,
            activeIcon: <ChatAlt2SolidIcon className="icon-sidebar" />,
            countFlat: true,
        },
        {
            name: "notifications",
            linkTo: "/notifications",
            count: 0,
            icon: <BellIcon className="icon-sidebar" />,
            activeIcon: <BellSolidIcon className="icon-sidebar" />,
        },
        {
            name: "cart",
            linkTo: "/cart",
            count: 0,
            icon: <ShoppingCartIcon className="icon-sidebar" />,
            activeIcon: <ShoppingCartSolidIcon className="icon-sidebar" />,
            countFlat: true,
        },
        {
            name: "orders",
            linkTo: "/orders",
            // linkTo: "/orders/?show=shop",
            icon: <ClipboardListIcon className="icon-sidebar" />,
            activeIcon: <ClipboardListSolidIcon className="icon-sidebar" />,
            count: 0,
            activePath: "/orders",
        },
        // {
        //     name: "transactions",
        //     linkTo: "/transactions/?show=user",

        //     linkTo: "/transactions",
        //     icon: <MdOutlineHistory className="icon-sidebar" />,
        //     count: 0,
        //     activePath: "/transactions",
        // },
        {
            name: "profile",
            // linkTo: "/profile/?show=details",
            linkTo: "/profile",
            icon: <UserIcon className="icon-sidebar" />,
            activeIcon: <UserSolidIcon className="icon-sidebar" />,
            activePath: "/profile",
        },
        {
            name: "sign out",
            linkTo: "/signin",
            icon: <LogoutIcon className="icon-sidebar" />,
        },
    ]);

    useEffect(() => {
        for (let link of links) {
            if (
                router.pathname === link.activePath ||
                router.pathname === link.linkTo
            ) {
                setActiveLink(link.name);
                break;
            }

            setActiveLink("");
        }
    }, [router]);

    console.log(activeLink);

    const handleLinkClick = (name, link) => {
        if (showSidebar) {
            dispatch(setSidebar(false));
        }

        if (name === "sign out") {
            return dispatch(
                showConfirmationModal({
                    message: "are you sure you want to sign out?",
                    handler: () => {
                        dispatch(signUserOut());
                    },
                })
            );
        }

        router.push(link);
    };

    return (
        <nav
            className={`px-[30px] 1000:px-0 border-r border-faint pt-4 1000:w-[200px] left-0 1000:left-auto h-[calc(100vh-64px)] fixed overflow-y-scroll transition-scale origin-left duration-300 first:pt-0 last:pb-0 scrollbar-hide ${
                showSidebar
                    ? "z-30 bg-white dark:bg-gray-seven"
                    : "1000:scale-x-100 scale-x-0"
            }`}
        >
            <ThemeToggler />

            {links.map((link) => {
                return (
                    <SidebarItem
                        key={link.name}
                        name={link.name}
                        count={
                            link.name === "notifications"
                                ? notificationsCount
                                : link.name === "orders"
                                ? ordersCount
                                : link.name === "chats"
                                ? chatsCount
                                : link.name === "transactions"
                                ? transactionsCount
                                : link.name === "cart"
                                ? cartCount
                                : 0
                        }
                        active={activeLink === link.name}
                        link={link.linkTo}
                        countFlat={link.countFlat}
                        onClick={handleLinkClick}
                    >
                        {link.icon}
                    </SidebarItem>
                );
            })}
        </nav>
    );
};

export default Sidebar;
