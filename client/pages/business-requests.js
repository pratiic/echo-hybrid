import { useEffect } from "react";
import Head from "next/head";
import { useSelector, useDispatch } from "react-redux";

import { singularOrPluralCount } from "../lib/strings";
import {
    acknowledgeRequests,
    setBusinessesProp,
} from "../redux/slices/businesses-slice";
import { fetcher } from "../lib/fetcher";

import PageHeader from "../components/page-header";
import ContentList from "../components/content-list";

const BusinessRequests = () => {
    const {
        requests,
        loading,
        loadingMore,
        error,
        page,
        totalCount,
        addedRequestsCount,
        noMoreData,
    } = useSelector((state) => state.businesses);

    const dispatch = useDispatch();

    useEffect(() => {
        if (requests.find((request) => !request.isAcknowledged)) {
            acknowledgeBusinessRequests();
        }
    }, [requests]);

    const incrementPageNumber = () => {
        dispatch(setBusinessesProp({ prop: "page", value: page + 1 }));
    };

    const acknowledgeBusinessRequests = async () => {
        try {
            fetcher("businesses/requests/acknowledge", "PATCH");
            dispatch(acknowledgeRequests());
        } catch (error) {}
    };

    return (
        <section>
            <Head>
                <title>Business requests</title>
            </Head>

            <PageHeader heading="business requests" hasBackArrow />

            {requests.length > 0 && (
                <p className="history-message -mt-2">
                    There{" "}
                    {singularOrPluralCount(
                        totalCount + addedRequestsCount,
                        "is",
                        "are"
                    )}{" "}
                    <span className="font-semibold">
                        {totalCount + addedRequestsCount}
                    </span>{" "}
                    {singularOrPluralCount(
                        totalCount + addedRequestsCount,
                        "request",
                        "requests"
                    )}{" "}
                    for business registration
                </p>
            )}

            <ContentList
                list={requests}
                type="business-request"
                loadingMsg={loading && "Loading business requests..."}
                error={error}
                emptyMsg="No business requests found"
                human="no-items"
                loadingMore={loadingMore}
                incrementPageNumber={!noMoreData && incrementPageNumber}
            />
        </section>
    );
};

export default BusinessRequests;
