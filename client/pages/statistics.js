import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Head from "next/head";
import { MdOutlineRefresh } from "react-icons/md";

import { fetcher } from "../lib/fetcher";
import { setAppStats, setNeedToFetch } from "../redux/slices/stats-slice";

import PageHeader from "../components/page-header";
import StatCard from "../components/stat-card";

const Statistics = () => {
  const [loadingStats, setLoadingStats] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { appStats, needToFetch } = useSelector((state) => state.stats);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setNeedToFetch(true));
  }, []);

  useEffect(() => {
    getAppStatistics();
  }, [needToFetch]);

  const getAppStatistics = async () => {
    setLoadingStats(true);

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
    <section>
      <Head>
        <title>Statistics</title>
      </Head>

      <div className="mt-2 mb-5 flex items-center">
        <PageHeader heading="statistics" />
        <MdOutlineRefresh className="icon" />
      </div>

      <div className="grid grid-cols-3 gap-y-3 items-center">
        {Object.keys(appStats).map((key) => {
          return <StatCard title={key} stat={appStats[key]} />;
        })}
      </div>

      {/* <div className="grid grid-cols-3 gap-y-3 items-center">
        {Object.keys(appData).map((key) => {
          return <StatCard title={key} stat={appData[key]} />;
        })}
      </div> */}
    </section>
  );
};

export default Statistics;
