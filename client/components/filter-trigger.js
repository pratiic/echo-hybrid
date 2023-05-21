import { useDispatch } from "react-redux";
import { AdjustmentsIcon } from "@heroicons/react/outline";

import {
    setOverflowScroll,
    showGenericModal,
} from "../redux/slices/modal-slice";

import ProductFilter from "./product-filter";
import CustomLink from "./custom-link";
import Icon from "./icon";

const FilterTrigger = ({ isGlobal = true }) => {
    const dispatch = useDispatch();

    const handleTriggerClick = () => {
        dispatch(setOverflowScroll(false));
        dispatch(showGenericModal(<ProductFilter isGlobal={isGlobal} />));
    };

    return (
        <React.Fragment>
            <CustomLink
                onClick={handleTriggerClick}
                className="rounded hidden 500:block"
            >
                <div className="toggle-face">
                    <AdjustmentsIcon className="icon-no-bg mr-1" />
                    <span>Filter</span>
                </div>
            </CustomLink>

            <Icon
                toolName="filter"
                className="500:hidden"
                onClick={handleTriggerClick}
            >
                <AdjustmentsIcon className="icon" />
            </Icon>
        </React.Fragment>
    );
};

export default FilterTrigger;
