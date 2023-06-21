import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Head from "next/head";

import { fetcher } from "../lib/fetcher";
import { setAppStats } from "../redux/slices/stats-slice";

import PageHeader from "../components/page-header";
import StatCard from "../components/stat-card";

const Statistics = () => {
    const [loadingStats, setLoadingStats] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const { appStats } = useSelector((state) => state.stats);

    const dispatch = useDispatch();

    useEffect(() => {
        getAppStatistics();
    }, []);

    const getAppStatistics = async () => {
        if (!appStats) {
            setLoadingStats(true);
        }

        try {
            const data = await fetcher(`stats`);

            dispatch(setAppStats(data));
        } catch (error) {
            setErrorMsg(error.message);
        } finally {
            setLoadingStats(false);
        }
    };

    if (loadingStats) {
        return <p className="status">Loading statistics...</p>;
    }

    if (errorMsg) {
        return <p className="status">{errorMsg}</p>;
    }

    return (
        <section className="pb-7">
            <Head>
                <title>Statistics</title>
            </Head>

            <div className="mt-2 mb-1 flex items-center">
                <PageHeader heading="statistics" />
            </div>

            <div className="grid grid-cols-list-stat gap-5">
                {Object.keys(appStats).map((key) => {
                    return <StatCard title={key} stat={appStats[key]} />;
                })}
            </div>
        </section>
    );
};

export default Statistics;
