import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import Head from "next/head";

import Button from "../components/button";

const Home = () => {
    const { authUser } = useSelector((state) => state.auth);
    const router = useRouter();

    useEffect(() => {
        if (authUser) {
            if (!authUser?.isDeliveryPersonnel) {
                router.push("/products");
            }

            if (authUser?.isDeliveryPersonnel) {
                router.push("/delivery");
            }

            if (authUser?.isAdmin) {
                router.push("/statistics");
            }
        }
    }, [authUser]);

    return (
        <section className="wrapper">
            <Head>
                <title>Echo</title>
            </Head>

            <div className="flex pt-[20px] justify-center h-[calc(100vh-80px)] relative">
                <div className="mr-12">
                    <h1 className="text-4xl font-bold text-gray-700 mb-3 tracking-wide mt-[75px]">
                        <span className="text-blue-three font-extrabold">
                            Buy
                        </span>{" "}
                        and{" "}
                        <span className="text-blue-three font-extrabold">
                            Sell
                        </span>{" "}
                        Online
                    </h1>

                    <div className="max-w-[450px] space-y-1 text-gray-800 mb-5">
                        <p>
                            Welcome to{" "}
                            <span className="text-blue-three font-semibold">
                                Echo
                            </span>
                            . This is a platform for you to{" "}
                            <span className="text-blue-three font-semibold">
                                buy
                            </span>{" "}
                            and
                            <span className="text-blue-three font-semibold">
                                {" "}
                                sell
                            </span>{" "}
                            products online.
                        </p>

                        <p>
                            You can chat with other users, keep track of your
                            orders and transactions, get notified about actions
                            and events in real-time and much more.
                        </p>
                    </div>

                    <div className="flex items-center space-x-5">
                        <Button
                            rounded={false}
                            onClick={() => router.push("/signup")}
                        >
                            Get Started
                        </Button>
                        <Button
                            type="secondary"
                            rounded={false}
                            onClick={() => router.push("/signin")}
                        >
                            Sign In
                        </Button>
                    </div>
                </div>

                <div>
                    <img src="/images/landing.jpg" className="h-[400px]" />
                </div>
            </div>
        </section>
    );
};

export default Home;
