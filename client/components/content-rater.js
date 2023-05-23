import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetcher } from "../lib/fetcher";
import { closeModal, showLoadingModal } from "../redux/slices/modal-slice";
import { setAlert, setErrorAlert } from "../redux/slices/alerts-slice";

import Rating from "./rating";
import Button from "./button";
import InputGroup from "./input-group";

const ContentRater = ({ content: { id, name, type }, onRate }) => {
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
            onRate(data.content);

            // send a notification to the owner of the content
            const notification = {
                text: `${authUser.username} gave a rating of ${rating} to your ${type} - ${name}`,
                destinationId: data.contentOwnerId,
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
            <div className="flex items-end">
                <div className="mr-5">
                    <Rating onlyStars avgRating={rating} minAvgRating={1} />
                    <div className="-mb-5 mt-2">
                        <InputGroup
                            view="number"
                            value={rating}
                            min={1}
                            max={5}
                            step={0.5}
                            onChange={setRating}
                        />
                    </div>
                </div>
                <Button>rate</Button>
            </div>
        </form>
    );
};

export default ContentRater;
