import Head from "next/head";
import { useSelector } from "react-redux";

import PageHeader from "../components/page-header";
import ContentList from "../components/content-list";
import { singularOrPluralCount } from "../lib/strings";

const BusinessRequests = () => {
    const { requests, loading, error, totalCount } = useSelector(
        (state) => state.businesses
    );

    return (
        <section>
            <Head>
                <title>Business requests</title>
            </Head>

            <PageHeader heading="business requests" hasBackArrow />

            {requests.length > 0 && (
                <p className="history-message -mt-2">
                    There {singularOrPluralCount(totalCount, "is", "are")}{" "}
                    <span className="font-semibold">{totalCount}</span>{" "}
                    {singularOrPluralCount(totalCount, "request", "requests")}{" "}
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
            />
        </section>
    );
};

export default BusinessRequests;
