import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetcher } from "../lib/fetcher";
import { closeModal, showLoadingModal } from "../redux/slices/modal-slice";
import { setAlert, setErrorAlert } from "../redux/slices/alerts-slice";

import Rating from "./rating";
import Button from "./button";
import InputGroup from "./input-group";
import { capitalizeFirstLetter } from "../lib/strings";

const TargetRater = ({ target: { id, name, type }, onRate }) => {
    const [rating, setRating] = useState(1);

    const dispatch = useDispatch();
    const { authUser } = useSelector((state) => state.auth);

    const handleFormSubmit = async () => {
        dispatch(showLoadingModal(`rating ${name}...`));

        try {
            const data = await fetcher(`ratings/${type}/${id}`, "POST", {
                stars: rating,
            });

            dispatch(
                setAlert({
                    message: "your rating has been posted",
                    type: "success",
                })
            );
            onRate(data.target);

            // send a notification to the user of the target
            const notification = {
                text: `${capitalizeFirstLetter(
                    authUser.firstName
                )} ${capitalizeFirstLetter(
                    authUser.lastName
                )} gave a rating of ${rating} to your ${type} - ${name}`,
                destinationId: data.targetUserId,
                linkTo: `/${type}s/${id}`,
            };

            fetcher("notifications", "POST", notification);
        } catch (error) {
            dispatch(setErrorAlert(error.message));
        } finally {
            dispatch(closeModal());
        }
    };

    return (
        <form onSubmit={handleFormSubmit}>
            <h3 className="heading-generic-modal-thin max-w-[300px]">
                Rate {name}
            </h3>
            <div>
                <Rating onlyStars rating={rating} minAvgRating={1} />
                <div className="flex space-x-5 mt-5">
                    <InputGroup
                        view="number"
                        value={rating}
                        min={1}
                        max={5}
                        step={0.5}
                        className="mb-0"
                        onChange={setRating}
                    />
                    <Button>rate</Button>
                </div>
            </div>
        </form>
    );
};

export default TargetRater;
