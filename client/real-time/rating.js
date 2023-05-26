// handle real-time rating of products or sellers

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";

import useSocket from "../hooks/use-socket";
import { updateActiveProduct } from "../redux/slices/products-slice";

const Rating = () => {
    const { activeProduct } = useSelector((state) => state.products);
    const socket = useSocket();
    const dispatch = useDispatch();
    const router = useRouter();

    useEffect(() => {
        if (activeProduct && router.pathname === "/products/[id]") {
            socket.on("rating", (ratingInfo) => {
                const { rating, ratingNum } = ratingInfo;

                if (rating.productId === parseInt(router.query.id)) {
                    dispatch(
                        updateActiveProduct({
                            rating: ratingNum,
                            ratings: [...activeProduct?.ratings, rating],
                        })
                    );
                }
            });

            socket.on("rating-delete", (ratingInfo) => {
                const { id, ratingNum, targetId } = ratingInfo;

                if (targetId === parseInt(router.query.id)) {
                    dispatch(
                        updateActiveProduct({
                            rating: ratingNum,
                            ratings: activeProduct?.ratings.filter(
                                (rating) => rating.id !== id
                            ),
                        })
                    );
                }
            });
        }
    }, [activeProduct, router]);

    return <></>;
};

export default Rating;
