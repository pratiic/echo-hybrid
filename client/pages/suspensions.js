import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Head from "next/head";

import { showGenericModal } from "../redux/slices/modal-slice";
import { setSuspensionsProp } from "../redux/slices/suspensions-slice";
import { fetcher } from "../lib/fetcher";
import {
    capitalizeFirstLetter,
    singularOrPlural,
    singularOrPluralCount,
} from "../lib/strings";

import PageHeader from "../components/page-header";
import TargetSuspendor from "../components/target-suspendor";
import ContentList from "../components/content-list";
import OptionsToggle from "../components/options-toggle";
import GenericSearch from "../components/generic-search";

const Suspensions = () => {
    const {
        suspensions,
        loading,
        error,
        needToFetch,
        targetType,
        query,
    } = useSelector((state) => state.suspensions);

    const dispatch = useDispatch();
    const targetOptions = [
        {
            name: "all",
            value: "all suspensions",
        },
        {
            name: "product",
            value: "product suspensions",
        },
        {
            name: "seller",
            value: "seller suspensions",
        },
        {
            name: "user",
            value: "user suspensions",
        },
    ];

    useEffect(() => {
        if (needToFetch) {
            fetchSuspensions();
        }
    }, [needToFetch]);

    useEffect(() => {
        dispatch(setSuspensionsProp({ prop: "needToFetch", value: true }));
    }, [targetType, query]);

    const fetchSuspensions = async () => {
        if (loading) {
            return;
        }

        dispatch(setSuspensionsProp({ prop: "loading", value: true }));

        try {
            const targetTypeMap = {
                all: "",
                product: "product",
                seller: "store",
                user: "user",
            };

            const data = await fetcher(
                `suspensions/?targetType=${targetTypeMap[targetType]}&query=${query}`
            );

            dispatch(
                setSuspensionsProp({
                    prop: "suspensions",
                    value: data.suspensions,
                })
            );
        } catch (error) {
            console.log(error);
            dispatch(
                setSuspensionsProp({ prop: "error", value: error.message })
            );
        } finally {
            dispatch(setSuspensionsProp({ prop: "loading", value: false }));
        }
    };

    const handleSuspension = () => {
        dispatch(showGenericModal(<TargetSuspendor />));
    };

    const renderCountMessage = () => {
        if (query) {
            return (
                <p className="history-message -mt-2">
                    <span>{suspensions.length}</span>{" "}
                    {singularOrPlural(suspensions, "suspension", "suspensions")}{" "}
                    found
                </p>
            );
        }

        if (suspensions.length === 0) {
            return;
        }

        return (
            <p className="history-message -mt-2">
                There {singularOrPluralCount(suspensions.length, "is", "are")}
                <span className="font-semibold"> {suspensions.length} </span>
                {targetType !== "all" ? targetType : "total"}{" "}
                {singularOrPluralCount(
                    suspensions.length,
                    "suspension",
                    "suspensions"
                )}
            </p>
        );
    };

    const getPageHeading = () => {
        return `${targetType === "store" ? "seller" : targetType} suspensions`;
    };

    const renderGenericSearch = () => {
        if ((suspensions.length === 0 && !query) || targetType === "all") {
            return;
        }

        return (
            <div className="mb-5">
                <GenericSearch
                    show={true}
                    placeholder={`Search ${targetType} Id...`}
                    onSubmit={(query) =>
                        dispatch(
                            setSuspensionsProp({ prop: "query", value: query })
                        )
                    }
                    clearSearch={() =>
                        dispatch(
                            setSuspensionsProp({ prop: "query", value: "" })
                        )
                    }
                />
            </div>
        );
    };

    return (
        <section>
            <Head>
                <title>{capitalizeFirstLetter(getPageHeading())}</title>
            </Head>

            <PageHeader
                heading={getPageHeading()}
                hasBackArrow
                hasAddBtn
                addToolname="add suspension"
                onAddClick={handleSuspension}
            >
                <OptionsToggle
                    options={targetOptions}
                    active={targetType}
                    type="dropdown"
                    onClick={(target) =>
                        dispatch(
                            setSuspensionsProp({
                                prop: "targetType",
                                value: target,
                            })
                        )
                    }
                />
            </PageHeader>

            {renderCountMessage()}

            {renderGenericSearch()}

            <ContentList
                list={suspensions}
                type="suspension"
                loadingMsg={loading && "loading suspensions..."}
                error={error}
                emptyMsg="no suspensions found"
                human="no-items"
            />
        </section>
    );
};

export default Suspensions;
