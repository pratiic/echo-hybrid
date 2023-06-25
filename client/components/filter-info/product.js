import React from "react";
import { useSelector } from "react-redux";
import { getFilterMap } from "../../lib/filter";

const ProductFilterInfo = ({ activeCategory, count }) => {
    const { activeFilter, locationFilter, sellerFilter } = useSelector(
        (state) => state.filter
    );

    const filterMap = getFilterMap(locationFilter)[activeFilter];

    const renderTotalCount = () => {
        const filter = filterMap[activeFilter];

        if (filter === "all products" || count === 0) {
            return;
        }

        return (
            <React.Fragment>
                ,<span className="font-semibold"> {count}</span> total
            </React.Fragment>
        );
    };

    return (
        <div className="filter-info-container">
            <p className="filter-info-text">
                Showing{" "}
                <span className="filter-info-highlight">
                    {filterMap[activeFilter]}
                </span>{" "}
                from{" "}
                <span className="filter-info-highlight">
                    {activeCategory
                        ? `${activeCategory} category`
                        : "all categories"}
                </span>
            </p>
        </div>
    );
};

export default ProductFilterInfo;
