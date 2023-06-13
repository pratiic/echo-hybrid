import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
    addCategoryRequest,
    setCategories,
    setNeedToFetch,
    setRequestsProp,
} from "../redux/slices/categories-slice";
import { fetcher } from "../lib/fetcher";
import useSocket from "../hooks/use-socket";

const Category = () => {
    const {
        needToFetch,
        requests: { needToFetchRequests },
    } = useSelector((state) => state.categories);
    const { authUser } = useSelector((state) => state.auth);

    const dispatch = useDispatch();
    const socket = useSocket();

    useEffect(() => {
        if (needToFetch) {
            fetchCategories();
        }
    }, [needToFetch]);

    useEffect(() => {
        if (needToFetchRequests) {
            fetchCategoryRequests();
        }
    }, [needToFetchRequests]);

    useEffect(() => {
        socket.on("category-request", (requestedCategory) => {
            dispatch(addCategoryRequest(requestedCategory));
        });

        socket.on("category-request-accpet", () => {
            dispatch(setNeedToFetch(true));
        });
    }, []);

    const setProp = (prop, value) => {
        dispatch(setRequestsProp({ prop, value }));
    };

    const fetchCategories = async () => {
        try {
            const data = await fetcher("categories");
            dispatch(setCategories(data.categories));
        } catch (error) {}
    };

    const fetchCategoryRequests = async () => {
        if (!authUser?.isAdmin) {
            // non-admin users are not allowed access to category requests
            return;
        }

        setProp("loading", true);

        try {
            const data = await fetcher("categories/requests");

            setProp("list", data.requests);
        } catch (error) {
            setProp("error", error.message);
        } finally {
            setProp("loading", false);
        }
    };

    return <></>;
};

export default Category;
