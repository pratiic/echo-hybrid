import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";

import { fetcher } from "../lib/fetcher";
import { signUserOut, updateAuthUser } from "../redux/slices/auth-slice";
import useSocket from "../hooks/use-socket";

import Header from "./header";
import Sidebar from "./sidebar";
import Modal from "./modal";
import AlertsContainer from "./alerts-container";
import PopupGallery from "./popup-gallery";
import Product from "../cache/product";
import Notification from "../real-time/notification";
import Rating from "../real-time/rating";
import Chat from "../real-time/chat";
import Order from "../real-time/order";
import Delivery from "../real-time/delivery";
import Business from "../real-time/business";
import Category from "../real-time/category";
import Report from "../real-time/report";
import Transaction from "../real-time/transaction";
import Suspension from "../cache/suspension";
import DeliveryPersonnel from "../cache/delivery-personnel";

const Layout = ({ children }) => {
    const { authUser } = useSelector((state) => state.auth);
    const { theme } = useSelector((state) => state.theme);

    const router = useRouter();
    const dispatch = useDispatch();
    const socket = useSocket();

    const unprotectedPaths = [
        "/",
        "/signin",
        "/signup",
        "/account-recovery/request",
        "/account-recovery/verify",
    ];
    const unverifiedAccessiblePaths = ["/profile", "/account-verification"];
    const deliveryPaths = [
        "/delivery",
        "/notifications",
        "/chats",
        "/chats/[id]",
        "/sellers/[id]",
        "/products/[id]",
        ...unprotectedPaths,
        ...unverifiedAccessiblePaths,
    ];
    const adminRestrictedPaths = [
        "/cart",
        "/orders",
        "/transactions",
        "/sell-products",
        "/business-registration",
    ];
    const suspendedAccessiblePaths = ["/profile", "/suspended"];

    useEffect(() => {
        if (!authUser) {
            if (unprotectedPaths.indexOf(router.pathname) !== -1) {
                return;
            }

            router.push("/");
        }

        if (!authUser?.isVerified) {
            if (unverifiedAccessiblePaths.indexOf(router.pathname) === -1) {
                router.push("/account-verification");
            }
        }

        if (authUser?.suspension) {
            if (suspendedAccessiblePaths.indexOf(router.pathname) === -1) {
                router.push("/suspended");
            }
        }

        // restrict most of the application routes to delivery personnel
        if (authUser?.isDeliveryPersonnel && !authUser?.suspension) {
            if (deliveryPaths.indexOf(router.pathname) === -1) {
                router.push("/delivery");
            }
        }

        if (authUser?.isAdmin && !authUser?.suspension) {
            if (adminRestrictedPaths.indexOf(router.pathname) !== -1) {
                router.push("/statistics");
            }
        }
    }, [
        authUser,
        router,
        unprotectedPaths,
        unverifiedAccessiblePaths,
        deliveryPaths,
    ]);

    useEffect(() => {
        fetchSelfDetails();
    }, []);

    useEffect(() => {
        socket.on("user-delete", (userId) => {
            // if the account is deleted while using the application
            // happens in case of delivery personnel

            if (userId === authUser?.id) {
                dispatch(signUserOut());
            }
        });
    }, [authUser]);

    const fetchSelfDetails = async () => {
        try {
            const data = await fetcher("users");

            dispatch(updateAuthUser({ ...data.user }));
        } catch (error) {
            if (error.statusCode === 404) {
                // user has been deleted
                dispatch(signUserOut());
            }
        }
    };

    return (
        <main className={theme === "dark" && "dark"}>
            <section className="min-h-screen dark:bg-gray-seven">
                <PopupGallery />
                <Modal />
                <Header />

                {authUser?.isVerified && (
                    <>
                        {/* fake components for real time and to preserve cache  */}
                        {!authUser?.isAdmin && (
                            <React.Fragment>
                                <Notification />
                                <Order />
                            </React.Fragment>
                        )}
                        {!authUser?.isAdmin &&
                            !authUser?.isDeliveryPersonnel && <Transaction />}
                        {authUser?.isDeliveryPersonnel && <Delivery />}
                        {!authUser?.isDeliveryPersonnel && <Business />}
                        {authUser?.isAdmin && (
                            <React.Fragment>
                                <Report />
                                <Suspension />
                                <DeliveryPersonnel />
                            </React.Fragment>
                        )}
                        <Rating />
                        <Chat />
                        <Category />
                        <Product />
                    </>
                )}

                <section className={authUser && "wrapper relative"}>
                    {authUser && <Sidebar />}

                    <section
                        className={`py-2 ${authUser &&
                            "1000:ml-[200px] 1000:pl-7 "}`}
                    >
                        {children}
                        <AlertsContainer />
                    </section>
                </section>
            </section>
        </main>
    );
};

export default Layout;
