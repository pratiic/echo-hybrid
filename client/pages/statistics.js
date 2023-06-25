import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Head from "next/head";

import { fetcher } from "../lib/fetcher";
import { setAppStats, setProp } from "../redux/slices/stats-slice";

import PageHeader from "../components/page-header";
import StatCard from "../components/stat-card";

const Statistics = () => {
    const { appStats, loading, error } = useSelector((state) => state.stats);
    const { authUser } = useSelector((state) => state.auth);

    const dispatch = useDispatch();

    useEffect(() => {
        if (authUser) {
            getAppStatistics();
        }
    }, [authUser]);

    const getAppStatistics = async () => {
        if (!appStats) {
            dispatch(setProp({ prop: "loading", value: true }));
        }

        try {
            const data = await fetcher(`stats`);

            dispatch(setAppStats(data));
        } catch (error) {
            dispatch(setProp({ prop: "error", value: error.message }));
        } finally {
            dispatch(setProp({ prop: "loading", value: false }));
        }
    };

    if (loading) {
        return <p className="status">Loading statistics...</p>;
    }

    if (error) {
        return <p className="status">{error}</p>;
    }

    return (
        <section>
            <Head>
                <title>Statistics</title>
            </Head>

            <div className="mt-2 mb-1 flex items-center">
                <PageHeader heading="statistics" />
            </div>

            <div className="grid grid-cols-list-stat gap-5 pb-5">
                {Object.keys(appStats).map((key) => {
                    return <StatCard title={key} stat={appStats[key]} />;
                })}
            </div>
        </section>
    );
};

export default Statistics;
