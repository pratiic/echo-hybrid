import React from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    DotsHorizontalIcon,
    ArrowsExpandIcon,
    LocationMarkerIcon,
    StarIcon,
    CurrencyDollarIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    CalendarIcon,
} from "@heroicons/react/outline";
import { FaCity } from "react-icons/fa";
import { MdDeliveryDining, MdTransferWithinAStation } from "react-icons/md";

import { setFilterOptions } from "../redux/slices/filter-slice";
import { closeModal } from "../redux/slices/modal-slice";

import OptionsToggle from "./options-toggle";
import Button from "./button";

const ProductFilter = ({ isGlobal }) => {
    let options = {};
    options = useSelector((state) =>
        isGlobal ? state.filter : state.filter.sellerFilter
    );
    const {
        activeFilter: af,
        locationFilter: lf,
        sortingType: st,
        orderType: ot,
    } = options;
    const dispatch = useDispatch();

    const [activeFilter, setActiveFilter] = useState(af);
    const [locationFilter, setLocationFilter] = useState(lf);
    const [sortingType, setSortingType] = useState(st);
    const [orderType, setOrderType] = useState(ot);

    const { authUser } = useSelector((state) => state.auth);

    const headingStyles = "mb-2 text-xl font-semibold black-white";

    const handleButtonClick = () => {
        dispatch(
            setFilterOptions({
                options: {
                    activeFilter,
                    locationFilter,
                    sortingType,
                    orderType,
                },
                isGlobal,
            })
        );
        dispatch(closeModal());
    };

    const filterOptions = [
        { name: "all", icon: <DotsHorizontalIcon className="icon-no-bg" /> },
        {
            name: "location",
            icon: <LocationMarkerIcon className="icon-no-bg" />,
            disabled: !authUser?.address,
        },
        {
            name: "delivered",
            icon: <MdDeliveryDining className="icon-no-bg" />,
            disabled: !authUser?.address,
        },
        {
            name: "second hand",
            icon: <MdTransferWithinAStation className="icon-no-bg" />,
        },
    ];
    const locationOptions = [
        { name: "province", icon: <ArrowsExpandIcon className="icon-no-bg" /> },
        { name: "city", icon: <FaCity className="icon-no-bg" /> },
        { name: "area", icon: <LocationMarkerIcon className="icon-no-bg" /> },
    ];
    const sortingOptions = [
        { name: "rating", icon: <StarIcon className="icon-no-bg" /> },
        { name: "price", icon: <CurrencyDollarIcon className="icon-no-bg" /> },
        { name: "date added", icon: <CalendarIcon className="icon-no-bg" /> },
    ];
    const orderOptions = [
        { name: "asc", icon: <ArrowUpIcon className="icon-no-bg" /> },
        { name: "desc", icon: <ArrowDownIcon className="icon-no-bg" /> },
    ];

    return (
        <div className="space-y-3 px-3">
            <div>
                <h3 className={headingStyles}>Show products</h3>
                <div className="flex space-x-5">
                    <OptionsToggle
                        options={filterOptions}
                        active={activeFilter}
                        type="dropdown"
                        dropdownHasShadow={false}
                        onClick={(filter) => setActiveFilter(filter)}
                    />
                    {activeFilter === "location" && (
                        <OptionsToggle
                            options={locationOptions}
                            active={locationFilter}
                            onClick={(location) => setLocationFilter(location)}
                            type="dropdown"
                            dropdownHasShadow={false}
                        />
                    )}
                </div>
            </div>

            <div>
                <h3 className={headingStyles}>Sort by</h3>
                <div className="flex space-x-5">
                    <OptionsToggle
                        options={sortingOptions}
                        active={sortingType}
                        dropdownHasShadow={false}
                        type="dropdown"
                        onClick={(type) => setSortingType(type)}
                    />
                    <OptionsToggle
                        options={orderOptions}
                        active={orderType}
                        dropdownHasShadow={false}
                        type="dropdown"
                        onClick={(orderType) => setOrderType(orderType)}
                    />
                </div>
            </div>

            <div className="pt-3">
                <Button full onClick={handleButtonClick}>
                    Confirm
                </Button>
            </div>
        </div>
    );
};

export default ProductFilter;
