import React, { useEffect, useState } from "react";
import Head from "next/head";

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

  console.log(appData);

  if (loadingStats) {
    return <p className="status">Loading app statistics...</p>;
  }

  if (errorMsg) {
    return <p className="status">{errorMsg}</p>;
  }

  return (
    <section>
      <Head>
        <title>App Statistics</title>
      </Head>

      <PageHeader heading="statistics" hasBackArrow />

      <StatCard {...appData} />
    </section>
  );
};

export default Statistics;
