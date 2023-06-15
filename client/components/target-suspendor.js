import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { capitalizeFirstLetter } from "../lib/strings";
import { fetcher } from "../lib/fetcher";
import { setAlert } from "../redux/slices/alerts-slice";
import { closeModal } from "../redux/slices/modal-slice";
import {
    addSuspension,
    setSuspensionsProp,
} from "../redux/slices/suspensions-slice";

import OptionsToggle from "./options-toggle";
import InputGroup from "./input-group";
import Button from "./button";
import { updateDeliveryPersonnel } from "../redux/slices/delivery-slice";

const TargetSuspendor = () => {
    const [targetId, setTargetId] = useState(undefined);
    const [targetType, setTargetType] = useState("product");
    const [cause, setCause] = useState("");
    const [suspending, setSuspending] = useState(false);
    const [error, setError] = useState("");

    const { targetType: suspensionsListTargetType } = useSelector(
        (state) => state.suspensions
    );

    const dispatch = useDispatch();
    const targetOptions = [
        {
            name: "product",
        },
        {
            name: "seller",
        },
        {
            name: "user",
        },
    ];
    const messageMap = {
        product:
            "the product will only be accessible to the owner and the admin. It cannot be bought or sold until it is reinstated.",
        seller:
            "when a seller is suspended, the seller will no longer be able to sell any new products until they are reinstated.",
        user:
            "when a user is suspended, they will not be able to perform any action until they are reinstated.",
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        if (!targetId) {
            return setError(`${targetType} Id cannot be empty`);
        }

        setSuspending(true);
        setError("");

        try {
            const data = await fetcher(
                `suspensions/${
                    targetType === "seller" ? "store" : targetType
                }/${targetId}/?action=suspend`,
                "POST",
                {
                    cause,
                }
            );

            if (
                suspensionsListTargetType === targetType ||
                suspensionsListTargetType === "all"
            ) {
                dispatch(addSuspension(data.suspension));
            }

            // if a delivery personnel was suspended, update them
            if (targetType === "user") {
                dispatch(
                    updateDeliveryPersonnel({
                        id: data.suspension.user.id,
                        updateInfo: { suspension: { id: data.suspension.id } },
                    })
                );
            }

            dispatch(
                setAlert({ message: `the ${targetType} has been suspended` })
            );
            dispatch(closeModal());
        } catch (error) {
            setError(error.message);
        } finally {
            setSuspending(false);
        }
    };

    return (
        <div className="w-[300px]">
            <h3 className="modal-title mb-3">
                {capitalizeFirstLetter(targetType)} suspension
            </h3>

            <div className="flex items-center space-x-5 mb-3">
                <span className="dark-light">Suspend</span>

                <OptionsToggle
                    options={targetOptions}
                    type="dropdown"
                    active={targetType}
                    onClick={(targetType) => setTargetType(targetType)}
                />
            </div>

            <p className="dark-light first-letter:capitalize mb-3">
                {messageMap[targetType]}
            </p>

            <form onSubmit={handleFormSubmit}>
                <InputGroup
                    label={`${targetType} Id`}
                    placeholder={`Id of the ${targetType} to suspend`}
                    value={targetId}
                    onChange={setTargetId}
                />

                <InputGroup
                    label="Cause for suspension"
                    placeholder="min 20 chars max 150 chars"
                    view="textarea"
                    minChars={20}
                    maxChars={150}
                    value={cause}
                    onChange={setCause}
                />

                {error && (
                    <p className="error -mt-4 mb-3">
                        {capitalizeFirstLetter(error)}
                    </p>
                )}

                <Button disabled={suspending}>
                    {suspending ? "suspending" : "suspend"}
                </Button>
            </form>
        </div>
    );
};

export default TargetSuspendor;
