import { useEffect } from "react";
import Head from "next/head";

import { useSelector, useDispatch } from "react-redux";
import { fetcher } from "../lib/fetcher";
import { acknowledgeCategoryRequests } from "../redux/slices/categories-slice";
import { showGenericModal } from "../redux/slices/modal-slice";

import PageHeader from "../components/page-header";
import ContentList from "../components/content-list";
import CategoryAdder from "../components/category-adder";

const CategoryRequests = () => {
    const {
        requests: { list: requestsList, loading, error },
    } = useSelector((state) => state.categories);

    const dispatch = useDispatch();

    useEffect(() => {
        if (requestsList.find((request) => !request.isAcknowledged)) {
            acknowledgeRequests();
        }
    }, [requestsList]);

    const acknowledgeRequests = async () => {
        try {
            dispatch(acknowledgeCategoryRequests());
            await fetcher("categories/requests/acknowledge", "PATCH");
        } catch (error) {
            console.log(error);
        }
    };

    const handleAddClick = () => {
        dispatch(showGenericModal(<CategoryAdder />));
    };

    return (
        <section>
            <Head>
                <title>Category requests</title>
            </Head>

            <PageHeader
                heading="category requests"
                hasBackArrow
                hasAddBtn
                addToolname="add category"
                onAddClick={handleAddClick}
            />

            {requestsList.length > 0 && (
                <p className="history-message -mt-2">
                    Users have made{" "}
                    <span className="font-semibold">
                        {requestsList.length}{" "}
                    </span>
                    category requests
                </p>
            )}

            <ContentList
                list={requestsList}
                loadingMsg={loading && "Loading category requests..."}
                error={error}
                emptyMsg="No category requests found"
                human="no-items"
                type="category-request"
            />
        </section>
    );
};

export default CategoryRequests;
