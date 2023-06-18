import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Head from "next/head";

import {
  acknowledgeReports as acknowledgeReportsRedux,
  setReportsProp,
} from "../redux/slices/reports-slice";
import { capitalizeFirstLetter, singularOrPluralCount } from "../lib/strings";
import { fetcher } from "../lib/fetcher";

import PageHeader from "../components/page-header";
import ContentList from "../components/content-list";
import OptionsToggle from "../components/options-toggle";

const Reports = () => {
  const { reports, loading, error, targetType } = useSelector(
    (state) => state.reports
  );

  const dispatch = useDispatch();

  const targetOptions = [
    { name: "all", value: "all reports" },
    { name: "product", value: "product reports" },
    { name: "seller", value: "seller reports" },
    { name: "user", value: "user reports" },
  ];

  useEffect(() => {
    if (reports.find((report) => !report.isAcknowledged)) {
      acknowledgeReports();
    }
  }, [reports]);

  useEffect(() => {
    return () => {
      // reset the targetType leave this page is left
      dispatch(setReportsProp({ prop: "targetType", value: "all" }));
    };
  }, []);

  const acknowledgeReports = async () => {
    try {
      fetcher("reports/acknowledge", "PATCH");
      dispatch(acknowledgeReportsRedux());
    } catch (error) {}
  };

  return (
    <section>
      <Head>
        <title>{capitalizeFirstLetter(targetType)} reports</title>
      </Head>

      <PageHeader heading={`${targetType} reports`} hasBackArrow>
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
          There {singularOrPluralCount(reports.length, "is", "are")}{" "}
          <span className="font-semibold">{reports.length}</span>{" "}
          {targetType === "all"
            ? `${singularOrPluralCount(
                reports.length,
                "report",
                "reports"
              )} in total`
            : ` ${targetType.split(" ")[0]} ${singularOrPluralCount(
                reports.length,
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
