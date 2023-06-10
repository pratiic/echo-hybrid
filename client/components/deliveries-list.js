import { useSelector, useDispatch } from "react-redux";

import { setPage } from "../redux/slices/delivery-slice";

import ContentList from "./content-list";

const DeliveriesList = ({ type }) => {
    const {
        pending,
        completed,
        loading,
        loadingMore,
        error,
        pendingPage,
        completedPage,
        noMoreData,
        PAGE_SIZE,
    } = useSelector((state) => state.delivery);
    const dispatch = useDispatch();

    const incrementPageNumber = (deliveryType) => {
        dispatch(
            setPage({
                type: deliveryType,
                page:
                    deliveryType === "pending"
                        ? pendingPage + 1
                        : completedPage + 1,
            })
        );
    };

    const getPageNumberIncrementer = (deliveryType) => {
        if (deliveryType === "pending") {
            if (
                pending?.length >= PAGE_SIZE[deliveryType] &&
                !noMoreData["pending"]
            ) {
                return () => {
                    incrementPageNumber("pending");
                };
            }
        } else {
            if (
                completed?.length >= PAGE_SIZE[deliveryType] &&
                !noMoreData["completed"]
            ) {
                return () => {
                    incrementPageNumber("completed");
                };
            }
        }
    };

    return (
        <ContentList
            list={type === "pending" ? pending : completed}
            type={type === "pending" ? "order" : "delivery"}
            loadingMsg={loading[type] && `loading ${type} deliveries...`}
            error={error[type]}
            emptyMsg={`no ${type} deliveries`}
            human="no-items"
            incrementPageNumber={getPageNumberIncrementer(type)}
            loadingMore={loadingMore[type]}
        />
    );
};

export default DeliveriesList;
