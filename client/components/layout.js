import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";

import { fetcher } from "../lib/fetcher";
import { setCategories } from "../redux/slices/categories-slice";

import Header from "./header";
import Sidebar from "./sidebar";
import Modal from "./modal";
import AlertsContainer from "./alerts-container";
import PopupGallery from "./popup-gallery";
import Products from "../cache/products";
import Notification from "../real-time/notification";
import Rating from "../real-time/rating";

const Layout = ({ children }) => {
    const { authUser } = useSelector((state) => state.auth);
    const { theme } = useSelector((state) => state.theme);

    const router = useRouter();
    const dispatch = useDispatch();

    const unprotectedPaths = [
        "/",
        "/signin",
        "/signup",
        "/account-recovery/request",
        "/account-recovery/verify",
    ];
    const unverifiedAccessiblePaths = ["/profile", "/account-verification"];

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
    }, [authUser, router, unprotectedPaths, unverifiedAccessiblePaths]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await fetcher("categories");
            dispatch(setCategories(data.categories));
        } catch (error) {}
    };

    return (
        <main className={theme === "dark" && "dark"}>
            <section className="min-h-screen dark:bg-gray-seven">
                <PopupGallery />
                <Modal />
                <Header />

                {authUser?.isVerified && (
                    <>
                        {/* fake components for real time  */}
                        <Notification />
                        <Rating />

                        {/* fake components to preserve cache */}
                        <Products />
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
