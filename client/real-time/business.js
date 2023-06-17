import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import {
    addRequest,
    deleteRequest,
    setBusinessesProp,
} from "../redux/slices/businesses-slice";
import { fetcher } from "../lib/fetcher";
import useSocket from "../hooks/use-socket";
import { updateAuthUser } from "../redux/slices/auth-slice";

const Business = () => {
    const {
        requests,
        needToFetch,
        loading,
        loadingMore,
        page,
        addedRequestsCount,
        PAGE_SIZE,
    } = useSelector((state) => state.businesses);
    const { authUser } = useSelector((state) => state.auth);

    const dispatch = useDispatch();
    const socket = useSocket();

    useEffect(() => {
        if (needToFetch) {
            fetchBusinessRequests();
        }
    }, [needToFetch]);

    useEffect(() => {
        setProp("needToFetch", true);
    }, [page]);

    useEffect(() => {
        socket.on("business-request", (business) => {
            dispatch(addRequest(business));
        });

        socket.on("business-registation-cancellation", (businessId) => {
            dispatch(deleteRequest(businessId));
        });
    }, []);

    useEffect(() => {
        socket.on("business-request-accept", (businessId) => {
            if (businessId === authUser?.store?.business?.id) {
                dispatch(
                    updateAuthUser({
                        store: {
                            ...authUser?.store,
                            business: {
                                ...authUser?.store?.business,
                                isVerified: true,
                            },
                        },
                    })
                );
            }
        });

        socket.on("business-request-reject", (businessId) => {
            if (businessId === authUser?.store?.business?.id) {
                dispatch(
                    updateAuthUser({
                        store: null,
                    })
                );
            }
        });
    }, [authUser]);

    const setProp = (prop, value) => {
        dispatch(setBusinessesProp({ prop, value }));
    };

    const fetchBusinessRequests = async () => {
        if (!authUser?.isAdmin || loading || loadingMore) {
            // non-admin users do not need business registration requests
            return;
        }

        setProp(page === 1 ? "loading" : "loadingMore", true);

        try {
            const data = await fetcher(
                `businesses/requests/?page=${page}&skip=${addedRequestsCount}`
            );

            setProp(
                "requests",
                page === 1 ? data.requests : [...requests, ...data.requests]
            );

            if (data.requests.length < PAGE_SIZE) {
                setProp("noMoreData", true);
            }

            if (page === 1) {
                setProp("totalCount", data.totalCount);
            }
        } catch (error) {
            setProp("error", error.message);
        } finally {
            setProp("loading", false);
            setProp("loadingMore", false);
        }
    };

    return <></>;
};

export default Business;
