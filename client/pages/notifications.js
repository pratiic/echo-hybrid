import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Head from "next/head";

import {
    deleteAllNotifications,
    seeNotifications,
    setPage,
} from "../redux/slices/notifications-slice";
import { fetcher } from "../lib/fetcher";
import {
    closeModal,
    showConfirmationModal,
    showLoadingModal,
} from "../redux/slices/modal-slice";
import { setAlert, setErrorAlert } from "../redux/slices/alerts-slice";

import PageHeader from "../components/page-header";
import ContentList from "../components/content-list";

const Notifications = () => {
    const {
        notifications,
        loading,
        loadingMore,
        error,
        noMoreData,
        page,
        PAGE_SIZE,
    } = useSelector((state) => state.notifications);
    const { authUser } = useSelector((state) => state.auth);

    const dispatch = useDispatch();

    useEffect(() => {
        if (notifications.find((notification) => !notification.seen)) {
            seeUserNotifications();
        }
    }, [notifications]);

    const seeUserNotifications = async () => {
        try {
            await fetcher("notifications", "PATCH");
            dispatch(seeNotifications());
        } catch (error) {}
    };

    const controlPageNumber = () => {
        dispatch(setPage(page + 1));
    };

    const handleAllDeletion = () => {
        if (notifications.length > 0) {
            dispatch(
                showConfirmationModal({
                    message:
                        "Are you sure you want to delete all notifications?",
                    handler: async () => {
                        dispatch(
                            showLoadingModal("deleting all notifications...")
                        );

                        try {
                            await fetcher("notifications", "DELETE");

                            dispatch(deleteAllNotifications());
                            dispatch(
                                setAlert({
                                    message: "notifications deleted",
                                    type: "success",
                                })
                            );
                        } catch (error) {
                            dispatch(setErrorAlert(error.message));
                        } finally {
                            dispatch(closeModal());
                        }
                    },
                })
            );
        } else {
            return;
        }
    };

    const getPageTitle = () => {
        return authUser?.isDeliveryPersonnel
            ? "Delivery notifications"
            : "Your notifications";
    };

    const getEmptyMsg = () => {
        return authUser?.isDeliveryPersonnel
            ? "there are no delivery notifications"
            : "you don't have any notifications";
    };

    return (
        <section>
            <Head>
                <title> {getPageTitle()} </title>
            </Head>

            <PageHeader heading={getPageTitle()} hasBackArrow>
                <p
                    className="text-red-500 underline-offset-4 font-semibold hover:underline hover:cursor-pointer active:text-red-400 transition-all duration-200"
                    onClick={handleAllDeletion}
                >
                    Delete All
                </p>
            </PageHeader>

            <div
                className={`-mt-2 ${
                    notifications?.length > 0
                        ? "w-fit mx-auto 700:mx-0"
                        : "w-full"
                }`}
            >
                <ContentList
                    list={notifications}
                    type="notification"
                    loadingMsg={loading && "loading notifications..."}
                    error={error}
                    emptyMsg={getEmptyMsg()}
                    human="no-notifications"
                    incrementPageNumber={
                        !noMoreData &&
                        notifications.length >= PAGE_SIZE &&
                        controlPageNumber
                    }
                    loadingMore={loadingMore}
                />
            </div>
        </section>
    );
};

export default Notifications;
