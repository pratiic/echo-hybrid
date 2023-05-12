import React, { useState } from "react";
import { useRouter } from "next/router";

import { ArrowLeftIcon } from "@heroicons/react/solid";
import { PlusIcon } from "@heroicons/react/outline";
import { BiSearch } from "react-icons/bi";

import { capitalizeFirstLetter } from "../lib/strings";
import Icon from "./icon";

const PageHeader = ({
  heading,
  isHeadingComponent = false,
  hasAddBtn,
  hasBackArrow,
  onSearchClick,
  onAddClick,
  activeSearch,
  count,
  children,
}) => {
  const router = useRouter();

  const onBackArrowClick = () => {
    router.back();
  };

  return (
    <div className="flex items-center justify-between relative mb-4">
      <div className="flex items-center">
        {hasBackArrow && (
          <Icon className="mr-2 -ml-2" onClick={onBackArrowClick}>
            <ArrowLeftIcon className="icon" />
          </Icon>
        )}

        <h2 className="flex items-center text-2xl font-semibold black-white leading-none">
          {isHeadingComponent ? heading : capitalizeFirstLetter(heading)}
          {count > 0 && (
            <span className="dark-light ml-1 text-lg">({count})</span>
          )}
        </h2>

        {onSearchClick && (
          <Icon onClick={onSearchClick} className="ml-2" toolName="search">
            <BiSearch className={`${activeSearch ? "icon-active" : "icon"}`} />
          </Icon>
        )}

        {hasAddBtn && (
          <Icon className="ml-3" onClick={onAddClick} toolName="add product">
            <PlusIcon className="icon" />
          </Icon>
        )}
      </div>

      <div className="ml-auto">{children}</div>
    </div>
  );
};

export default PageHeader;
