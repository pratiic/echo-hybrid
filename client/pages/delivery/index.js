import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Head from "next/head";
import { useRouter } from "next/router";

import { fetcher } from "../../lib/fetcher";
import {
    acknowledgeDeliveries,
    setQuery,
} from "../../redux/slices/delivery-slice";
import { singularOrPlural, singularOrPluralCount } from "../../lib/strings";

import PageHeader from "../../components/page-header";
import GenericSearch from "../../components/generic-search";
import DeliveriesList from "../../components/deliveries-list";
import { getProp, setProp } from "../../lib/local-storage";

const Deliveries = () => {
    const [activeOption, setActiveOption] = useState("");
    const [acknowledging, setAcknowledging] = useState(false);

    const {
        pending,
        completed,
        totalCount,
        addedCount,
        pendingQuery,
        completedQuery,
    } = useSelector((state) => state.delivery);

    const router = useRouter();
    const dispatch = useDispatch();

    useEffect(() => {
        const lastDeliveryQuery = getProp("lastDeliveryQuery") || "pending";
        setActiveOption(lastDeliveryQuery);

        return () => {
            setProp("lastDeliveryQuery", "");
        };
    }, []);

    useEffect(() => {
        if (activeOption) {
            router.push(`/delivery/?show=${activeOption}`);
        }
    }, [activeOption]);

    useEffect(() => {
        // there aren't separate page files for pending and completed delivery to improve code reuse
        // if reloaded when in /delivery/?show=completed, it will redirect to the default route /delivery/?show=pending
        // by storing the last query value in the local storage, we can set the query to that value when reloaded

        if (router.query.show) {
            setProp("lastDeliveryQuery", router.query.show);
            setActiveOption(router.query.show);
        }
    }, [router.query]);

    useEffect(() => {
        if (
            activeOption === "completed" &&
            completed.find((delivery) => !delivery.isAcknowledged)
        ) {
            acknowledgeCompletedDeliveries();
        }
    }, [activeOption, completed]);

    const getPageTitle = () => {
        return activeOption === "pending"
            ? "Orders to deliver"
            : "Completed deliveries";
    };

    const acknowledgeCompletedDeliveries = async () => {
        if (acknowledging) {
            return;
        }

        setAcknowledging(true);

        try {
            fetcher("delivery", "PATCH");
            dispatch(acknowledgeDeliveries());
        } catch (error) {
        } finally {
            setAcknowledging(false);
        }
    };

    const renderGenericSearch = () => {
        if (
            (activeOption === "pending" &&
                pending?.length === 0 &&
                !pendingQuery) ||
            (activeOption === "completed" &&
                completed?.length === 0 &&
                !completedQuery)
        ) {
            return;
        }

        return (
            <div className="mb-5 -mt-1">
                <GenericSearch
                    show={true}
                    placeholder="Search products or order Ids"
                    value={
                        activeOption === "pending"
                            ? pendingQuery
                            : completedQuery
                    }
                    onSubmit={(query) =>
                        dispatch(setQuery({ type: activeOption, query }))
                    }
                    clearSearch={() =>
                        dispatch(setQuery({ type: activeOption, query: "" }))
                    }
                />
            </div>
        );
    };

    const renderDeliveryMessage = () => {
        const query =
            activeOption === "pending" ? pendingQuery : completedQuery;

        if (query) {
            return (
                <p className="history-message">
                    <span className="font-semibold">
                        {totalCount[activeOption]}{" "}
                    </span>
                    {singularOrPlural(
                        activeOption === "pending" ? pending : completed,
                        activeOption === "pending"
                            ? "order"
                            : "completed delivery",
                        activeOption === "pending"
                            ? "orders"
                            : "completed deliveries"
                    )}{" "}
                    {activeOption === "completed"
                        ? "found"
                        : "to deliver found"}
                </p>
            );
        }

        if (
            (activeOption === "pending" && pending?.length === 0) ||
            (activeOption === "completed" && completed?.length === 0)
        ) {
            return null;
        }

        const totalDeliveries =
            totalCount[activeOption] + addedCount[activeOption];

        return (
            <p className="history-message">
                {activeOption === "pending"
                    ? `There ${singularOrPluralCount(
                          totalDeliveries,
                          "is",
                          "are"
                      )} `
                    : "The delivery team has completed "}{" "}
                <span className="font-semibold">{totalDeliveries} </span>
                {activeOption === "pending"
                    ? `${singularOrPluralCount(
                          totalDeliveries,
                          "order",
                          "orders"
                      )} to deliver`
                    : `${singularOrPlural(
                          totalDeliveries,
                          "delivery",
                          "deliveries"
                      )}`}
            </p>
        );
    };

    if (!router.query.show) {
        return null;
    }

    return (
        <section>
            <Head>
                <title>{getPageTitle()}</title>
            </Head>

            <PageHeader heading={getPageTitle()} hasBackArrow />

            <div className="-mt-3"></div>

            {renderDeliveryMessage()}

            {renderGenericSearch()}

            <DeliveriesList type={activeOption} />
        </section>
    );
};

export default Deliveries;
