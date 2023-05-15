import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";

import Header from "./header";
import Sidebar from "./sidebar";

const Layout = ({ children }) => {
    const { authUser } = useSelector((state) => state.auth);

    const router = useRouter();

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

            router.push("/signin");
        }

        if (!authUser?.isVerified) {
            if (unverifiedAccessiblePaths.indexOf(router.pathname) === -1) {
                router.push("/account-verification");
            }
        }
    }, [authUser, router, unprotectedPaths, unverifiedAccessiblePaths]);

    return (
        <main>
            <section className="min-h-screen dark:bg-gray-seven">
                <Header />

                <section className={authUser && "wrapper relative"}>
                    {authUser && <Sidebar />}

                    <section
                        className={`py-2 ${authUser &&
                            "1000:ml-[200px] 1000:pl-7 "}`}
                    >
                        {children}
                        {/* <AlertsContainer /> */}
                    </section>
                </section>
            </section>
        </main>
    );
};

export default Layout;
