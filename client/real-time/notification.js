import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  resetPageSize,
  setError,
  setLoading,
  setLoadingMore,
  setNeedToFetch,
  setNoMoreData,
  setNotifications,
} from "../redux/slices/notifications-slice";
import { fetcher } from "../lib/fetcher";

const Notification = () => {
  const { authUser } = useSelector((state) => state.auth);
  const {
    notifications,
    needToFetch,
    soundCounter,
    page,
    loading,
    loadingMore,
    addedNotificationsCount,
  } = useSelector((state) => state.notifications);

  const dispatch = useDispatch();

  const PAGE_SIZE = 25;

  useEffect(() => {
    dispatch(setNeedToFetch(true));
  }, [page]);

  useEffect(() => {
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

      console.log(data);
      if (page === 1) {
        dispatch(setNotifications(data.notifications));
      } else {
        dispatch(setNotifications([...notifications, ...data.notifications]));

        if (data.notifications.PAGE_SIZE < 25) {
          dispatch(setNoMoreData(true));
        }
      }

      dispatch(resetPageSize());
    } catch (error) {
      console.log(error.message);
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
      dispatch(setLoadingMore(false));
    }
  };
  return <div></div>;
};

export default Notification;
