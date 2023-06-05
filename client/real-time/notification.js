import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
    addNotification,
    resetPageSize,
    setError,
    setLoading,
    setLoadingMore,
    setNeedToFetch,
    setNoMoreData,
    setNotifications,
    setTotalCount,
} from "../redux/slices/notifications-slice";
import { fetcher } from "../lib/fetcher";
import useSocket from "../hooks/use-socket";

const Notification = () => {
    const { authUser } = useSelector((state) => state.auth);
    const {
        notifications,
        needToFetch,
        page,
        loading,
        loadingMore,
        addedNotificationsCount,
        PAGE_SIZE,
    } = useSelector((state) => state.notifications);

    const dispatch = useDispatch();
    const socket = useSocket();

    useEffect(() => {
        dispatch(setNeedToFetch(true));
    }, [page]);

    useEffect(() => {
        socket.on("notification", (notification) => {
            if (
                (authUser?.isDeliveryPersonnel &&
                    notification.destinationId === 0) ||
                (!authUser?.isDeliveryPersonnel &&
                    notification.destinationId === authUser?.id)
            ) {
                dispatch(addNotification({ notification }));
            }
        });

        if (needToFetch) {
            getUserNotifications();
        }
    }, [authUser, needToFetch]);

    const getUserNotifications = async () => {
        if (page > 1) {
            dispatch(setLoadingMore(true));
        } else {
            dispatch(setLoading(true));
        }

        if (loading || loadingMore) {
            return;
        }

        try {
            const data = await fetcher(
                `notifications/?page=${page}&skip=${addedNotificationsCount}`
            );

            if (page === 1) {
                dispatch(setNotifications(data.notifications));
            } else {
                dispatch(
                    setNotifications([...notifications, ...data.notifications])
                );
            }

            if (data.notifications.length < PAGE_SIZE) {
                dispatch(setNoMoreData(true));
            }

            if (page === 1) {
                dispatch(setTotalCount(data.totalCount));
            }

            dispatch(resetPageSize());
        } catch (error) {
            dispatch(setError(error.message));
        } finally {
            dispatch(setLoading(false));
            dispatch(setLoadingMore(false));
        }
    };
    return <div></div>;
};

export default Notification;
