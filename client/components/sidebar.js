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
    UserCircleIcon,
} from "@heroicons/react/outline";
import { MdOutlineExplore, MdExplore, MdOutlineHistory } from "react-icons/md";
import { AiOutlineShop, AiFillShop } from "react-icons/ai";
import { HiOutlineCash } from "react-icons/hi";

import { setSidebar } from "../redux/slices/sidebar-slice";
import { showConfirmationModal } from "../redux/slices/modal-slice";
import { signUserOut } from "../redux/slices/auth-slice";

import ThemeToggler from "./theme-toggler";
import SidebarItem from "./sidebar-item";

const Sidebar = () => {
    const { authUser } = useSelector((state) => state.auth);
    const { showSidebar } = useSelector((state) => state.sidebar);
    const { notifications } = useSelector((state) => state.notifications);
    const { sellerOrders } = useSelector((state) => state.orders);

    const [counts, setCounts] = useState({});
    const [notificationsCount, setNotificationsCount] = useState(0);
    const [ordersCount, setOrdersCount] = useState(0);
    const [chatsCount, setChatsCount] = useState(0);
    const [transactionsCount, setTransactionsCount] = useState(0);
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
        },
        {
            name: "sell on echo",
            linkTo: "/sell-products",
            icon: <HiOutlineCash className="icon-sidebar" />,
        },

        {
            name: "chats",
            linkTo: "/chats",
            count: 0,
            icon: <ChatAlt2Icon className="icon-sidebar" />,

            countFlat: true,
        },
        {
            name: "notifications",
            linkTo: "/notifications",
            count: 0,
            icon: <BellIcon className="icon-sidebar" />,
        },
        {
            name: "cart",
            linkTo: "/cart",
            count: 0,
            icon: <ShoppingCartIcon className="icon-sidebar" />,
            countFlat: true,
        },
        {
            name: "orders",
            linkTo: "/orders",
            // linkTo: "/orders/?show=shop",
            icon: <ClipboardListIcon className="icon-sidebar" />,
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
            name: "seller profile",
            linkTo: `sellers/${authUser?.store?.id}`,
            icon: <UserCircleIcon className="icon-sidebar" />,
        },
        {
            name: "profile",
            // linkTo: "/profile/?show=details",
            linkTo: "/profile",
            icon: <UserIcon className="icon-sidebar" />,
            activePath: "/profile",
        },
        {
            name: "sign out",
            linkTo: "/signin",
            icon: <LogoutIcon className="icon-sidebar" />,
        },
    ]);

    useEffect(() => {
        // unseen notifications count
        let unseenCount = 0;

        notifications.forEach((notification) => {
            if (!notification.seen) {
                unseenCount++;
            }
        });

        setNotificationsCount(unseenCount);
    }, [notifications]);

    useEffect(() => {
        // orders count
        let unacknowledgedCount = 0;
        sellerOrders.forEach((sellerOrder) => {
            if (!sellerOrder.isAcknowledged) {
                unacknowledgedCount++;
            }
        });

        setOrdersCount(unacknowledgedCount);
    }, [sellerOrders]);

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
                if (link.name === "sell on echo") {
                    // do not show if business already verified
                    if (authUser?.store?.business?.isVerified) {
                        return null;
                    }
                }

                return (
                    <SidebarItem
                        key={link.name}
                        name={link.name}
                        count={
                            link.name === "notifications"
                                ? notificationsCount
                                : link.name === "orders"
                                ? ordersCount
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
