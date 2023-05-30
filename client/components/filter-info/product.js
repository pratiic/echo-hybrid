import React from "react";
import { useSelector } from "react-redux";

import {
    capitalizeFirstLetter,
    singularOrPluralCount,
} from "../../lib/strings";

const ProductFilterInfo = ({ activeCategory, showingShopProducts, count }) => {
    const { activeFilter, locationFilter, shopFilter } = useSelector(
        (state) => state.filter
    );

    const filterMap = {
        all: "all products",
        location: `products of your ${
            !showingShopProducts ? locationFilter : shopFilter.locationFilter
        }`,
        delivered: "products that are delivered",
        "second hand": "second hand products",
    };

    const renderTotalCount = () => {
        const filter =
            filterMap[
                !showingShopProducts ? activeFilter : shopFilter.activeFilter
            ];

        if (filter === "all products" || count === 0) {
            return;
        }

        return (
            <React.Fragment>
                ,<span className="filter-info-highlight"> {count}</span>{" "}
                {singularOrPluralCount(count, "product", "products")} found
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
                                : shopFilter.activeFilter
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
