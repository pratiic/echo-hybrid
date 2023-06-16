import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { setSuspensionsProp } from "../redux/slices/suspensions-slice";

const Suspension = () => {
    const { needToFetch, targetType, query } = useSelector(
        (state) => state.suspensions
    );

    const dispatch = useDispatch();

    useEffect(() => {
        if (!needToFetch) {
            dispatch(setSuspensionsProp({ prop: "needToFetch", value: true }));
        }
    }, [targetType, query]);

    return <></>;
};

export default Suspension;
