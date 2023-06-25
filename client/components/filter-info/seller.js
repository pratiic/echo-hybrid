import React from "react";
import { useSelector } from "react-redux";

import {
    capitalizeFirstLetter,
    singularOrPluralCount,
} from "../../lib/strings";

const SellerFilterInfo = () => {
    const { totalCount, activeFilter, activeLocationType } = useSelector(
        (state) => state.sellers
    );

    const filterMap = {
        all: "all sellers",
        individual: "individual sellers",
        business: "registered businesses",
        location: `sellers from your ${activeLocationType}`,
    };

    const renderTotalCount = () => {
        if (totalCount === 0) {
            return;
        }

        return (
            <React.Fragment>
                , <span className="font-semibold">{totalCount} </span>
                found
            </React.Fragment>
        );
    };

    return (
        <div className="filter-info-container">
            <p className="filter-info-text">
                Showing {filterMap[activeFilter]}
                {/* {renderTotalCount()} */}
            </p>
        </div>
    );
};

export default SellerFilterInfo;
