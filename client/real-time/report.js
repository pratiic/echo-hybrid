import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { addReport, setReportsProp } from "../redux/slices/reports-slice";
import { fetcher } from "../lib/fetcher";
import useSocket from "../hooks/use-socket";

const Report = () => {
    const {
        reports,
        needToFetch,
        loading,
        loadingMore,
        page,
        targetType,
    } = useSelector((state) => state.reports);

    const dispatch = useDispatch();
    const socket = useSocket();

    useEffect(() => {
        if (needToFetch) {
            fetchReports();
        }
    }, [needToFetch]);

    useEffect(() => {
        setProp("page", 1);
        setProp("needToFetch", true);
    }, [targetType]);

    useEffect(() => {
        socket.on("target-report", (reportInfo) => {
            const { targetType: targetT, report } = reportInfo;

            if (targetType === "all reports") {
                dispatch(addReport(report));
            }
        });
    }, [targetType]);

    const setProp = (prop, value) => {
        dispatch(setReportsProp({ prop, value }));
    };

    const targetUrlMap = {
        "all reports": "",
        "product reports": "product",
        "seller reports": "store",
        "user reports": "user",
    };

    const fetchReports = async () => {
        if (loading || loadingMore) {
            return;
        }

        setProp(page === 1 ? "loading" : "loadingMore", true);

        try {
            const data = await fetcher(
                `reports/?targetType=${targetUrlMap[targetType]}`
            );

            setProp(
                "reports",
                page === 1 ? data.reports : [...reports, ...data.reports]
            );

            if (page === 1) {
                setProp("totalCount", data.totalCount);
                setProp("addedReportsCount", 0);
            }
        } catch (error) {
            setProp("error", error.message);
        } finally {
            setProp("loading", false);
            setProp("loadinMore", false);
        }
    };

    return <></>;
};

export default Report;
