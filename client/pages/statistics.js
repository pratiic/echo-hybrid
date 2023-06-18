import React, { useEffect, useState } from "react";
import Head from "next/head";
import { MdOutlineRefresh } from "react-icons/md";

import { fetcher } from "../lib/fetcher";

import PageHeader from "../components/page-header";
import StatCard from "../components/stat-card";

const Statistics = () => {
  const [loadingStats, setLoadingStats] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [appData, setAppData] = useState([]);

  useEffect(() => {
    getAppStatistics();
  }, []);

  const getAppStatistics = async () => {
    setLoadingStats(true);

    try {
      const data = await fetcher(`stats`);
      setAppData(data);
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
        {Object.keys(appData).map((key) => {
          return <StatCard title={key} stat={appData[key]} />;
        })}
      </div>
    </section>
  );
};

export default Statistics;
