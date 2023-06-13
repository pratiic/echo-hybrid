import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import PageHeader from "../components/page-header";
import ContentList from "../components/content-list";
import OptionsToggle from "../components/options-toggle";
import { setReportsProp } from "../redux/slices/reports-slice";
import { singularOrPluralCount } from "../lib/strings";

const Reports = () => {
    const {
        reports,
        loading,
        error,
        targetType,
        totalCount,
        addedReportsCount,
    } = useSelector((state) => state.reports);

    const dispatch = useDispatch();

    const targetOptions = [
        { name: "all reports" },
        { name: "product reports" },
        { name: "seller reports" },
        { name: "user reports" },
    ];

    useEffect(() => {
        return () => {
            // reset the targetType leave this page is left
            dispatch(
                setReportsProp({ prop: "targetType", value: "all reports" })
            );
        };
    }, []);

    return (
        <section>
            <PageHeader heading={targetType} hasBackArrow>
                <OptionsToggle
                    options={targetOptions}
                    active={targetType}
                    type="dropdown"
                    onClick={(targetType) =>
                        dispatch(
                            setReportsProp({
                                prop: "targetType",
                                value: targetType,
                            })
                        )
                    }
                />
            </PageHeader>

            {reports.length > 0 && (
                <p className="history-message -mt-2">
                    There {singularOrPluralCount(totalCount, "is", "are")}{" "}
                    <span className="font-semibold">
                        {totalCount + addedReportsCount}
                    </span>{" "}
                    {targetType === "all reports"
                        ? `${singularOrPluralCount(
                              totalCount,
                              "report",
                              "reports"
                          )} in total`
                        : ` ${targetType.split(" ")[0]} ${singularOrPluralCount(
                              totalCount,
                              "report",
                              "reports"
                          )}`}{" "}
                </p>
            )}

            <ContentList
                list={reports}
                type="report"
                loadingMsg={loading && "Loading reports..."}
                error={error}
                emptyMsg="No reports found"
                human="no-items"
            />
        </section>
    );
};

export default Reports;
