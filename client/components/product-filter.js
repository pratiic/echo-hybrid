import React, { useState, useEffect } from "react";
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
    UserIcon,
    ExclamationCircleIcon,
} from "@heroicons/react/outline";
import { FaCity } from "react-icons/fa";
import { MdDeliveryDining, MdTransferWithinAStation } from "react-icons/md";
import { TbCertificate } from "react-icons/tb";
import { HiOutlineCash } from "react-icons/hi";

import { setFilterOptions } from "../redux/slices/filter-slice";
import { closeModal } from "../redux/slices/modal-slice";

import OptionsToggle from "./options-toggle";
import Button from "./button";

const ProductFilter = ({ isGlobal, sellerType, isMyStore }) => {
    let options = {};
    options = useSelector((state) =>
        isGlobal ? state.filter : state.filter.sellerFilter
    );
    const { authUser } = useSelector((state) => state.auth);

    const {
        activeFilter: af,
        locationFilter: lf,
        sortingType: st,
        orderType: ot,
    } = options;

    const [activeFilter, setActiveFilter] = useState(af);
    const [locationFilter, setLocationFilter] = useState(lf);
    const [sortingType, setSortingType] = useState(st);
    const [orderType, setOrderType] = useState(ot);
    const [isRestricted, setIsRestricted] = useState(false);

    const dispatch = useDispatch();
    const headingStyles = "mb-2 text-xl font-semibold black-white";

    useEffect(() => {
        setIsRestricted(authUser?.isAdmin || authUser?.isDeliveryPersonnel);
    }, [authUser]);

    const handleButtonClick = () => {
        const filterOptions = {
            activeFilter,
            locationFilter,
            sortingType,
            orderType,
        };

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

    let filterOptions = [
        { name: "all", icon: <DotsHorizontalIcon className="icon-no-bg" /> },
    ];

    if (isGlobal && !isRestricted) {
        // do not show 'recommended' option when searching products
        filterOptions = [
            ...filterOptions,
            {
                name: "recommended",
                icon: <UserIcon className="icon-no-bg" />,
                disabled: !isGlobal || isRestricted,
            },
        ];
    }

    if (!(isRestricted || (!isGlobal && isMyStore))) {
        filterOptions = [
            ...filterOptions,
            {
                name: "delivered",
                icon: <MdDeliveryDining className="icon-no-bg" />,
                disabled: !authUser?.address,
            },
        ];
    }

    if (isGlobal) {
        filterOptions = [
            ...filterOptions,
            {
                name: "second hand",
                icon: <MdTransferWithinAStation className="icon-no-bg" />,
            },
            {
                name: "brand new",
                icon: <TbCertificate className="icon-no-bg" />,
            },
        ];
    }

    if (!isGlobal && sellerType === "IND") {
        filterOptions = [
            ...filterOptions,
            {
                name: "sold out",
                icon: <HiOutlineCash className="icon-no-bg" />,
            },
        ];
    }

    if (!(isRestricted || (!isGlobal && isMyStore))) {
        filterOptions = [
            ...filterOptions,
            {
                name: "location",
                icon: <LocationMarkerIcon className="icon-no-bg" />,
                disabled: !authUser?.address,
            },
        ];
    }

    if (!isGlobal && isMyStore) {
        filterOptions = [
            ...filterOptions,
            {
                name: "suspended",
                icon: <ExclamationCircleIcon className="icon-no-bg" />,
            },
        ];
    }

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
                        forModal
                        onClick={(filter) => setActiveFilter(filter)}
                    />
                    {activeFilter === "location" && (
                        <OptionsToggle
                            options={locationOptions}
                            active={locationFilter}
                            onClick={(location) => setLocationFilter(location)}
                            type="dropdown"
                            forModal
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
                        forModal
                        onClick={(type) => setSortingType(type)}
                    />
                    <OptionsToggle
                        options={orderOptions}
                        active={orderType}
                        dropdownHasShadow={false}
                        type="dropdown"
                        forModal
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
