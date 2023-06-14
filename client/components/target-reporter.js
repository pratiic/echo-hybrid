import { useState } from "react";
import { useDispatch } from "react-redux";

import { setAlert } from "../redux/slices/alerts-slice";
import { fetcher } from "../lib/fetcher";
import { closeModal } from "../redux/slices/modal-slice";

import InputGroup from "./input-group";
import Button from "./button";

const TargetReporter = ({ targetType, targetId }) => {
    const [cause, setCause] = useState("");
    const [reporting, setReporting] = useState(false);
    const [error, setError] = useState("");

    const dispatch = useDispatch();

    const handleContinueClick = async () => {
        setReporting(true);
        setError("");

        try {
            await fetcher(
                `reports/${
                    targetType === "seller" ? "store" : targetType
                }/${targetId}`,
                "POST",
                {
                    cause,
                }
            );

            dispatch(
                setAlert({ message: `the ${targetType} has been reported` })
            );
            dispatch(closeModal());
        } catch (error) {
            setError(error.message);
        } finally {
            setReporting(false);
        }
    };

    return (
        <div className="max-w-[350px]">
            <h3 className="modal-title">Report {targetType}</h3>

            <div className="dark-light space-y-1 mb-3">
                <p>
                    Please provide the reason for reporting this {targetType}.
                </p>
                <p>
                    Note that once we investigate based on your report, the{" "}
                    {targetType} may end up getting{" "}
                    {targetType === "review" ? "deleted" : "suspended"}.
                </p>
            </div>

            <InputGroup
                placeholder="min 20 chars, max 150 chars"
                view="textarea"
                value={cause}
                error={error}
                minChars={20}
                maxChars={150}
                onChange={setCause}
            />

            <Button onClick={handleContinueClick} disabled={reporting}>
                continue
            </Button>
        </div>
    );
};

export default TargetReporter;
