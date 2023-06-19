import React from "react";
import { useSelector } from "react-redux";

import {
    capitalizeFirstLetter,
    singularOrPluralCount,
} from "../../lib/strings";
import { getFilterMap } from "../../lib/filter";

const ProductFilterInfo = ({ activeCategory, showingShopProducts, count }) => {
    const { activeFilter, locationFilter, sellerFilter } = useSelector(
        (state) => state.filter
    );

    const filterMap = getFilterMap(
        locationFilter,
        sellerFilter,
        showingShopProducts
    );

    const renderTotalCount = () => {
        const filter =
            filterMap[
                !showingShopProducts ? activeFilter : sellerFilter.activeFilter
            ];

        if (filter === "all products" || count === 0) {
            return;
        }

        return (
            <React.Fragment>
                ,<span className="font-semibold"> {count}</span> found
            </React.Fragment>
        );
    };

    // if not activeCategory -> all categories
    return (
        <div className="filter-info-container">
            <p className="filter-info-text">
                Showing{" "}
                <span className="filter-info-highlight">
                    {capitalizeFirstLetter(
                        filterMap[
                            !showingShopProducts
                                ? activeFilter
                                : sellerFilter.activeFilter
                        ]
                    )}
                </span>{" "}
                from{" "}
                <span className="filter-info-highlight">
                    {capitalizeFirstLetter(activeCategory || "All")}
                </span>{" "}
                {activeCategory ? "category" : "categories"}
                {renderTotalCount()}
            </p>
        </div>
    );
};

export default ProductFilterInfo;
