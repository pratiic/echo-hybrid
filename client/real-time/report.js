import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import {
    addReport,
    deleteTargetReport,
    setReportsProp,
} from "../redux/slices/reports-slice";
import { fetcher } from "../lib/fetcher";
import useSocket from "../hooks/use-socket";

const Report = () => {
    const { needToFetch, loading, targetType } = useSelector(
        (state) => state.reports
    );

    const dispatch = useDispatch();
    const socket = useSocket();

    useEffect(() => {
        if (needToFetch) {
            fetchReports();
        }
    }, [needToFetch]);

    useEffect(() => {
        setProp("needToFetch", true);
    }, [targetType]);

    useEffect(() => {
        socket.on("target-report", (reportInfo) => {
            const { targetType: targetT, report } = reportInfo;

            if (targetType === "all" || targetType === targetT) {
                console.log("pratiic");
                dispatch(addReport(report));
            }
        });
    }, [targetType]);

    const setProp = (prop, value) => {
        dispatch(setReportsProp({ prop, value }));
    };

    const fetchReports = async () => {
        if (loading) {
            return;
        }

        setProp("loading", true);

        try {
            const targetUrlMap = {
                all: "",
                product: "product",
                seller: "store",
                user: "user",
            };

            const data = await fetcher(
                `reports/?targetType=${targetUrlMap[targetType]}`
            );

            setProp("reports", data.reports);
        } catch (error) {
            setProp("error", error.message);
        } finally {
            setProp("loading", false);
        }
    };

    return <></>;
};

export default Report;
