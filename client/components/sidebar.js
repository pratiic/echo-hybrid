import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import {
    UserIcon,
    ShoppingCartIcon,
    LogoutIcon,
    ChatAlt2Icon,
    BellIcon,
    ClipboardListIcon,
    UserCircleIcon,
    ClipboardCheckIcon,
    ChartBarIcon,
    FlagIcon,
    ExclamationCircleIcon,
} from "@heroicons/react/outline";
import {
    MdOutlineExplore,
    MdOutlineHistory,
    MdOutlineDeliveryDining,
} from "react-icons/md";
import { AiOutlineShop } from "react-icons/ai";
import { HiOutlineCash } from "react-icons/hi";
import { BiCategory } from "react-icons/bi";

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
    const { completed } = useSelector((state) => state.delivery);
    const { chats } = useSelector((state) => state.chat);
    const { requests } = useSelector((state) => state.categories);
    const { reports } = useSelector((state) => state.reports);

    const [notificationsCount, setNotificationsCount] = useState(0);
    const [ordersCount, setOrdersCount] = useState(0);
    const [chatsCount, setChatsCount] = useState(0);
    const [transactionsCount, setTransactionsCount] = useState(0);
    const [pendingDeliveriesCount] = useState(0);
    const [completedDeliveriesCount, setCompletedDeliveriesCount] = useState(0);
    const [categoryRequestsCount, setCategoryRequestsCount] = useState(0);
    const [reportsCount, setReportsCount] = useState(0);
    const [activeLink, setActiveLink] = useState("");
    const [linksToRender, setLinksToRender] = useState([]);

    const router = useRouter();
    const dispatch = useDispatch();

    const [commonLinks, setCommonLinks] = useState([
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
            name: "sign out",
            linkTo: "/signin",
            icon: <LogoutIcon className="icon-sidebar" />,
        },
    ]);

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
        ...commonLinks.slice(0, 2),
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
            icon: <UserCircleIcon className="icon-sidebar" />,
        },
        {
            name: "profile",
            // linkTo: "/profile/?show=details",
            linkTo: "/profile",
            icon: <UserIcon className="icon-sidebar" />,
            activePath: "/profile",
        },
        commonLinks[commonLinks.length - 1],
    ]);

    const [deliveryLinks, setDeliveryLinks] = useState([
        {
            name: "pending",
            linkTo: "/delivery/?show=pending",
            icon: <MdOutlineDeliveryDining className="icon-sidebar" />,
            activePath: "/delivery?show=pending",
        },
        {
            name: "completed",
            linkTo: "/delivery/?show=completed",
            icon: <ClipboardCheckIcon className="icon-sidebar" />,
            activePath: "/delivery?show=completed",
        },
        ...commonLinks,
    ]);

    const adminLinks = [
        {
            name: "statistics",
            linkTo: "/statistics",
            icon: <ChartBarIcon className="icon-sidebar" />,
        },
        {
            name: "businesses",
            linkTo: "/business-requests",
            icon: <AiOutlineShop className="icon-sidebar" />,
        },
        {
            name: "categories",
            linkTo: "/category-requests",
            icon: <BiCategory className="icon-sidebar" />,
        },
        {
            name: "reports",
            linkTo: "/reports",
            icon: <FlagIcon className="icon-sidebar" />,
        },
        {
            name: "suspensions",
            linkTo: "/suspensions",
            icon: <ExclamationCircleIcon className="icon-sidebar" />,
        },
        ...commonLinks,
    ];

    useEffect(() => {
        setLinksToRender(
            authUser?.isDeliveryPersonnel
                ? deliveryLinks
                : authUser?.isAdmin
                ? adminLinks
                : links
        );
    }, [authUser]);

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
        let unacknowledgedCount = 0;

        completed.forEach((delivery) => {
            if (!delivery.isAcknowledged) {
                unacknowledgedCount++;
            }
        });

        setCompletedDeliveriesCount(unacknowledgedCount);
    }, [completed]);

    useEffect(() => {
        let unseenChatCount = 0;

        chats.forEach((chat) => {
            if (chat.unseenMsgsCounts && chat.unseenMsgsCounts[authUser?.id]) {
                unseenChatCount++;
            }
        });

        setChatsCount(unseenChatCount);
    }, [chats, authUser]);

    useEffect(() => {
        let categoryRequestsCount = 0;

        requests.list.forEach((request) => {
            if (!request.isAcknowledged) {
                categoryRequestsCount++;
            }
        });

        setCategoryRequestsCount(categoryRequestsCount);
    }, [requests.list]);

    useEffect(() => {
        let unacknowledgedCount = 0;

        reports.forEach((report) => {
            if (!report.isAcknowledged) {
                unacknowledgedCount++;
            }
        });

        setReportsCount(unacknowledgedCount);
    }, [reports]);

    useEffect(() => {
        for (let link of linksToRender) {
            if (
                router.pathname === link.activePath ||
                router.pathname === link.linkTo ||
                router.asPath === link.linkTo ||
                router.asPath === link.activePath
            ) {
                setActiveLink(link.name);
                break;
            }

            setActiveLink("");
        }
    }, [router, linksToRender]);

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

            {linksToRender.map((link) => {
                if (link.name === "sell on echo") {
                    // do not show if store type is IND or business is already verified
                    if (
                        authUser?.store?.storeType === "IND" ||
                        authUser?.store?.business?.isVerified
                    ) {
                        return null;
                    }
                }

                if (link.name === "seller profile") {
                    // do not show if the user is not registered as a seller or business is not verified
                    if (
                        !authUser?.store ||
                        (authUser?.store?.storeType === "IND" &&
                            !authUser?.store) ||
                        (authUser?.store?.storeType === "BUS" &&
                            !authUser?.store?.business?.isVerified)
                    ) {
                        return null;
                    }

                    link.linkTo = `/sellers/${authUser?.store?.id}`;
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
                                : link.name === "delivery/?show=pending"
                                ? pendingDeliveriesCount
                                : link.name === "completed"
                                ? completedDeliveriesCount
                                : link.name === "chats"
                                ? chatsCount
                                : link.name === "categories"
                                ? categoryRequestsCount
                                : link.name === "reports"
                                ? reportsCount
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
