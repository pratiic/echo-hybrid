import React, { useState, useEffect } from "react";
import { MdOutlineStar, MdStarOutline } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { TrashIcon } from "@heroicons/react/outline";

import {
    closeModal,
    showConfirmationModal,
    showGenericModal,
    showLoadingModal,
} from "../redux/slices/modal-slice";
import { singularOrPlural } from "../lib/strings";
import { fetcher } from "../lib/fetcher";
import { setAlert, setErrorAlert } from "../redux/slices/alerts-slice";

import Button from "./button";
import TargetRater from "./target-rater";
// import UsersContainer from "./users-container";
import Icon from "./icon";

const Rating = ({
    rating: provRating,
    ratings = [],
    small,
    onlyStars,
    target,
    userCanRate,
    minRating = 0,
    isTargetBusiness,
    onRate,
}) => {
    const { authUser } = useSelector((state) => state.auth);
    const { activeProduct } = useSelector((state) => state.products);
    const [authUserRating, setAuthUserRating] = useState(null);
    const [rating, setRating] = useState(1);

    const dispatch = useDispatch();
    const router = useRouter();

    const fraction = rating - Math.floor(rating);
    const ratingPercentage = Math.floor(fraction * 100);
    const colorBlue = "#1C9BEF";
    const targetType = router.pathname.includes("products")
        ? "product"
        : "store";

    useEffect(() => {
        if (provRating < minRating) {
            setRating(1);
        } else if (provRating > 5) {
            setRating(5);
        } else {
            setRating(provRating);
        }
    }, [provRating, minRating]);

    useEffect(() => {
        setAuthUserRating(
            ratings.find((rating) => rating.userId === authUser.id)
        );
    }, [ratings]);

    const getFilledStar = (percentage) => {
        return (
            <svg
                height={small ? "16" : "21"}
                viewBox="0 0 24 24"
                width={small ? "16" : "21"}
                className="mx-[3px]"
            >
                <defs>
                    <linearGradient id="grad">
                        <stop offset="0%" stop-color={colorBlue} />
                        <stop
                            offset={`${percentage}%`}
                            stop-color={colorBlue}
                        />
                        <stop offset={`${percentage}%`} stop-color="white" />
                        <stop offset="100%" stop-color="white" />
                    </linearGradient>
                </defs>
                <path d="M0 0h24v24H0z" fill="none" />
                <path
                    fill="url(#grad)"
                    stroke="#1C9BEF"
                    stroke-width="2"
                    d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                />
                <path d="M0 0h24v24H0z" fill="none" />
            </svg>
        );
    };

    const getRemainingStars = () => {
        let remainingStars;

        if (ratingPercentage > 0) {
            remainingStars = 5 - Math.floor(rating) - 1;

            if (remainingStars < 0) {
                remainingStars = 0;
            }
        } else {
            remainingStars = 5 - Math.floor(rating);
        }

        if (remainingStars < 0) {
            remainingStars = 0;
        }

        return remainingStars;
    };

    const handleRateClick = () => {
        dispatch(
            showGenericModal(
                <TargetRater
                    target={{ ...target, type: targetType }}
                    isTargetBusiness={isTargetBusiness}
                    onRate={onRate}
                />
            )
        );
    };

    const handleDeleteClick = () => {
        dispatch(
            showConfirmationModal({
                message: "are you sure you want to delete your rating ?",
                handler: async () => {
                    dispatch(showLoadingModal("deleting your rating..."));

                    try {
                        const data = await fetcher(
                            `ratings/${authUserRating?.id}`,
                            "DELETE"
                        );

                        dispatch(
                            setAlert({ message: "you rating has been deleted" })
                        );
                        onRate(data.target);
                    } catch (error) {
                        console.log(error);
                        dispatch(setErrorAlert(error.message));
                    } finally {
                        dispatch(closeModal());
                    }
                },
            })
        );
    };

    const viewRatings = () => {
        // dispatch(
        //     showGenericModal(
        //         <UsersContainer
        //             title={`${capitalizeFirstLetter(targetType)} ratings`}
        //             targetType="ratings"
        //             url={`ratings/${targetType}/${target.id}`}
        //         />
        //     )
        // );
    };

    return (
        <div>
            {!onlyStars && (
                <span className="black-white">Rated {rating} / 5</span>
            )}

            <div className={`flex items-center w-fit ${!onlyStars && "my-1"}`}>
                {[...Array(Math.floor(rating) || 0)].map((star, i) => {
                    return (
                        <MdOutlineStar
                            key={i}
                            className={
                                small
                                    ? "icon-star-small-blue"
                                    : "icon-star-blue"
                            }
                        />
                    );
                })}

                {ratingPercentage > 0 && getFilledStar(ratingPercentage)}

                {[...Array(getRemainingStars() || 0)].map((star, i) => {
                    return (
                        <MdStarOutline
                            key={i}
                            className={small ? "icon-star-small" : "icon-star"}
                        />
                    );
                })}
            </div>

            {!onlyStars && (
                <React.Fragment>
                    <div
                        className={`flex flex-wrap items-center dark-light ${ratings.length >
                            0 && "mt-2"}`}
                    >
                        <span className="block mb-1 mr-3 text-sm">
                            By {ratings?.length}{" "}
                            {singularOrPlural(ratings, "user", "users")}
                        </span>

                        {/* {ratings.length > 0 && (
                            <Button
                                small
                                type="tertiary"
                                rounded={false}
                                onClick={viewRatings}
                            >
                                view ratings
                            </Button>
                        )} */}
                    </div>

                    {/* show only if the auth user can rate */}
                    {userCanRate && (
                        <div className="mt-2 dark-light">
                            {authUserRating ? (
                                // auth user has already rated
                                <p className="flex items-center -mt-2">
                                    Your rating
                                    <span className="ml-2">
                                        {authUserRating.stars} / 5{" "}
                                    </span>
                                    <Icon
                                        className="ml-2"
                                        toolName="delete rating"
                                        onClick={handleDeleteClick}
                                    >
                                        <TrashIcon className="icon-small" />
                                    </Icon>
                                </p>
                            ) : (
                                // auth user has not rated
                                <React.Fragment>
                                    <span className="block mb-2">
                                        You have not rated this{" "}
                                        {targetType === "product"
                                            ? targetType
                                            : "seller"}
                                    </span>
                                    <Button small onClick={handleRateClick}>
                                        rate it
                                    </Button>
                                </React.Fragment>
                            )}
                        </div>
                    )}
                </React.Fragment>
            )}
        </div>
    );
};

export default Rating;
