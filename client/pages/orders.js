import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useSelector } from "react-redux";
import { BsArrowDownLeftCircle, BsArrowUpRightCircle } from "react-icons/bs";
import {
  ArrowCircleLeftIcon,
  ArrowCircleRightIcon,
} from "@heroicons/react/outline";

import { capitalizeFirstLetter } from "../lib/strings";

import PageHeader from "../components/page-header";
import OptionsToggle from "../components/options-toggle";
import OrdersList from "../components/orders-list";

const Orders = () => {
  const [options, setOptions] = useState([
    {
      name: "order requests",
      icon: <ArrowCircleLeftIcon className="icon-no-bg" />,
    },
    {
      name: "my orders",
      icon: <ArrowCircleRightIcon className="icon-no-bg" />,
    },
  ]);
  const [activeOption, setActiveOption] = useState("");
  const router = useRouter();
  const { totalCount } = useSelector((state) => state.orders);

  useEffect(() => {
    if (router.query?.show) {
      const urlMap = {
        user: "my orders",
        seller: "order requests",
      };
      setActiveOption(urlMap[router.query.show]);
    } else {
      router.push("/orders/?show=seller");
    }
  }, [router.query]);

  const handleActiveOption = (option) => {
    const urlMap = {
      "my orders": "user",
      "order requests": "seller",
    };
    router.push(`/orders/?show=${urlMap[option]}`);
  };

  const getOptionMessage = () => {
    return activeOption === "my orders" ? "your orders" : "order requests";
  };

  return (
    <section>
      <Head>
        <title>
          {capitalizeFirstLetter(getOptionMessage())} (
          {activeOption === "my orders"
            ? totalCount["user"]
            : totalCount["seller"]}
          )
        </title>
      </Head>

      <PageHeader heading={getOptionMessage()} hasBackArrow></PageHeader>

      <div className="mb-7 -mt-2">
        <OptionsToggle
          options={options}
          onClick={handleActiveOption}
          active={activeOption}
          rounded={false}
        />
      </div>

      <OrdersList
        orderType={activeOption === "order requests" ? "seller" : "user"}
      />
    </section>
  );
};

export default Orders;
