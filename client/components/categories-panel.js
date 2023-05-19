import React, { useEffect, useState } from "react";

import { capitalizeFirstLetter } from "../lib/strings";
import { fetcher } from "../lib/fetcher";

import CustomLink from "./custom-link";

const CategoriesPanel = ({
  show,
  activeCategory,
  showCount = true,
  setActiveCategory,
  togglePanel,
}) => {
  const [categories, setCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const categoryStyle = `flex items-center rounded-2xl px-3 py-1 cursor-pointer transition-all duration-200`;
  const countStyle = `text-sm ml-[0.15rem] font-semibold`;

  useEffect(() => {
    if (show) {
      getCategories();
    }
  }, [show]);

  const getCategories = async () => {
    try {
      let url = "categories";

      const data = await fetcher(url);

      setCategories(data.categories);
    } catch (error) {}
  };

  if (!show) {
    return null;
  }

  const handleClick = (categoryName) => {
    setActiveCategory(categoryName);
    togglePanel();
  };

  return (
    <div
      className={
        "bg-gray-50 text-gray-one w-fit py-5 pl-3 pr-5 mb-[25px] -mt-2 transition-all duration-500 dark:bg-gray-ten dark:text-gray-400"
      }
    >
      <div className="flex items-center flex-wrap space-x-2 space-y-2 -mt-2">
        <CustomLink
          className={`${categoryStyle}  mt-2 ml-2 ${
            !activeCategory
              ? "bg-blue-two text-t-black"
              : "hover:text-blue-threehover:text-blue-three bg-gray-200 text-gray-500  dark:bg-gray-800 dark:text-gray-400"
          }`}
          onClick={() => handleClick}
        >
          All{" "}
          {showCount && <span className={`${countStyle}`}>({totalCount})</span>}
        </CustomLink>

        {categories.map((category) => {
          return (
            <CustomLink
              className={`${categoryStyle} ${
                activeCategory === category.name
                  ? "bg-blue-two text-t-black"
                  : "hover:text-blue-three bg-gray-200 text-gray-500  dark:bg-gray-800 dark:text-gray-400"
              }`}
              key={category.name}
              onClick={() => handleClick(category.name)}
            >
              <p>
                {capitalizeFirstLetter(category.name)}
                {showCount && (
                  <span className={countStyle}>
                    ({category._count.products})
                  </span>
                )}
              </p>
            </CustomLink>
          );
        })}
      </div>
    </div>
  );
};

export default CategoriesPanel;
