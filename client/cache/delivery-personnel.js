import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setDeliveryPersonnelProp } from "../redux/slices/delivery-slice";

const DeliveryPersonnel = () => {
    const {
        personnel: { needToFetch, query },
    } = useSelector((state) => state.delivery);

    const dispatch = useDispatch();

    useEffect(() => {
        if (!needToFetch) {
            dispatch(
                setDeliveryPersonnelProp({ prop: "needToFetch", value: true })
            );
        }
    }, [query]);

    return <></>;
};

export default DeliveryPersonnel;
