import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";

import { fetcher } from "../lib/fetcher";
import { setCategories } from "../redux/slices/categories-slice";
import { updateAuthUser } from "../redux/slices/auth-slice";

import Header from "./header";
import Sidebar from "./sidebar";
import Modal from "./modal";
import AlertsContainer from "./alerts-container";
import PopupGallery from "./popup-gallery";
import Products from "../cache/products";
import Notification from "../real-time/notification";
import Rating from "../real-time/rating";
import Chat from "../real-time/chat";
import Order from "../real-time/order";
import Delivery from "../real-time/delivery";
import Business from "../real-time/business";
import Category from "../real-time/category";
import Report from "../real-time/report";
import Transaction from "../real-time/transaction";

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
  const deliveryPaths = [
    "/delivery",
    "/delivery",
    "/notifications",
    "/chats",
    "/chats/[id]",
    "/sellers/[id]",
    ...unprotectedPaths,
    ...unverifiedAccessiblePaths,
  ];

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

    // restrict most of the application routes to delivery personnel
    if (authUser?.isDeliveryPersonnel) {
      if (deliveryPaths.indexOf(router.pathname) === -1) {
        console.log(router.pathname);
        router.push("/delivery");
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

  const fetchSelfDetails = async () => {
    try {
      const data = await fetcher("users");

      dispatch(updateAuthUser({ ...data.user }));
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
            {!authUser?.isDeliveryPersonnel && <Rating />}
            <Chat />
            <Order />
            <Transaction />
            {authUser?.isDeliveryPersonnel && <Delivery />}
            <Business />
            <Category />
            {authUser?.isAdmin && <Report />}

            {/* fake components to preserve cache */}
            {!authUser?.isDeliveryPersonnel && <Products />}
          </>
        )}

        <section className={authUser && "wrapper relative"}>
          {authUser && <Sidebar />}

          <section
            className={`py-2 ${authUser && "1000:ml-[200px] 1000:pl-7 "}`}
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
